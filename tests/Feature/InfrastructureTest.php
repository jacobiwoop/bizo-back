<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InfrastructureTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_request_updates_last_seen_at_when_stale(): void
    {
        $user = User::factory()->create([
            'last_seen_at' => now()->subMinutes(10),
        ]);

        $this->actingAs($user)->getJson('/api/v1/me')->assertOk();

        $this->assertTrue($user->fresh()->last_seen_at->gt(now()->subMinutes(2)));
    }

    public function test_authenticated_request_does_not_update_recent_last_seen_at(): void
    {
        $lastSeenAt = now()->subMinutes(2);

        $user = User::factory()->create([
            'last_seen_at' => $lastSeenAt,
        ]);

        $this->actingAs($user)->getJson('/api/v1/me')->assertOk();

        $freshLastSeenAt = $user->fresh()->last_seen_at;

        $this->assertNotNull($freshLastSeenAt);
        $this->assertTrue($freshLastSeenAt->diffInSeconds($lastSeenAt) < 1);
    }

    public function test_api_rate_limiter_returns_429_after_limit_is_reached(): void
    {
        for ($i = 0; $i < 5; $i++) {
            $this->getJson('/api/v1/ping')->assertOk();
        }

        $this->getJson('/api/v1/ping')->assertStatus(429);
    }
}
