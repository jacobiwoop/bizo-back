<?php

namespace Tests\Feature;

use App\Jobs\CheckRequestMatches;
use App\Models\Listing;
use App\Models\ListingRequest;
use App\Models\Report;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ExtrasTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_create_report(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/reports', [
            'target_type' => 'listing',
            'target_id' => 'listing-123',
            'reason' => 'spam',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.reason', 'spam');

        $this->assertDatabaseHas('reports', [
            'from_uid' => $user->id,
            'target_type' => 'listing',
            'target_id' => 'listing-123',
        ]);
    }

    public function test_authenticated_user_can_create_listing_request(): void
    {
        Queue::fake();
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/requests', [
            'title' => 'Je cherche un iPhone 13',
            'description' => 'Budget max 200000 FCFA',
            'category' => 'electronique',
            'max_price' => 200000,
            'country' => 'BJ',
            'city' => 'Cotonou',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.category', 'electronique');

        $this->assertDatabaseHas('listing_requests', [
            'owner_id' => $user->id,
            'title' => 'Je cherche un iPhone 13',
            'status' => 'active',
        ]);

        Queue::assertPushed(CheckRequestMatches::class);
    }

    public function test_user_can_list_own_requests(): void
    {
        $user = User::factory()->create();
        ListingRequest::create([
            'owner_id' => $user->id,
            'title' => 'Recherche velo',
            'category' => 'vehicules',
            'country' => 'BJ',
            'city' => 'Cotonou',
            'status' => 'active',
            'expires_at' => now()->addDays(30),
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/my/requests');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_owner_can_delete_own_request(): void
    {
        $user = User::factory()->create();
        $listingRequest = ListingRequest::create([
            'owner_id' => $user->id,
            'title' => 'Recherche console',
            'category' => 'electronique',
            'country' => 'BJ',
            'city' => 'Cotonou',
            'status' => 'active',
            'expires_at' => now()->addDays(30),
        ]);

        $this->actingAs($user)
            ->deleteJson("/api/v1/requests/{$listingRequest->id}")
            ->assertNoContent();

        $this->assertDatabaseMissing('listing_requests', [
            'id' => $listingRequest->id,
        ]);
    }

    public function test_public_requests_list_only_returns_active_requests(): void
    {
        $user = User::factory()->create();

        ListingRequest::create([
            'owner_id' => $user->id,
            'title' => 'Recherche TV',
            'category' => 'electronique',
            'country' => 'BJ',
            'city' => 'Cotonou',
            'status' => 'active',
            'expires_at' => now()->addDays(30),
        ]);

        ListingRequest::create([
            'owner_id' => $user->id,
            'title' => 'Recherche table',
            'category' => 'maison',
            'country' => 'BJ',
            'city' => 'Cotonou',
            'status' => 'expired',
            'expires_at' => now()->subDay(),
        ]);

        $response = $this->getJson('/api/v1/requests');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_check_request_matches_dispatches_notification_job_for_matching_listing(): void
    {
        Queue::fake();

        $owner = User::factory()->create();
        $seller = User::factory()->create();

        $listingRequest = ListingRequest::create([
            'owner_id' => $owner->id,
            'title' => 'Recherche iPhone',
            'category' => 'electronique',
            'max_price' => 200000,
            'country' => 'BJ',
            'city' => 'Cotonou',
            'status' => 'active',
            'expires_at' => now()->addDays(30),
        ]);

        Listing::factory()->create([
            'owner_id' => $seller->id,
            'category' => 'electronique',
            'country' => 'BJ',
            'price' => 150000,
            'status' => 'active',
        ]);

        (new CheckRequestMatches($listingRequest))->handle();

        Queue::assertPushed(\App\Jobs\SendPushNotification::class);
    }
}
