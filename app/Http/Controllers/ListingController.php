<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreListingRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use App\Models\Location;
use App\Models\Place;
use App\Services\StorageService;
use App\Support\ListingCategory;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ListingController extends Controller
{
    private const DISTANCE_SQL = '(6371 * acos(cos(radians(?)) * cos(radians(display_lat)) * cos(radians(display_lng) - radians(?)) + sin(radians(?)) * sin(radians(display_lat))))';

    public function __construct(
        private readonly StorageService $storageService,
    ) {}

    private function buildLocationPayload(array $validated): array
    {
        $payload = [
            'location_id' => $validated['location_id'] ?? null,
            'place_id' => $validated['place_id'] ?? null,
            'exact_lat' => $validated['exact_lat'] ?? null,
            'exact_lng' => $validated['exact_lng'] ?? null,
            'display_lat' => $validated['display_lat'] ?? null,
            'display_lng' => $validated['display_lng'] ?? null,
            'location_accuracy' => $validated['location_accuracy'] ?? 'district',
        ];

        if ($payload['location_accuracy'] === 'exact' && $payload['display_lat'] === null && $payload['exact_lat'] !== null) {
            $payload['display_lat'] = $payload['exact_lat'];
            $payload['display_lng'] = $payload['exact_lng'];
        }

        if (($payload['display_lat'] === null || $payload['display_lng'] === null) && $payload['place_id']) {
            $place = Place::find($payload['place_id']);
            $payload['display_lat'] = $place?->lat;
            $payload['display_lng'] = $place?->lng;
        }

        if (($payload['display_lat'] === null || $payload['display_lng'] === null) && $payload['location_id']) {
            $location = Location::find($payload['location_id']);
            $payload['display_lat'] = $location?->lat;
            $payload['display_lng'] = $location?->lng;
        }

        return $payload;
    }

    /**
     * Feed principal avec filtres.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Listing::active()
            ->with(['owner', 'location', 'place'])
            ->when($request->q, function ($q, $value) {
                $term = mb_strtolower(trim($value));
                $like = "%{$term}%";

                $q->where(function ($subQuery) use ($like) {
                    $subQuery
                        ->where('title_search', 'like', $like)
                        ->orWhere('title', 'like', $like)
                        ->orWhere('description', 'like', $like)
                        ->orWhere('city', 'like', $like)
                        ->orWhere('neighborhood', 'like', $like)
                        ->orWhere('category', 'like', $like);
                });
            })
            ->when(ListingCategory::normalize($request->category), fn ($q, $v) => $q->where('category', $v))
            ->when($request->type, fn ($q, $v) => $q->where('type', $v))
            ->when($request->condition, fn ($q, $v) => $q->where('condition', $v))
            ->when($request->country, fn ($q, $v) => $q->where('country', $v))
            ->when($request->city, fn ($q, $v) => $q->where('city', $v))
            ->when($request->min_price, fn ($q, $v) => $q->where('price', '>=', $v))
            ->when($request->max_price, fn ($q, $v) => $q->where('price', '<=', $v));

        if ($request->filled(['lat', 'lng'])) {
            $lat = (float) $request->query('lat');
            $lng = (float) $request->query('lng');
            $radiusKm = min((float) $request->query('radius_km', 10), 100);

            $query
                ->whereNotNull('display_lat')
                ->whereNotNull('display_lng')
                ->selectRaw('listings.*, '.self::DISTANCE_SQL.' as distance_km', [$lat, $lng, $lat])
                ->whereRaw(self::DISTANCE_SQL.' <= ?', [$lat, $lng, $lat, $radiusKm])
                ->orderBy('distance_km');
        }

        $query->orderBy('is_boosted', 'desc');

        match ($request->query('sort')) {
            'price_asc' => $query->orderByRaw('price IS NULL')->orderBy('price'),
            'price_desc' => $query->orderByRaw('price IS NULL')->orderByDesc('price'),
            default => $query->orderBy('created_at', 'desc'),
        };

        $listings = $query->paginate(min($request->integer('per_page', 20), 50));

        return ListingResource::collection($listings);
    }

    /**
     * Créer une annonce.
     */
    public function store(StoreListingRequest $request): JsonResponse
    {
        $photos = [];
        foreach ($request->file('photos', []) as $photo) {
            $photos[] = $this->storageService->uploadPhoto($photo);
        }

        $locationPayload = $this->buildLocationPayload($request->validated());

        $listing = Listing::create([
            'owner_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'price' => $request->price,
            'cash_complement' => $request->cash_complement,
            'exchange_for' => $request->type !== 'VENTE' ? $request->exchange_for : null,
            'category' => $request->category,
            'attributes' => $request->input('attributes', []),
            'condition' => $request->condition,
            'delivery_mode' => $request->delivery_mode,
            'photos' => $photos,
            'country' => $request->country,
            'city' => $request->city,
            'neighborhood' => $request->neighborhood,
            ...$locationPayload,
            'tags' => $request->tags ?? [],
            'expires_at' => now()->addDays(30),
        ]);

        $listing = $listing->fresh()->load(['owner', 'location', 'place']);

        return response()->json([
            'data' => new ListingResource($listing),
        ], 201);
    }

    /**
     * Détail d'une annonce.
     */
    public function show(string $id): ListingResource
    {
        $listing = Listing::with(['owner', 'location', 'place'])->findOrFail($id);

        $listing->increment('view_count');

        return new ListingResource($listing->fresh()->load(['owner', 'location', 'place']));
    }

    /**
     * Modifier une annonce.
     */
    public function update(Request $request, string $id): ListingResource
    {
        $listing = Listing::with(['owner', 'location', 'place'])->findOrFail($id);

        if ($request->user()->id !== $listing->owner_id) {
            throw new AuthorizationException();
        }

        $type = $request->input('type', $listing->type);
        $isChangingType = $request->has('type');
        $merge = [];

        if ($request->has('category')) {
            $merge['category'] = ListingCategory::normalize($request->input('category'));
        }

        if ($request->has('attributes')) {
            $attributes = $request->input('attributes');

            if (is_string($attributes)) {
                $decodedAttributes = json_decode($attributes, true);
                $attributes = is_array($decodedAttributes) ? $decodedAttributes : $attributes;
            }

            $merge['attributes'] = $attributes;
        }

        if ($merge !== []) {
            $request->merge($merge);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'min:5', 'max:80'],
            'description' => ['sometimes', 'string', 'min:20', 'max:500'],
            'type' => ['sometimes', 'string', 'in:VENTE,TROC,TROC_CASH'],
            'price' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'cash_complement' => ['nullable', 'integer', 'min:0'],
            'exchange_for' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category' => ['sometimes', 'string', Rule::in(ListingCategory::values())],
            'attributes' => ['nullable', 'array'],
            'attributes.*' => ['nullable'],
            'condition' => ['sometimes', 'string', 'in:neuf,excellent,bon,correct'],
            'delivery_mode' => ['sometimes', 'string', 'in:main_propre,livraison,les_deux'],
            'country' => ['sometimes', 'string', 'max:5'],
            'city' => ['sometimes', 'string', 'max:80'],
            'neighborhood' => ['nullable', 'string', 'max:80'],
            'location_id' => ['nullable', 'uuid', 'exists:locations,id'],
            'place_id' => ['nullable', 'uuid', 'exists:places,id'],
            'exact_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'exact_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'display_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'display_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'location_accuracy' => ['nullable', 'string', 'in:exact,district,city'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:30'],
        ]);

        if ($isChangingType) {
            if ($type === 'VENTE' && is_null($validated['price'] ?? null)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'price' => ['Le prix est requis pour une vente.'],
                ]);
            }
            if (in_array($type, ['TROC', 'TROC_CASH'], true) && is_null($validated['exchange_for'] ?? null)) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'exchange_for' => ['Vous devez préciser ce que vous cherchez en échange.'],
                ]);
            }
        }

        $locationKeys = ['location_id', 'place_id', 'exact_lat', 'exact_lng', 'display_lat', 'display_lng', 'location_accuracy'];

        if (array_intersect($locationKeys, array_keys($validated))) {
            $validated = array_merge($validated, $this->buildLocationPayload(array_merge($listing->only($locationKeys), $validated)));
        }

        $listing->update($validated);

        return new ListingResource($listing->fresh()->load(['owner', 'location', 'place']));
    }

    /**
     * Supprimer une annonce.
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);

        if ($request->user()->id !== $listing->owner_id) {
            throw new AuthorizationException();
        }

        if ($listing->photos) {
            $this->storageService->deleteMany($listing->photos);
        }

        $listing->update(['status' => 'deleted']);
        $listing->delete();

        return response()->json(null, 204);
    }

    /**
     * Uploader des photos supplémentaires.
     */
    public function uploadPhotos(Request $request, string $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);

        if ($request->user()->id !== $listing->owner_id) {
            throw new AuthorizationException();
        }

        $existingPhotos = $listing->photos ?? [];

        $request->validate([
            'photos' => ['required', 'array', 'max:10'],
            'photos.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:15360'],
        ]);

        $incomingPhotos = $request->file('photos', []);

        if (count($existingPhotos) + count($incomingPhotos) > 10) {
            return response()->json([
                'message' => 'Maximum 10 photos autorisees par annonce.',
                'errors' => [
                    'photos' => ['Maximum 10 photos autorisees par annonce.'],
                ],
            ], 422);
        }

        $newPhotos = [];

        foreach ($incomingPhotos as $photo) {
            $newPhotos[] = $this->storageService->uploadPhoto($photo);
        }

        $listing->update([
            'photos' => array_merge($existingPhotos, $newPhotos),
        ]);

        return response()->json([
            'data' => new ListingResource($listing->fresh()->load(['owner', 'location', 'place'])),
        ]);
    }

    /**
     * Supprimer une photo spécifique.
     */
    public function deletePhoto(Request $request, string $id, int $index): JsonResponse
    {
        $listing = Listing::findOrFail($id);

        if ($request->user()->id !== $listing->owner_id) {
            throw new AuthorizationException();
        }

        $photos = $listing->photos ?? [];

        if (!isset($photos[$index])) {
            return response()->json(['message' => 'Photo introuvable.'], 404);
        }

        $this->storageService->deleteByUrl($photos[$index]);
        unset($photos[$index]);

        $listing->update(['photos' => array_values($photos)]);

        return response()->json([
            'data' => new ListingResource($listing->fresh()->load(['owner', 'location', 'place'])),
        ]);
    }

    /**
     * Réordonner les photos existantes.
     */
    public function reorderPhotos(Request $request, string $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);

        if ($request->user()->id !== $listing->owner_id) {
            throw new AuthorizationException();
        }

        $validated = $request->validate([
            'photos' => ['required', 'array', 'min:1', 'max:10'],
            'photos.*' => ['required', 'string'],
        ]);

        $currentPhotos = array_values($listing->photos ?? []);
        $nextPhotos = array_values($validated['photos']);

        sort($currentPhotos);
        $sortedNextPhotos = $nextPhotos;
        sort($sortedNextPhotos);

        if ($currentPhotos !== $sortedNextPhotos) {
            return response()->json([
                'message' => 'La liste des photos ne correspond pas aux photos de cette annonce.',
                'errors' => [
                    'photos' => ['La liste des photos ne correspond pas aux photos de cette annonce.'],
                ],
            ], 422);
        }

        $listing->update(['photos' => $nextPhotos]);

        return response()->json([
            'data' => new ListingResource($listing->fresh()->load(['owner', 'location', 'place'])),
        ]);
    }

    /**
     * Mes annonces.
     */
    public function myListings(Request $request): AnonymousResourceCollection
    {
        $listings = Listing::with(['owner', 'location', 'place'])
            ->where('owner_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(min($request->integer('per_page', 20), 50));

        return ListingResource::collection($listings);
    }

    /**
     * Booster une annonce (remet created_at à now pour remonter dans le feed).
     */
    public function boost(Request $request, string $id): JsonResponse
    {
        $listing = Listing::findOrFail($id);

        if ($request->user()->id !== $listing->owner_id) {
            throw new AuthorizationException();
        }

        if ($listing->status !== 'active') {
            return response()->json(['message' => 'Seules les annonces actives peuvent être boostées.'], 400);
        }

        $listing->update([
            'is_boosted' => true,
            'boosted_until' => now()->addDays(7),
        ]);

        return response()->json([
            'data' => new ListingResource($listing->fresh()->load(['owner', 'location', 'place'])),
        ]);
    }

    /**
     * Renouveler une annonce expirée.
     */
    public function renew(Request $request, string $id): JsonResponse
    {
        $listing = Listing::with(['owner', 'location', 'place'])->findOrFail($id);

        if ($request->user()->id !== $listing->owner_id) {
            throw new AuthorizationException();
        }

        if ($listing->status !== 'expired') {
            return response()->json(['message' => 'Seules les annonces expirées peuvent être renouvelées.'], 400);
        }

        $listing->update([
            'status' => 'active',
            'expires_at' => now()->addDays(30),
            'is_boosted' => false,
            'boosted_until' => null,
        ]);

        return response()->json([
            'data' => new ListingResource($listing->fresh()->load(['owner', 'location', 'place'])),
        ]);
    }

    /**
     * Annonces similaires (même catégorie, hors annonce courante).
     */
    public function similar(string $id): AnonymousResourceCollection
    {
        $listing = Listing::findOrFail($id);

        $similar = Listing::active()
            ->with(['owner', 'location', 'place'])
            ->where('category', $listing->category)
            ->where('id', '!=', $id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return ListingResource::collection($similar);
    }
}
