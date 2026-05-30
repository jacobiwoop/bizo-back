<?php

namespace App\Http\Controllers;

use App\Http\Resources\LocationResource;
use App\Http\Resources\PendingLocationResource;
use App\Http\Resources\PlaceResource;
use App\Models\Location;
use App\Models\PendingLocation;
use App\Models\Place;
use App\Services\LocationEnrichmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class LocationController extends Controller
{
    private const PLACE_DISTANCE_SQL = '(6371 * acos(cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?)) + sin(radians(?)) * sin(radians(lat))))';

    public function __construct(
        private readonly LocationEnrichmentService $locationEnrichmentService,
    ) {}

    public function search(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:5'],
            'type' => ['nullable', 'string', 'in:country,city,district'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
            'include_places' => ['nullable', 'boolean'],
            'enrich' => ['nullable', 'boolean'],
        ]);

        $query = trim($validated['q'] ?? '');
        $country = strtoupper($validated['country'] ?? 'BJ');
        $limit = min((int) ($validated['limit'] ?? 20), 50);
        $slug = $query !== '' ? Location::normalizeName($query) : null;

        $locations = Location::query()
            ->with('parent')
            ->where('country_code', $country)
            ->when($validated['type'] ?? null, fn ($builder, $type) => $builder->where('type', $type))
            ->when($slug, function ($builder) use ($query, $slug) {
                $builder->where(function ($nested) use ($query, $slug) {
                    $nested->where('slug', 'like', "%{$slug}%")
                        ->orWhere('name', 'like', "%{$query}%");
                });
            })
            ->orderByDesc('is_verified')
            ->orderByRaw("CASE type WHEN 'city' THEN 1 WHEN 'district' THEN 2 ELSE 3 END")
            ->orderBy('name')
            ->limit($limit)
            ->get();

        if ($request->boolean('enrich') && $query !== '' && $locations->count() < $limit) {
            $locations = $locations
                ->merge($this->locationEnrichmentService->enrichLocations(
                    $query,
                    $country,
                    $validated['type'] ?? null,
                    $limit - $locations->count()
                ))
                ->unique('id')
                ->values()
                ->take($limit);
        }

        $places = collect();

        if ($request->boolean('include_places')) {
            $places = Place::query()
                ->with('location')
                ->where('country_code', $country)
                ->when($slug, function ($builder) use ($query, $slug) {
                    $builder->where(function ($nested) use ($query, $slug) {
                        $nested->where('slug', 'like', "%{$slug}%")
                            ->orWhere('name', 'like', "%{$query}%");
                    });
                })
                ->orderByDesc('is_verified')
                ->orderBy('name')
                ->limit($limit)
                ->get();

            if ($request->boolean('enrich') && $query !== '' && $places->count() < $limit) {
                $places = $places
                    ->merge($this->locationEnrichmentService->enrichPlaces(
                        $query,
                        $country,
                        null,
                        null,
                        null,
                        5,
                        $limit - $places->count()
                    ))
                    ->unique('id')
                    ->values()
                    ->take($limit);
            }
        }

        return response()->json([
            'data' => [
                'locations' => LocationResource::collection($locations),
                'places' => PlaceResource::collection($places),
            ],
        ]);
    }

    public function cities(Request $request): AnonymousResourceCollection
    {
        $country = strtoupper($request->query('country', 'BJ'));

        $cities = Location::query()
            ->where('country_code', $country)
            ->where('type', 'city')
            ->orderByDesc('is_verified')
            ->orderBy('name')
            ->get();

        return LocationResource::collection($cities);
    }

    public function reverse(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'lat' => ['required', 'numeric', 'between:-90,90'],
            'lng' => ['required', 'numeric', 'between:-180,180'],
            'country' => ['nullable', 'string', 'max:5'],
        ]);

        $result = $this->locationEnrichmentService->reverseGeocode(
            (float) $validated['lat'],
            (float) $validated['lng'],
            strtoupper($validated['country'] ?? 'BJ')
        );

        if (! $result) {
            return response()->json([
                'message' => 'Aucune localisation trouvée pour cette position.',
            ], 404);
        }

        return response()->json([
            'data' => [
                'label' => $result['label'],
                'location' => $result['location'] ? new LocationResource($result['location']) : null,
                'place' => $result['place'] ? new PlaceResource($result['place']) : null,
                'display_lat' => $result['display_lat'],
                'display_lng' => $result['display_lng'],
                'location_accuracy' => 'exact',
            ],
        ]);
    }

    public function districts(string $id): AnonymousResourceCollection
    {
        $districts = Location::query()
            ->where('parent_id', $id)
            ->where('type', 'district')
            ->orderByDesc('is_verified')
            ->orderBy('name')
            ->get();

        return LocationResource::collection($districts);
    }

    public function places(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:120'],
            'country' => ['nullable', 'string', 'max:5'],
            'category' => ['nullable', 'string', 'max:60'],
            'location_id' => ['nullable', 'uuid', 'exists:locations,id'],
            'lat' => ['nullable', 'numeric', 'between:-90,90'],
            'lng' => ['nullable', 'numeric', 'between:-180,180'],
            'radius_km' => ['nullable', 'numeric', 'min:0.1', 'max:50'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
            'enrich' => ['nullable', 'boolean'],
        ]);

        $query = trim($validated['q'] ?? '');
        $country = strtoupper($validated['country'] ?? 'BJ');
        $slug = $query !== '' ? Location::normalizeName($query) : null;
        $limit = min((int) ($validated['limit'] ?? 20), 50);

        $places = Place::query()
            ->with('location')
            ->where('country_code', $country)
            ->when($validated['category'] ?? null, fn ($builder, $category) => $builder->where('category', $category))
            ->when($validated['location_id'] ?? null, fn ($builder, $locationId) => $builder->where('location_id', $locationId))
            ->when($slug, function ($builder) use ($query, $slug) {
                $builder->where(function ($nested) use ($query, $slug) {
                    $nested->where('slug', 'like', "%{$slug}%")
                        ->orWhere('name', 'like', "%{$query}%");
                });
            });

        if (isset($validated['lat'], $validated['lng'])) {
            $lat = (float) $validated['lat'];
            $lng = (float) $validated['lng'];
            $radiusKm = (float) ($validated['radius_km'] ?? 5);

            $places
                ->whereNotNull('lat')
                ->whereNotNull('lng')
                ->selectRaw('places.*, '.self::PLACE_DISTANCE_SQL.' as distance_km', [$lat, $lng, $lat])
                ->whereRaw(self::PLACE_DISTANCE_SQL.' <= ?', [$lat, $lng, $lat, $radiusKm])
                ->orderBy('distance_km');
        } else {
            $places->orderByDesc('is_verified')->orderBy('name');
        }

        $results = $places->limit($limit)->get();

        if ($request->boolean('enrich') && $results->count() < $limit && ($query !== '' || isset($validated['lat'], $validated['lng']))) {
            $results = $results
                ->merge($this->locationEnrichmentService->enrichPlaces(
                    $query,
                    $country,
                    $validated['category'] ?? null,
                    isset($validated['lat']) ? (float) $validated['lat'] : null,
                    isset($validated['lng']) ? (float) $validated['lng'] : null,
                    (float) ($validated['radius_km'] ?? 5),
                    $limit - $results->count()
                ))
                ->unique('id')
                ->values()
                ->take($limit);
        }

        return PlaceResource::collection($results);
    }

    public function suggest(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:160'],
            'country_code' => ['nullable', 'string', 'max:5'],
            'parent_id' => ['nullable', 'uuid', 'exists:locations,id'],
            'suggested_lat' => ['nullable', 'numeric', 'between:-90,90'],
            'suggested_lng' => ['nullable', 'numeric', 'between:-180,180'],
            'source' => ['nullable', Rule::in(['osm', 'mapbox', 'user', 'admin', 'import'])],
        ]);

        $country = strtoupper($validated['country_code'] ?? 'BJ');
        $normalizedName = Location::normalizeName($validated['name']);

        $pending = PendingLocation::query()->firstOrNew([
            'country_code' => $country,
            'parent_id' => $validated['parent_id'] ?? null,
            'normalized_name' => $normalizedName,
        ]);

        if ($pending->exists) {
            $pending->increment('usage_count');
            $pending->refresh();
        } else {
            $pending->fill([
                'name' => $validated['name'],
                'suggested_lat' => $validated['suggested_lat'] ?? null,
                'suggested_lng' => $validated['suggested_lng'] ?? null,
                'source' => $validated['source'] ?? 'user',
                'usage_count' => 1,
                'status' => 'pending',
            ])->save();
        }

        return response()->json([
            'data' => new PendingLocationResource($pending->load('parent')),
        ], $pending->wasRecentlyCreated ? 201 : 200);
    }
}
