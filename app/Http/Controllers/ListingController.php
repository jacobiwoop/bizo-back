<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreListingRequest;
use App\Http\Resources\ListingResource;
use App\Models\Listing;
use App\Services\StorageService;
use App\Support\ListingCategory;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ListingController extends Controller
{
    public function __construct(
        private readonly StorageService $storageService,
    ) {}

    /**
     * Feed principal avec filtres.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Listing::active()
            ->with('owner')
            ->when(ListingCategory::normalize($request->category), fn ($q, $v) => $q->where('category', $v))
            ->when($request->type, fn ($q, $v) => $q->where('type', $v))
            ->when($request->condition, fn ($q, $v) => $q->where('condition', $v))
            ->when($request->country, fn ($q, $v) => $q->where('country', $v))
            ->when($request->city, fn ($q, $v) => $q->where('city', $v))
            ->when($request->min_price, fn ($q, $v) => $q->where('price', '>=', $v))
            ->when($request->max_price, fn ($q, $v) => $q->where('price', '<=', $v));

        $listings = $query->orderBy('is_boosted', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(min($request->integer('per_page', 20), 50));

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

        $listing = Listing::create([
            'owner_id' => $request->user()->id,
            'title' => $request->title,
            'description' => $request->description,
            'type' => $request->type,
            'price' => $request->price,
            'cash_complement' => $request->cash_complement,
            'exchange_for' => $request->type !== 'VENTE' ? $request->exchange_for : null,
            'category' => $request->category,
            'condition' => $request->condition,
            'delivery_mode' => $request->delivery_mode,
            'photos' => $photos,
            'country' => $request->country,
            'city' => $request->city,
            'neighborhood' => $request->neighborhood,
            'tags' => $request->tags ?? [],
            'expires_at' => now()->addDays(30),
        ]);

        $listing = $listing->fresh()->load('owner');

        return response()->json([
            'data' => new ListingResource($listing),
        ], 201);
    }

    /**
     * Détail d'une annonce.
     */
    public function show(string $id): ListingResource
    {
        $listing = Listing::with('owner')->findOrFail($id);

        $listing->increment('view_count');

        return new ListingResource($listing->fresh()->load('owner'));
    }

    /**
     * Modifier une annonce.
     */
    public function update(Request $request, string $id): ListingResource
    {
        $listing = Listing::with('owner')->findOrFail($id);

        if ($request->user()->id !== $listing->owner_id) {
            throw new AuthorizationException();
        }

        $type = $request->input('type', $listing->type);
        $isChangingType = $request->has('type');

        $request->merge([
            'category' => ListingCategory::normalize($request->input('category')),
        ]);

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'min:5', 'max:80'],
            'description' => ['sometimes', 'string', 'min:20', 'max:500'],
            'type' => ['sometimes', 'string', 'in:VENTE,TROC,TROC_CASH'],
            'price' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'cash_complement' => ['nullable', 'integer', 'min:0'],
            'exchange_for' => ['sometimes', 'nullable', 'string', 'max:255'],
            'category' => ['sometimes', 'string', Rule::in(ListingCategory::values())],
            'condition' => ['sometimes', 'string', 'in:neuf,excellent,bon,correct'],
            'delivery_mode' => ['sometimes', 'string', 'in:main_propre,livraison,les_deux'],
            'country' => ['sometimes', 'string', 'max:5'],
            'city' => ['sometimes', 'string', 'max:80'],
            'neighborhood' => ['nullable', 'string', 'max:80'],
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

        $listing->update($validated);

        return new ListingResource($listing->fresh()->load('owner'));
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
            'data' => new ListingResource($listing->fresh()->load('owner')),
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
            'data' => new ListingResource($listing->fresh()->load('owner')),
        ]);
    }

    /**
     * Mes annonces.
     */
    public function myListings(Request $request): AnonymousResourceCollection
    {
        $listings = Listing::with('owner')
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
            'data' => new ListingResource($listing->fresh()->load('owner')),
        ]);
    }

    /**
     * Renouveler une annonce expirée.
     */
    public function renew(Request $request, string $id): JsonResponse
    {
        $listing = Listing::with('owner')->findOrFail($id);

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
            'data' => new ListingResource($listing->fresh()->load('owner')),
        ]);
    }

    /**
     * Annonces similaires (même catégorie, hors annonce courante).
     */
    public function similar(string $id): AnonymousResourceCollection
    {
        $listing = Listing::findOrFail($id);

        $similar = Listing::active()
            ->with('owner')
            ->where('category', $listing->category)
            ->where('id', '!=', $id)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return ListingResource::collection($similar);
    }
}
