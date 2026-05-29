<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\Location;
use App\Models\Place;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class LocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_search_locations_and_places(): void
    {
        $cotonou = Location::create([
            'name' => 'Cotonou',
            'type' => 'city',
            'country_code' => 'BJ',
            'lat' => 6.373391,
            'lng' => 2.4401,
            'source' => 'osm',
            'external_id' => 'node:1',
            'is_verified' => true,
        ]);

        Location::create([
            'name' => 'Cadjéhoun',
            'type' => 'district',
            'parent_id' => $cotonou->id,
            'country_code' => 'BJ',
            'lat' => 6.3584848,
            'lng' => 2.3951161,
            'source' => 'osm',
            'external_id' => 'node:7623561066',
            'is_verified' => true,
        ]);

        Place::create([
            'name' => 'Pharmacie Cadjehoun',
            'category' => 'pharmacy',
            'location_id' => $cotonou->id,
            'country_code' => 'BJ',
            'lat' => 6.3611624,
            'lng' => 2.3976738,
            'source' => 'osm',
            'external_id' => 'node:3872880785',
            'is_verified' => true,
        ]);

        $response = $this->getJson('/api/v1/locations/search?q=Cadjehoun&country=BJ&include_places=1');

        $response->assertOk()
            ->assertJsonPath('data.locations.0.name', 'Cadjéhoun')
            ->assertJsonPath('data.places.0.name', 'Pharmacie Cadjehoun');
    }

    public function test_can_suggest_pending_location_and_increment_usage(): void
    {
        $payload = [
            'name' => 'Quartier Test',
            'country_code' => 'BJ',
            'suggested_lat' => 6.36,
            'suggested_lng' => 2.39,
        ];

        $this->postJson('/api/v1/locations/suggest', $payload)
            ->assertCreated()
            ->assertJsonPath('data.usage_count', 1);

        $this->postJson('/api/v1/locations/suggest', $payload)
            ->assertOk()
            ->assertJsonPath('data.usage_count', 2);

        $this->assertDatabaseHas('pending_locations', [
            'country_code' => 'BJ',
            'normalized_name' => 'quartier-test',
            'usage_count' => 2,
        ]);
    }

    public function test_listing_can_store_location_fields(): void
    {
        Storage::fake('local');

        $user = User::factory()->create();

        $cotonou = Location::create([
            'name' => 'Cotonou',
            'type' => 'city',
            'country_code' => 'BJ',
            'lat' => 6.373391,
            'lng' => 2.4401,
            'source' => 'osm',
            'is_verified' => true,
        ]);

        $response = $this->actingAs($user)->postJson('/api/v1/listings', [
            'title' => 'iPhone 13 128Go Noir',
            'description' => 'Vends mon iPhone 13 en très bon état avec tous les accessoires disponibles.',
            'type' => 'VENTE',
            'price' => 185000,
            'category' => 'telephones',
            'condition' => 'excellent',
            'delivery_mode' => 'main_propre',
            'country' => 'BJ',
            'city' => 'Cotonou',
            'neighborhood' => 'Cadjéhoun',
            'location_id' => $cotonou->id,
            'location_accuracy' => 'city',
            'photos' => [UploadedFile::fake()->image('photo.jpg', 800, 600)],
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.location_id', $cotonou->id)
            ->assertJsonPath('data.display_lat', 6.373391)
            ->assertJsonPath('data.location_accuracy', 'city');
    }

    public function test_listing_near_filter_orders_by_distance(): void
    {
        $near = Listing::factory()->create([
            'title' => 'Annonce proche',
            'display_lat' => 6.36,
            'display_lng' => 2.39,
        ]);

        Listing::factory()->create([
            'title' => 'Annonce loin',
            'display_lat' => 7.50,
            'display_lng' => 2.00,
        ]);

        $response = $this->getJson('/api/v1/listings?lat=6.361438&lng=2.3994&radius_km=20');

        $response->assertOk()
            ->assertJsonPath('data.0.id', $near->id)
            ->assertJsonPath('data.0.distance_km', fn ($distance) => is_numeric($distance));
    }

    public function test_location_search_can_enrich_from_osm(): void
    {
        config(['services.location.mapbox_token' => null]);

        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([
                [
                    'place_id' => 123,
                    'osm_type' => 'node',
                    'osm_id' => 456,
                    'name' => 'Cadjéhoun',
                    'display_name' => 'Cadjéhoun, Cotonou, Bénin',
                    'lat' => '6.3584848',
                    'lon' => '2.3951161',
                    'class' => 'place',
                    'type' => 'suburb',
                    'addresstype' => 'suburb',
                    'importance' => 0.52,
                    'address' => [
                        'suburb' => 'Cadjéhoun',
                        'city' => 'Cotonou',
                        'country_code' => 'bj',
                    ],
                ],
            ]),
        ]);

        $response = $this->getJson('/api/v1/locations/search?q=Cadjehoun&country=BJ&type=district&enrich=1');

        $response->assertOk()
            ->assertJsonPath('data.locations.0.name', 'Cadjéhoun')
            ->assertJsonPath('data.locations.0.source', 'osm');

        $this->assertDatabaseHas('locations', [
            'name' => 'Cadjéhoun',
            'type' => 'district',
            'country_code' => 'BJ',
            'source' => 'osm',
            'external_id' => 'node:456',
        ]);
    }

    public function test_location_search_falls_back_to_mapbox_when_osm_has_no_result(): void
    {
        config(['services.location.mapbox_token' => 'test-token']);

        Http::fake([
            'nominatim.openstreetmap.org/*' => Http::response([]),
            'api.mapbox.com/*' => Http::response([
                'features' => [
                    [
                        'type' => 'Feature',
                        'geometry' => [
                            'type' => 'Point',
                            'coordinates' => [2.3951161, 6.3584848],
                        ],
                        'properties' => [
                            'mapbox_id' => 'dXJuOm1ieHBsYzp0ZXN0',
                            'name' => 'Cadjehoun',
                            'feature_type' => 'neighborhood',
                            'relevance' => 0.93,
                            'context' => [
                                'place' => ['name' => 'Cotonou'],
                            ],
                        ],
                    ],
                ],
            ]),
        ]);

        $response = $this->getJson('/api/v1/locations/search?q=Cadjehoun&country=BJ&type=district&enrich=1');

        $response->assertOk()
            ->assertJsonPath('data.locations.0.name', 'Cadjehoun')
            ->assertJsonPath('data.locations.0.source', 'mapbox');

        $this->assertDatabaseHas('locations', [
            'name' => 'Cadjehoun',
            'type' => 'district',
            'country_code' => 'BJ',
            'source' => 'mapbox',
            'external_id' => 'dXJuOm1ieHBsYzp0ZXN0',
        ]);
    }

    public function test_places_search_can_enrich_nearby_infrastructure_from_osm(): void
    {
        Http::fake([
            'overpass-api.de/*' => Http::response([
                'elements' => [
                    [
                        'type' => 'node',
                        'id' => 789,
                        'lat' => 6.3611624,
                        'lon' => 2.3976738,
                        'tags' => [
                            'name' => 'Pharmacie Cadjehoun',
                            'amenity' => 'pharmacy',
                        ],
                    ],
                ],
            ]),
        ]);

        $response = $this->getJson('/api/v1/places/search?lat=6.361438&lng=2.3994&radius_km=2&category=pharmacy&country=BJ&enrich=1');

        $response->assertOk()
            ->assertJsonPath('data.0.name', 'Pharmacie Cadjehoun')
            ->assertJsonPath('data.0.category', 'pharmacy');

        $this->assertDatabaseHas('places', [
            'name' => 'Pharmacie Cadjehoun',
            'category' => 'pharmacy',
            'country_code' => 'BJ',
            'source' => 'osm',
            'external_id' => 'node:789',
        ]);
    }
}
