<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebPreviewTest extends TestCase
{
    use RefreshDatabase;

    public function test_listing_preview_returns_html_with_open_graph_tags(): void
    {
        $seller = User::factory()->create([
            'display_name' => 'Awa Seller',
            'username' => 'awa_seller',
        ]);

        $listing = Listing::factory()->create([
            'owner_id' => $seller->id,
            'title' => 'iPhone 13 Pro',
            'price' => 250000,
            'city' => 'Cotonou',
            'country' => 'BJ',
            'type' => 'VENTE',
            'category' => 'electronique',
            'condition' => 'bon',
            'photos' => ['https://example.com/iphone.jpg'],
        ]);

        $response = $this->get("/a/{$listing->id}");

        $response->assertOk();
        $response->assertSee('iPhone 13 Pro - Bizo', false);
        $response->assertSee('og:title', false);
        $response->assertSee('https://example.com/iphone.jpg', false);
        $response->assertSee('Voir le vendeur');
    }

    public function test_seller_preview_shows_only_active_listings(): void
    {
        $seller = User::factory()->create([
            'display_name' => 'Marc Seller',
            'username' => 'marc_seller',
            'bio' => 'Vendeur fiable',
            'rating' => 4.8,
            'review_count' => 12,
            'total_sales' => 7,
        ]);

        Listing::factory()->create([
            'owner_id' => $seller->id,
            'title' => 'Annonce active',
            'status' => 'active',
        ]);

        Listing::factory()->create([
            'owner_id' => $seller->id,
            'title' => 'Annonce expiree',
            'status' => 'expired',
        ]);

        $response = $this->get('/u/marc_seller');

        $response->assertOk();
        $response->assertSee('Marc Seller');
        $response->assertSee('Annonce active');
        $response->assertDontSee('Annonce expiree');
    }

    public function test_seller_preview_returns_404_for_private_profile(): void
    {
        User::factory()->create([
            'username' => 'private_seller',
            'is_profile_public' => false,
        ]);

        $this->get('/u/private_seller')->assertNotFound();
    }

    public function test_assetlinks_returns_configured_android_app_links(): void
    {
        config()->set('services.android_app.package_name', 'com.woopchi.bizo');
        config()->set('services.android_app.sha256_cert_fingerprints', [
            'AA:BB:CC:DD',
        ]);

        $response = $this->get('/.well-known/assetlinks.json');

        $response->assertOk()
            ->assertJsonPath('0.target.namespace', 'android_app')
            ->assertJsonPath('0.target.package_name', 'com.woopchi.bizo')
            ->assertJsonPath('0.relation.0', 'delegate_permission/common.handle_all_urls')
            ->assertJsonPath('0.target.sha256_cert_fingerprints.0', 'AA:BB:CC:DD');
    }
}
