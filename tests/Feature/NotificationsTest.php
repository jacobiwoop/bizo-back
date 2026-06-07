<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use App\Services\FcmService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\URL;
use ReflectionClass;
use Tests\TestCase;

class NotificationsTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_list_notifications(): void
    {
        $user = User::factory()->create();

        Notification::create([
            'user_id' => $user->id,
            'type' => 'new_message',
            'title' => 'Titre 1',
            'body' => 'Body 1',
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'listing_reminder',
            'title' => 'Titre 2',
            'body' => 'Body 2',
        ]);

        $response = $this->actingAs($user)->getJson('/api/v1/notifications');

        $response->assertStatus(200);
        $this->assertCount(2, $response->json('data'));
    }

    public function test_user_can_mark_notification_as_read(): void
    {
        $user = User::factory()->create();
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'new_message',
            'title' => 'Titre',
            'body' => 'Body',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)->postJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertStatus(200);
        $this->assertTrue($notification->fresh()->is_read);
    }

    public function test_user_can_mark_all_notifications_as_read(): void
    {
        $user = User::factory()->create();

        Notification::create([
            'user_id' => $user->id,
            'type' => 'new_message',
            'title' => 'Titre 1',
            'body' => 'Body 1',
            'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $user->id,
            'type' => 'new_message',
            'title' => 'Titre 2',
            'body' => 'Body 2',
            'is_read' => false,
        ]);

        $response = $this->actingAs($user)->postJson('/api/v1/notifications/read-all');

        $response->assertStatus(200);
        $this->assertDatabaseMissing('notifications', [
            'user_id' => $user->id,
            'is_read' => false,
        ]);
    }

    public function test_fcm_notification_image_url_is_resolved_to_public_url(): void
    {
        URL::forceRootUrl('https://bizo.example');
        URL::forceScheme('https');

        $reflection = new ReflectionClass(FcmService::class);
        $method = $reflection->getMethod('resolveImageUrl');
        $method->setAccessible(true);
        $service = app(FcmService::class);

        $this->assertSame('https://cdn.example/listing.webp', $method->invoke($service, 'https://cdn.example/listing.webp'));
        $this->assertSame('https://bizo.example/storage/photos/listing.webp', $method->invoke($service, '/storage/photos/listing.webp'));
        $this->assertSame('https://bizo.example/storage/photos/listing.webp', $method->invoke($service, 'storage/photos/listing.webp'));
        $this->assertNull($method->invoke($service, null));
    }
}
