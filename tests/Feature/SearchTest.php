<?php

namespace Tests\Feature;

use App\Models\Listing;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_search_requires_query(): void
    {
        $response = $this->getJson('/api/v1/search');

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['q']);
    }

    public function test_search_finds_matching_active_listings_by_title(): void
    {
        Listing::factory()->create([
            'title' => 'iPhone 13 Pro Max',
            'description' => 'Telephone Apple excellent etat',
            'status' => 'active',
        ]);

        Listing::factory()->create([
            'title' => 'Samsung Galaxy',
            'description' => 'Telephone Android',
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/v1/search?q=iphone');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $response->assertJsonPath('data.0.title', 'iPhone 13 Pro Max');
    }

    public function test_search_ignores_inactive_listings(): void
    {
        Listing::factory()->create([
            'title' => 'iPhone 13',
            'status' => 'sold',
        ]);

        $response = $this->getJson('/api/v1/search?q=iphone');

        $response->assertStatus(200);
        $this->assertCount(0, $response->json('data'));
    }

    public function test_search_can_filter_by_category_and_price(): void
    {
        Listing::factory()->create([
            'title' => 'iPhone 13',
            'category' => 'electronique',
            'price' => 150000,
            'status' => 'active',
        ]);

        Listing::factory()->create([
            'title' => 'iPhone 11',
            'category' => 'electronique',
            'price' => 90000,
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/v1/search?q=iphone&category=electronique&min_price=100000');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $response->assertJsonPath('data.0.price', 150000);
    }

    public function test_search_can_match_description(): void
    {
        Listing::factory()->create([
            'title' => 'Article divers',
            'description' => 'Ordinateur portable Lenovo en excellent etat',
            'status' => 'active',
        ]);

        $response = $this->getJson('/api/v1/search?q=lenovo');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }
}
