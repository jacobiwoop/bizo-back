<?php

namespace Tests\Feature;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
