<?php

namespace Tests\Feature;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create([
            'display_name' => 'Aiko',
            'username' => 'aiko_dev',
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/profile')
            ->assertOk()
            ->assertJsonPath('data.display_name', 'Aiko')
            ->assertJsonPath('data.username', 'aiko_dev');
    }

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = User::factory()->create([
            'username' => 'old_handle',
        ]);

        $this->actingAs($user)
            ->putJson('/api/v1/profile', [
                'display_name' => 'Nouveau Nom',
                'username' => 'new_handle',
                'bio' => 'Bio publique',
                'notif_messages' => false,
            ])
            ->assertOk()
            ->assertJsonPath('data.display_name', 'Nouveau Nom')
            ->assertJsonPath('data.username', 'new_handle');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'display_name' => 'Nouveau Nom',
            'username' => 'new_handle',
            'notif_messages' => 0,
        ]);
    }

    public function test_authenticated_user_can_upload_avatar(): void
    {
        Storage::fake('public');
        config(['filesystems.default' => 'public']);

        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/api/v1/profile/avatar', [
            'avatar' => UploadedFile::fake()->image('avatar.jpg'),
        ]);

        $response->assertOk();
        $this->assertNotNull($user->fresh()->photo_url);
        $this->assertStringContainsString('/storage/avatars/', $user->fresh()->photo_url);
    }

    public function test_authenticated_user_can_delete_account(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('mobile')->plainTextToken;

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->deleteJson('/api/v1/profile')
            ->assertNoContent();

        $this->assertSoftDeleted('users', [
            'id' => $user->id,
        ]);
    }

    public function test_public_profile_returns_only_public_users(): void
    {
        $publicUser = User::factory()->create([
            'display_name' => 'Public Seller',
            'is_profile_public' => true,
        ]);

        $privateUser = User::factory()->create([
            'is_profile_public' => false,
        ]);

        $this->getJson("/api/v1/users/{$publicUser->id}")
            ->assertOk()
            ->assertJsonPath('data.display_name', 'Public Seller');

        $this->getJson("/api/v1/users/{$privateUser->id}")
            ->assertNotFound();
    }

    public function test_public_user_listings_only_returns_active_items(): void
    {
        $user = User::factory()->create([
            'is_profile_public' => true,
        ]);

        Listing::factory()->create([
            'owner_id' => $user->id,
            'title' => 'Annonce visible',
            'status' => 'active',
        ]);

        Listing::factory()->create([
            'owner_id' => $user->id,
            'title' => 'Annonce cachee',
            'status' => 'expired',
        ]);

        $response = $this->getJson("/api/v1/users/{$user->id}/listings");

        $response->assertOk();
        $this->assertCount(1, $response->json('data'));
        $response->assertJsonPath('data.0.title', 'Annonce visible');
    }
}
