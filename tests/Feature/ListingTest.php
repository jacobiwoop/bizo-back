<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ListingTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();
    }

    protected function validListingData(): array
    {
        return [
            'title' => 'iPhone 13 128Go Noir',
            'description' => 'Vends mon iPhone 13 en très bon état. Acheté en janvier 2026, jamais tombé, toujours sous protection.',
            'type' => 'VENTE',
            'price' => 185000,
            'category' => 'electronique',
            'condition' => 'excellent',
            'delivery_mode' => 'les_deux',
            'country' => 'BJ',
            'city' => 'Cotonou',
            'neighborhood' => 'Akpakpa',
            'tags' => ['apple', 'iphone', '128go'],
        ];
    }

    private function fakePhoto(): UploadedFile
    {
        return UploadedFile::fake()->image('photo.jpg', 800, 600);
    }

    // ─── GET /listings ─────────────────────────────────────────

    public function test_feed_returns_paginated_listings(): void
    {
        Listing::factory()->count(3)->create(['status' => 'active']);

        $response = $this->getJson('/api/v1/listings');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'data' => [],
                'meta' => ['current_page', 'last_page', 'total', 'per_page'],
            ]);

        $this->assertCount(3, $response->json('data'));
    }

    public function test_feed_only_returns_active_listings(): void
    {
        Listing::factory()->create(['status' => 'active']);
        Listing::factory()->create(['status' => 'sold']);
        Listing::factory()->create(['status' => 'expired']);

        $response = $this->getJson('/api/v1/listings');

        $this->assertCount(1, $response->json('data'));
    }

    public function test_feed_can_filter_by_category(): void
    {
        Listing::factory()->create(['status' => 'active', 'category' => 'electronique']);
        Listing::factory()->create(['status' => 'active', 'category' => 'vetements']);

        $response = $this->getJson('/api/v1/listings?category=electronique');

        $this->assertCount(1, $response->json('data'));
    }

    public function test_feed_can_filter_by_price_range(): void
    {
        Listing::factory()->create(['status' => 'active', 'price' => 5000]);
        Listing::factory()->create(['status' => 'active', 'price' => 15000]);
        Listing::factory()->create(['status' => 'active', 'price' => 25000]);

        $response = $this->getJson('/api/v1/listings?min_price=10000&max_price=20000');

        $this->assertCount(1, $response->json('data'));
    }

    // ─── POST /listings ───────────────────────────────────────

    public function test_can_create_listing(): void
    {
        Storage::fake('local');

        $data = $this->validListingData();
        $data['photos'] = [$this->fakePhoto()];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/listings', $data);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'data' => ['id', 'title', 'type', 'price', 'photos', 'owner'],
            ]);

        $this->assertDatabaseHas('listings', [
            'title' => 'iPhone 13 128Go Noir',
            'owner_id' => $this->user->id,
            'status' => 'active',
            'category' => 'electronique',
        ]);
    }

    public function test_create_listing_normalizes_category_aliases(): void
    {
        Storage::fake('local');

        $data = $this->validListingData();
        $data['category'] = 'Vêtements';
        $data['photos'] = [$this->fakePhoto()];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/listings', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.category', 'vetements');

        $this->assertDatabaseHas('listings', [
            'id' => $response->json('data.id'),
            'category' => 'vetements',
        ]);
    }

    public function test_can_create_listing_with_dynamic_attributes(): void
    {
        Storage::fake('local');

        $data = $this->validListingData();
        $data['category'] = 'telephones';
        $data['attributes'] = [
            'brand' => 'Apple',
            'model' => 'iPhone Smoke',
            'storage' => '128 Go',
            'battery_health' => '88',
        ];
        $data['photos'] = [$this->fakePhoto()];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/listings', $data);

        $response->assertStatus(201)
            ->assertJsonPath('data.category', 'telephones')
            ->assertJsonPath('data.attributes.brand', 'Apple')
            ->assertJsonPath('data.attributes.model', 'iPhone Smoke');

        $listing = Listing::find($response->json('data.id'));

        $this->assertSame('Apple', $listing->attributes['brand']);
        $this->assertSame('128 Go', $listing->attributes['storage']);
    }

    public function test_create_listing_requires_auth(): void
    {
        $response = $this->postJson('/api/v1/listings', $this->validListingData());

        $response->assertStatus(401);
    }

    public function test_create_listing_validates_photos_required(): void
    {
        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/listings', $this->validListingData());

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photos']);
    }

    public function test_create_listing_sets_expires_at(): void
    {
        Storage::fake('local');

        $data = $this->validListingData();
        $data['photos'] = [$this->fakePhoto()];

        $response = $this->actingAs($this->user)
            ->postJson('/api/v1/listings', $data);

        $listing = Listing::find($response->json('data.id'));

        $this->assertNotNull($listing->expires_at);
        $this->assertGreaterThanOrEqual(29, now()->diffInDays($listing->expires_at));
    }

    // ─── GET /listings/{id} ────────────────────────────────────

    public function test_can_show_listing(): void
    {
        $listing = Listing::factory()->create(['status' => 'active']);

        $response = $this->getJson("/api/v1/listings/{$listing->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $listing->id);
    }

    public function test_show_increments_view_count(): void
    {
        $listing = Listing::factory()->create(['status' => 'active', 'view_count' => 0]);

        $response = $this->getJson("/api/v1/listings/{$listing->id}");

        $response->assertJsonPath('data.view_count', 1);
        $this->assertEquals(1, $listing->fresh()->view_count);
    }

    public function test_show_returns_404_for_unknown(): void
    {
        $response = $this->getJson('/api/v1/listings/unknown-id');

        $response->assertStatus(404);
    }

    // ─── PUT /listings/{id} ────────────────────────────────────

    public function test_can_update_own_listing(): void
    {
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'type' => 'VENTE',
            'price' => 10000,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/listings/{$listing->id}", [
                'title' => 'Titre modifié - nouveau produit',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('listings', [
            'id' => $listing->id,
            'title' => 'Titre modifié - nouveau produit',
        ]);
    }

    public function test_cannot_update_others_listing(): void
    {
        $other = User::factory()->create();
        $listing = Listing::factory()->create(['owner_id' => $other->id]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/listings/{$listing->id}", [
                'title' => 'Titre modifié - nouveau produit',
            ]);

        $response->assertStatus(403);
    }

    public function test_update_requires_price_when_type_is_vente(): void
    {
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'type' => 'TROC',
            'price' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/listings/{$listing->id}", [
                'type' => 'VENTE',
                'price' => null,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['price']);
    }

    public function test_update_requires_exchange_for_when_type_is_troc(): void
    {
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'type' => 'VENTE',
            'price' => 185000,
            'exchange_for' => null,
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/listings/{$listing->id}", [
                'type' => 'TROC',
                'exchange_for' => null,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['exchange_for']);
    }

    // ─── DELETE /listings/{id} ─────────────────────────────────

    public function test_can_delete_own_listing(): void
    {
        $listing = Listing::factory()->create(['owner_id' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/listings/{$listing->id}");

        $response->assertStatus(204);
        $this->assertSoftDeleted($listing);
    }

    public function test_cannot_delete_others_listing(): void
    {
        $other = User::factory()->create();
        $listing = Listing::factory()->create(['owner_id' => $other->id]);

        $response = $this->actingAs($this->user)
            ->deleteJson("/api/v1/listings/{$listing->id}");

        $response->assertStatus(403);
    }

    // ─── GET /my/listings ──────────────────────────────────────

    public function test_my_listings_returns_own_listings(): void
    {
        Listing::factory()->count(3)->create(['owner_id' => $this->user->id]);
        Listing::factory()->count(2)->create(); // autres users

        $response = $this->actingAs($this->user)
            ->getJson('/api/v1/my/listings');

        $response->assertStatus(200);
        $this->assertCount(3, $response->json('data'));
    }

    // ─── POST /listings/{id}/boost ─────────────────────────────

    public function test_can_boost_own_listing(): void
    {
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'status' => 'active',
            'is_boosted' => false,
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/listings/{$listing->id}/boost");

        $response->assertStatus(200)
            ->assertJsonPath('data.is_boosted', true);
    }

    // ─── POST /listings/{id}/renew ─────────────────────────────

    public function test_can_renew_expired_listing(): void
    {
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'status' => 'expired',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/listings/{$listing->id}/renew");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'active');
    }

    public function test_cannot_renew_active_listing(): void
    {
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/listings/{$listing->id}/renew");

        $response->assertStatus(400);
    }

    // ─── GET /listings/{id}/similar ────────────────────────────

    public function test_similar_returns_same_category(): void
    {
        $listing = Listing::factory()->create(['status' => 'active', 'category' => 'electronique']);
        Listing::factory()->create(['status' => 'active', 'category' => 'electronique']);
        Listing::factory()->create(['status' => 'active', 'category' => 'vetements']);

        $response = $this->getJson("/api/v1/listings/{$listing->id}/similar");

        $this->assertCount(1, $response->json('data'));
    }

    // ─── POST /listings/{id}/photos ────────────────────────────

    public function test_can_upload_photos_to_own_listing(): void
    {
        Storage::fake('local');
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'photos' => [],
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/listings/{$listing->id}/photos", [
                'photos' => [$this->fakePhoto()],
            ]);

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data.photos'));
    }

    public function test_upload_photos_rejects_when_total_would_exceed_ten(): void
    {
        Storage::fake('local');
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'photos' => array_fill(0, 9, 'https://example.com/photo.webp'),
        ]);

        $response = $this->actingAs($this->user)
            ->postJson("/api/v1/listings/{$listing->id}/photos", [
                'photos' => [$this->fakePhoto(), $this->fakePhoto()],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photos']);
    }

    public function test_can_reorder_own_listing_photos(): void
    {
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'photos' => ['photo-a.jpg', 'photo-b.jpg', 'photo-c.jpg'],
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/listings/{$listing->id}/photos/reorder", [
                'photos' => ['photo-c.jpg', 'photo-a.jpg', 'photo-b.jpg'],
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.photos.0', 'photo-c.jpg');

        $this->assertSame(['photo-c.jpg', 'photo-a.jpg', 'photo-b.jpg'], $listing->fresh()->photos);
    }

    public function test_reorder_photos_rejects_unknown_photo(): void
    {
        $listing = Listing::factory()->create([
            'owner_id' => $this->user->id,
            'photos' => ['photo-a.jpg', 'photo-b.jpg'],
        ]);

        $response = $this->actingAs($this->user)
            ->putJson("/api/v1/listings/{$listing->id}/photos/reorder", [
                'photos' => ['photo-a.jpg', 'other.jpg'],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['photos']);
    }
}
