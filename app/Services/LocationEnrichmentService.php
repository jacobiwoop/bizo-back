<?php

namespace App\Services;

use App\Models\Location;
use App\Models\Place;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class LocationEnrichmentService
{
    private const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';

    private const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

    private const MAPBOX_FORWARD_URL = 'https://api.mapbox.com/search/geocode/v6/forward';

    public function enrichLocations(string $query, string $country = 'BJ', ?string $type = null, int $limit = 10): Collection
    {
        $query = trim($query);
        $country = strtoupper($country);

        if ($query === '') {
            return collect();
        }

        $locations = $this->searchOsm($query, $country, $limit)
            ->map(fn (array $item) => $this->storeLocationFromOsm($item, $country, $type))
            ->filter();

        if ($locations->count() < $limit) {
            $locations = $locations->merge(
                $this->searchMapbox($query, $country, $limit - $locations->count())
                    ->map(fn (array $feature) => $this->storeLocationFromMapbox($feature, $country, $type))
                    ->filter()
            );
        }

        return $locations->unique('id')->values();
    }

    public function enrichPlaces(
        ?string $query,
        string $country = 'BJ',
        ?string $category = null,
        ?float $lat = null,
        ?float $lng = null,
        float $radiusKm = 5,
        int $limit = 10
    ): Collection {
        $query = trim((string) $query);
        $country = strtoupper($country);

        if ($lat !== null && $lng !== null) {
            $places = $this->searchOsmNearby($lat, $lng, $radiusKm, $category, $limit)
                ->map(fn (array $element) => $this->storePlaceFromOverpass($element, $country))
                ->filter();

            if ($places->count() >= $limit || $query === '') {
                return $places->unique('id')->values();
            }
        } else {
            $places = collect();
        }

        if ($query === '') {
            return $places->unique('id')->values();
        }

        $remaining = max($limit - $places->count(), 1);

        $places = $places->merge(
            $this->searchOsm($query, $country, $remaining)
                ->map(fn (array $item) => $this->storePlaceFromOsm($item, $country, $category))
                ->filter()
        );

        if ($places->count() < $limit) {
            $places = $places->merge(
                $this->searchMapbox($query, $country, $limit - $places->count(), $lat, $lng)
                    ->map(fn (array $feature) => $this->storePlaceFromMapbox($feature, $country, $category))
                    ->filter()
            );
        }

        return $places->unique('id')->values();
    }

    private function searchOsm(string $query, string $country, int $limit): Collection
    {
        $userAgent = config('services.location.osm_user_agent');

        if (! $userAgent) {
            return collect();
        }

        try {
            $response = Http::acceptJson()
                ->withHeaders(['User-Agent' => $userAgent])
                ->timeout(6)
                ->retry(1, 200)
                ->get(self::NOMINATIM_SEARCH_URL, [
                    'q' => $query,
                    'format' => 'jsonv2',
                    'addressdetails' => 1,
                    'limit' => $limit,
                    'countrycodes' => strtolower($country),
                ]);
        } catch (ConnectionException) {
            return collect();
        }

        if (! $response->ok() || ! is_array($response->json())) {
            return collect();
        }

        return collect($response->json());
    }

    private function searchOsmNearby(float $lat, float $lng, float $radiusKm, ?string $category, int $limit): Collection
    {
        $userAgent = config('services.location.osm_user_agent');

        if (! $userAgent) {
            return collect();
        }

        $radiusMeters = (int) min(max($radiusKm * 1000, 100), 50000);
        $filters = $this->overpassFilters($category);
        $selectors = collect($filters)
            ->flatMap(fn (string $filter) => [
                "node(around:{$radiusMeters},{$lat},{$lng}){$filter};",
                "way(around:{$radiusMeters},{$lat},{$lng}){$filter};",
                "relation(around:{$radiusMeters},{$lat},{$lng}){$filter};",
            ])
            ->implode('');

        $query = "[out:json][timeout:8];({$selectors});out center tags {$limit};";

        try {
            $response = Http::acceptJson()
                ->withHeaders(['User-Agent' => $userAgent])
                ->timeout(10)
                ->retry(1, 200)
                ->asForm()
                ->post(self::OVERPASS_URL, ['data' => $query]);
        } catch (ConnectionException) {
            return collect();
        }

        if (! $response->ok()) {
            return collect();
        }

        return collect($response->json('elements', []))->take($limit);
    }

    private function searchMapbox(string $query, string $country, int $limit, ?float $lat = null, ?float $lng = null): Collection
    {
        $token = config('services.location.mapbox_token');

        if (! $token) {
            return collect();
        }

        $params = [
            'q' => $query,
            'access_token' => $token,
            'country' => strtolower($country),
            'limit' => min(max($limit, 1), 10),
            'language' => 'fr',
        ];

        if ($lat !== null && $lng !== null) {
            $params['proximity'] = "{$lng},{$lat}";
        }

        try {
            $response = Http::acceptJson()
                ->timeout(6)
                ->retry(1, 200)
                ->get(self::MAPBOX_FORWARD_URL, $params);
        } catch (ConnectionException) {
            return collect();
        }

        if (! $response->ok()) {
            return collect();
        }

        return collect($response->json('features', []));
    }

    private function storeLocationFromOsm(array $item, string $country, ?string $forcedType = null): ?Location
    {
        $name = $item['name'] ?? $item['display_name'] ?? null;
        $lat = $item['lat'] ?? null;
        $lng = $item['lon'] ?? null;
        $type = $forcedType ?: $this->locationTypeFromOsm($item);

        if (! $name || ! $type) {
            return null;
        }

        $parent = $type === 'district' ? $this->resolveParentCityFromAddress($item['address'] ?? [], $country) : null;
        $externalId = $this->osmExternalId($item);

        $location = $externalId
            ? Location::firstOrNew(['source' => 'osm', 'external_id' => $externalId])
            : Location::firstOrNew([
                'type' => $type,
                'parent_id' => $parent?->id,
                'country_code' => $country,
                'slug' => Location::normalizeName($name),
            ]);

        $location->fill([
            'name' => $name,
            'type' => $type,
            'parent_id' => $parent?->id,
            'country_code' => $country,
            'lat' => $lat,
            'lng' => $lng,
            'source' => 'osm',
            'external_id' => $externalId,
            'confidence' => isset($item['importance']) ? round((float) $item['importance'], 2) : null,
            'is_verified' => false,
        ])->save();

        return $location->load('parent');
    }

    private function storePlaceFromOsm(array $item, string $country, ?string $forcedCategory = null): ?Place
    {
        $name = $item['name'] ?? null;
        $lat = $item['lat'] ?? null;
        $lng = $item['lon'] ?? null;

        if (! $name || $lat === null || $lng === null) {
            return null;
        }

        $externalId = $this->osmExternalId($item);
        $location = $this->resolveBestLocationFromAddress($item['address'] ?? [], $country);
        $category = $forcedCategory ?: $this->categoryFromOsm($item);

        $place = $externalId
            ? Place::firstOrNew(['source' => 'osm', 'external_id' => $externalId])
            : Place::firstOrNew([
                'country_code' => $country,
                'slug' => Location::normalizeName($name),
                'lat' => $lat,
                'lng' => $lng,
            ]);

        $place->fill([
            'name' => $name,
            'category' => $category,
            'location_id' => $location?->id,
            'country_code' => $country,
            'lat' => $lat,
            'lng' => $lng,
            'source' => 'osm',
            'external_id' => $externalId,
            'confidence' => isset($item['importance']) ? round((float) $item['importance'], 2) : null,
            'is_verified' => false,
            'tags' => array_filter([
                'class' => $item['class'] ?? null,
                'type' => $item['type'] ?? null,
                'display_name' => $item['display_name'] ?? null,
            ]),
        ])->save();

        return $place->load('location');
    }

    private function storePlaceFromOverpass(array $element, string $country): ?Place
    {
        $tags = $element['tags'] ?? [];
        $name = $tags['name'] ?? $tags['name:fr'] ?? null;
        $lat = $element['lat'] ?? $element['center']['lat'] ?? null;
        $lng = $element['lon'] ?? $element['center']['lon'] ?? null;

        if (! $name || $lat === null || $lng === null) {
            return null;
        }

        $category = $tags['amenity'] ?? $tags['shop'] ?? $tags['office'] ?? $tags['tourism'] ?? $tags['leisure'] ?? 'place';
        $externalId = "{$element['type']}:{$element['id']}";

        $place = Place::firstOrNew(['source' => 'osm', 'external_id' => $externalId]);
        $place->fill([
            'name' => $name,
            'category' => $category,
            'country_code' => $country,
            'lat' => $lat,
            'lng' => $lng,
            'source' => 'osm',
            'external_id' => $externalId,
            'confidence' => null,
            'is_verified' => false,
            'tags' => $tags,
        ])->save();

        return $place;
    }

    private function storeLocationFromMapbox(array $feature, string $country, ?string $forcedType = null): ?Location
    {
        $properties = $feature['properties'] ?? [];
        $name = $properties['name'] ?? $feature['text'] ?? null;
        $coordinates = $this->mapboxCoordinates($feature);
        $type = $forcedType ?: $this->locationTypeFromMapbox($properties);

        if (! $name || ! $coordinates || ! $type) {
            return null;
        }

        $parent = $type === 'district' ? $this->resolveParentCityFromMapbox($properties, $country) : null;
        $externalId = $properties['mapbox_id'] ?? $feature['id'] ?? null;

        $location = $externalId
            ? Location::firstOrNew(['source' => 'mapbox', 'external_id' => $externalId])
            : Location::firstOrNew([
                'type' => $type,
                'parent_id' => $parent?->id,
                'country_code' => $country,
                'slug' => Location::normalizeName($name),
            ]);

        $location->fill([
            'name' => $name,
            'type' => $type,
            'parent_id' => $parent?->id,
            'country_code' => $country,
            'lat' => $coordinates['lat'],
            'lng' => $coordinates['lng'],
            'source' => 'mapbox',
            'external_id' => $externalId,
            'confidence' => isset($properties['relevance']) ? round((float) $properties['relevance'], 2) : null,
            'is_verified' => false,
        ])->save();

        return $location->load('parent');
    }

    private function storePlaceFromMapbox(array $feature, string $country, ?string $forcedCategory = null): ?Place
    {
        $properties = $feature['properties'] ?? [];
        $name = $properties['name'] ?? null;
        $coordinates = $this->mapboxCoordinates($feature);

        if (! $name || ! $coordinates) {
            return null;
        }

        $externalId = $properties['mapbox_id'] ?? $feature['id'] ?? null;
        $location = $this->resolveParentCityFromMapbox($properties, $country);
        $category = $forcedCategory ?: ($properties['poi_category'][0] ?? $properties['feature_type'] ?? 'place');

        $place = $externalId
            ? Place::firstOrNew(['source' => 'mapbox', 'external_id' => $externalId])
            : Place::firstOrNew([
                'country_code' => $country,
                'slug' => Location::normalizeName($name),
                'lat' => $coordinates['lat'],
                'lng' => $coordinates['lng'],
            ]);

        $place->fill([
            'name' => $name,
            'category' => $category,
            'location_id' => $location?->id,
            'country_code' => $country,
            'lat' => $coordinates['lat'],
            'lng' => $coordinates['lng'],
            'source' => 'mapbox',
            'external_id' => $externalId,
            'confidence' => isset($properties['relevance']) ? round((float) $properties['relevance'], 2) : null,
            'is_verified' => false,
            'tags' => array_filter([
                'feature_type' => $properties['feature_type'] ?? null,
                'full_address' => $properties['full_address'] ?? null,
                'poi_category' => $properties['poi_category'] ?? null,
            ]),
        ])->save();

        return $place->load('location');
    }

    private function locationTypeFromOsm(array $item): ?string
    {
        $kind = $item['addresstype'] ?? $item['type'] ?? null;

        return match ($kind) {
            'country' => 'country',
            'city', 'town', 'village', 'municipality', 'administrative' => 'city',
            'suburb', 'neighbourhood', 'quarter', 'city_district', 'district', 'residential' => 'district',
            default => null,
        };
    }

    private function locationTypeFromMapbox(array $properties): ?string
    {
        return match ($properties['feature_type'] ?? null) {
            'country' => 'country',
            'place', 'locality' => 'city',
            'neighborhood', 'district' => 'district',
            default => null,
        };
    }

    private function resolveBestLocationFromAddress(array $address, string $country): ?Location
    {
        $city = $this->resolveParentCityFromAddress($address, $country);
        $districtName = $address['suburb'] ?? $address['neighbourhood'] ?? $address['quarter'] ?? $address['city_district'] ?? null;

        if (! $districtName) {
            return $city;
        }

        return Location::firstOrCreate([
            'type' => 'district',
            'parent_id' => $city?->id,
            'country_code' => $country,
            'slug' => Location::normalizeName($districtName),
        ], [
            'name' => $districtName,
            'source' => 'osm',
            'is_verified' => false,
        ]);
    }

    private function resolveParentCityFromAddress(array $address, string $country): ?Location
    {
        $cityName = $address['city'] ?? $address['town'] ?? $address['village'] ?? $address['municipality'] ?? null;

        if (! $cityName) {
            return null;
        }

        return Location::firstOrCreate([
            'type' => 'city',
            'parent_id' => null,
            'country_code' => $country,
            'slug' => Location::normalizeName($cityName),
        ], [
            'name' => $cityName,
            'source' => 'osm',
            'is_verified' => false,
        ]);
    }

    private function resolveParentCityFromMapbox(array $properties, string $country): ?Location
    {
        $context = $properties['context'] ?? [];
        $cityName = $context['place']['name'] ?? $context['locality']['name'] ?? null;

        if (! $cityName) {
            return null;
        }

        return Location::firstOrCreate([
            'type' => 'city',
            'parent_id' => null,
            'country_code' => $country,
            'slug' => Location::normalizeName($cityName),
        ], [
            'name' => $cityName,
            'source' => 'mapbox',
            'is_verified' => false,
        ]);
    }

    private function categoryFromOsm(array $item): string
    {
        return $item['type'] ?? $item['class'] ?? 'place';
    }

    private function osmExternalId(array $item): ?string
    {
        if (isset($item['osm_type'], $item['osm_id'])) {
            return "{$item['osm_type']}:{$item['osm_id']}";
        }

        return isset($item['place_id']) ? "place:{$item['place_id']}" : null;
    }

    private function mapboxCoordinates(array $feature): ?array
    {
        $coordinates = $feature['geometry']['coordinates'] ?? null;

        if (is_array($coordinates) && count($coordinates) >= 2) {
            return ['lng' => $coordinates[0], 'lat' => $coordinates[1]];
        }

        $properties = $feature['properties'] ?? [];
        $lat = $properties['coordinates']['latitude'] ?? null;
        $lng = $properties['coordinates']['longitude'] ?? null;

        return $lat !== null && $lng !== null ? ['lat' => $lat, 'lng' => $lng] : null;
    }

    private function overpassFilters(?string $category): array
    {
        if ($category) {
            return [
                '["amenity"="'.$category.'"]',
                '["shop"="'.$category.'"]',
                '["office"="'.$category.'"]',
                '["tourism"="'.$category.'"]',
                '["leisure"="'.$category.'"]',
            ];
        }

        return ['["amenity"]', '["shop"]', '["office"]', '["tourism"]', '["leisure"]', '["healthcare"]'];
    }
}
