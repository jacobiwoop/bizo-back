<?php

namespace Tests\Feature;

use App\Jobs\SendPushNotification;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class SchedulerCommandsTest extends TestCase
{
    use RefreshDatabase;

    public function test_send_reminders_marks_listing_and_dispatches_job(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $listing = Listing::factory()->create([
            'owner_id' => $user->id,
            'status' => 'active',
            'created_at' => now()->subDays(3)->subHour(),
            'reminder_sent_at' => null,
        ]);

        $this->artisan('bizo:send-reminders')->assertSuccessful();

        $this->assertNotNull($listing->fresh()->reminder_sent_at);
        Queue::assertPushed(SendPushNotification::class);
    }

    public function test_expire_listings_updates_status_and_dispatches_job(): void
    {
        Queue::fake();

        $user = User::factory()->create();
        $listing = Listing::factory()->create([
            'owner_id' => $user->id,
            'status' => 'active',
            'expires_at' => now()->subMinute(),
        ]);

        $this->artisan('bizo:expire-listings')->assertSuccessful();

        $this->assertSame('expired', $listing->fresh()->status);
        Queue::assertPushed(SendPushNotification::class);
    }

    public function test_update_reactivity_badges_computes_response_metrics(): void
    {
        $seller = User::factory()->create();
        $buyer = User::factory()->create();
        $listing = Listing::factory()->create(['owner_id' => $seller->id]);

        $conversation = Conversation::create([
            'id' => "{$buyer->id}_{$seller->id}_{$listing->id}",
            'listing_id' => $listing->id,
            'listing_title' => $listing->title,
            'listing_photo' => $listing->photos[0] ?? null,
            'participant_1' => min($buyer->id, $seller->id),
            'participant_2' => max($buyer->id, $seller->id),
        ]);

        Message::create([
            'conv_id' => $conversation->id,
            'sender_id' => $buyer->id,
            'type' => 'text',
            'text' => 'Bonjour',
            'created_at' => now()->subMinutes(10),
            'updated_at' => now()->subMinutes(10),
        ]);

        Message::create([
            'conv_id' => $conversation->id,
            'sender_id' => $seller->id,
            'type' => 'text',
            'text' => 'Oui dispo',
            'created_at' => now()->subMinutes(5),
            'updated_at' => now()->subMinutes(5),
        ]);

        $this->artisan('bizo:update-reactivity-badges')->assertSuccessful();

        $seller->refresh();

        $this->assertNotNull($seller->avg_response_time);
        $this->assertNotNull($seller->response_rate);
    }
}
