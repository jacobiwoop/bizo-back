<?php

namespace Tests\Feature;

use App\Events\ConversationMessageCreated;
use App\Events\ConversationSummaryUpdated;
use App\Models\Conversation;
use App\Models\Favorite;
use App\Models\Listing;
use App\Models\Message;
use App\Models\Review;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Config;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialTest extends TestCase
{
    use RefreshDatabase;

    private User $seller;

    private User $buyer;

    private Listing $listing;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seller = User::factory()->create();
        $this->buyer = User::factory()->create();
        $this->listing = Listing::factory()->create([
            'owner_id' => $this->seller->id,
            'status' => 'active',
            'photos' => ['https://example.com/listing.webp'],
        ]);

        Config::set('broadcasting.default', 'reverb');
        Config::set('broadcasting.connections.reverb.key', 'test-key');
        Config::set('broadcasting.connections.reverb.secret', 'test-secret');
        Config::set('broadcasting.connections.reverb.app_id', 'test-app');
    }

    private function conversationId(): string
    {
        $ids = [$this->seller->id, $this->buyer->id];
        sort($ids);

        return "{$ids[0]}_{$ids[1]}_{$this->listing->id}";
    }

    public function test_can_create_conversation_with_first_message(): void
    {
        Event::fake([
            ConversationMessageCreated::class,
            ConversationSummaryUpdated::class,
        ]);

        $response = $this->actingAs($this->buyer)
            ->postJson('/api/v1/conversations', [
                'listing_id' => $this->listing->id,
                'message' => 'Bonsoir, est-ce disponible ?',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.id', $this->conversationId())
            ->assertJsonPath('message.text', 'Bonsoir, est-ce disponible ?');

        $this->assertDatabaseHas('conversations', [
            'id' => $this->conversationId(),
            'listing_id' => $this->listing->id,
            'last_message' => 'Bonsoir, est-ce disponible ?',
        ]);

        $this->assertDatabaseHas('messages', [
            'conv_id' => $this->conversationId(),
            'sender_id' => $this->buyer->id,
            'text' => 'Bonsoir, est-ce disponible ?',
        ]);

        Event::assertDispatched(ConversationMessageCreated::class, 1);
        Event::assertDispatched(ConversationSummaryUpdated::class, 2);
    }

    public function test_cannot_create_conversation_on_own_listing(): void
    {
        $response = $this->actingAs($this->seller)
            ->postJson('/api/v1/conversations', [
                'listing_id' => $this->listing->id,
                'message' => 'Je me parle',
            ]);

        $response->assertStatus(400);
    }

    public function test_can_list_user_conversations(): void
    {
        Conversation::create([
            'id' => $this->conversationId(),
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'listing_photo' => $this->listing->photos[0],
            'participant_1' => min($this->seller->id, $this->buyer->id),
            'participant_2' => max($this->seller->id, $this->buyer->id),
            'last_message' => 'Salut',
            'last_message_at' => now(),
        ]);

        $response = $this->actingAs($this->buyer)
            ->getJson('/api/v1/conversations');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
    }

    public function test_participant_can_view_conversation_detail(): void
    {
        $conversation = Conversation::create([
            'id' => $this->conversationId(),
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'listing_photo' => $this->listing->photos[0],
            'participant_1' => min($this->seller->id, $this->buyer->id),
            'participant_2' => max($this->seller->id, $this->buyer->id),
            'last_message' => 'Salut',
            'last_message_at' => now(),
        ]);

        $response = $this->actingAs($this->buyer)
            ->getJson("/api/v1/conversations/{$conversation->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $conversation->id);
    }

    public function test_can_send_text_message_to_conversation(): void
    {
        Event::fake([
            ConversationMessageCreated::class,
            ConversationSummaryUpdated::class,
        ]);

        $conversation = Conversation::create([
            'id' => $this->conversationId(),
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'listing_photo' => $this->listing->photos[0],
            'participant_1' => min($this->seller->id, $this->buyer->id),
            'participant_2' => max($this->seller->id, $this->buyer->id),
        ]);

        $response = $this->actingAs($this->buyer)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'type' => 'text',
                'text' => 'Toujours disponible ?',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.text', 'Toujours disponible ?');

        $this->assertDatabaseHas('messages', [
            'conv_id' => $conversation->id,
            'sender_id' => $this->buyer->id,
            'text' => 'Toujours disponible ?',
        ]);

        Event::assertDispatched(ConversationMessageCreated::class, 1);
        Event::assertDispatched(ConversationSummaryUpdated::class, 2);
    }

    public function test_can_mark_conversation_messages_as_read(): void
    {
        $conversation = Conversation::create([
            'id' => $this->conversationId(),
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'listing_photo' => $this->listing->photos[0],
            'participant_1' => min($this->seller->id, $this->buyer->id),
            'participant_2' => max($this->seller->id, $this->buyer->id),
            'unread_p1' => $this->buyer->id < $this->seller->id ? 0 : 2,
            'unread_p2' => $this->buyer->id < $this->seller->id ? 2 : 0,
        ]);

        Message::create([
            'conv_id' => $conversation->id,
            'sender_id' => $this->seller->id,
            'type' => 'text',
            'text' => 'Oui',
            'is_read' => false,
        ]);

        $response = $this->actingAs($this->buyer)
            ->postJson("/api/v1/conversations/{$conversation->id}/read");

        $response->assertStatus(200);

        $this->assertDatabaseHas('messages', [
            'conv_id' => $conversation->id,
            'sender_id' => $this->seller->id,
            'is_read' => true,
        ]);
    }

    public function test_message_created_event_targets_private_conversation_channel(): void
    {
        $conversation = Conversation::create([
            'id' => $this->conversationId(),
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'listing_photo' => $this->listing->photos[0],
            'participant_1' => min($this->seller->id, $this->buyer->id),
            'participant_2' => max($this->seller->id, $this->buyer->id),
        ]);

        $message = Message::create([
            'conv_id' => $conversation->id,
            'sender_id' => $this->buyer->id,
            'type' => 'text',
            'text' => 'Salut realtime',
        ]);

        $event = new ConversationMessageCreated($message->fresh());
        $channels = $event->broadcastOn();

        $this->assertCount(1, $channels);
        $this->assertInstanceOf(PrivateChannel::class, $channels[0]);
        $this->assertSame('private-conversation.'.$conversation->id, $channels[0]->name);
    }

    public function test_conversation_summary_event_targets_user_inbox_channel(): void
    {
        $conversation = Conversation::create([
            'id' => $this->conversationId(),
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'listing_photo' => $this->listing->photos[0],
            'participant_1' => min($this->seller->id, $this->buyer->id),
            'participant_2' => max($this->seller->id, $this->buyer->id),
            'last_message' => 'Salut realtime',
            'last_message_at' => now(),
        ])->load(['participant1', 'participant2']);

        $event = new ConversationSummaryUpdated($conversation, $this->buyer);
        $channels = $event->broadcastOn();

        $this->assertCount(1, $channels);
        $this->assertInstanceOf(PrivateChannel::class, $channels[0]);
        $this->assertSame('private-users.'.$this->buyer->id.'.conversations', $channels[0]->name);
    }

    public function test_seller_can_create_transaction_and_listing_becomes_sold(): void
    {
        $response = $this->actingAs($this->seller)
            ->postJson('/api/v1/transactions', [
                'listing_id' => $this->listing->id,
                'buyer_id' => $this->buyer->id,
                'type' => 'VENTE',
                'final_price' => 150000,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.type', 'VENTE');

        $this->assertDatabaseHas('transactions', [
            'listing_id' => $this->listing->id,
            'seller_id' => $this->seller->id,
            'buyer_id' => $this->buyer->id,
        ]);

        $this->assertDatabaseHas('listings', [
            'id' => $this->listing->id,
            'status' => 'sold',
        ]);
    }

    public function test_buyer_cannot_create_transaction_for_listing(): void
    {
        $response = $this->actingAs($this->buyer)
            ->postJson('/api/v1/transactions', [
                'listing_id' => $this->listing->id,
                'buyer_id' => $this->buyer->id,
                'type' => 'VENTE',
            ]);

        $response->assertStatus(403);
    }

    public function test_seller_cannot_create_transaction_with_self_as_buyer(): void
    {
        $response = $this->actingAs($this->seller)
            ->postJson('/api/v1/transactions', [
                'listing_id' => $this->listing->id,
                'buyer_id' => $this->seller->id,
                'type' => 'VENTE',
                'final_price' => 150000,
            ]);

        $response->assertStatus(400);
    }

    public function test_participant_can_leave_review_and_rating_is_recomputed(): void
    {
        $transaction = Transaction::create([
            'listing_id' => $this->listing->id,
            'seller_id' => $this->seller->id,
            'buyer_id' => $this->buyer->id,
            'type' => 'VENTE',
            'final_price' => 150000,
        ]);

        $response = $this->actingAs($this->buyer)
            ->postJson('/api/v1/reviews', [
                'transaction_id' => $transaction->id,
                'rating' => 5,
                'comment' => 'Transaction tres fluide',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.rating', 5);

        $this->assertDatabaseHas('reviews', [
            'transaction_id' => $transaction->id,
            'from_uid' => $this->buyer->id,
            'to_uid' => $this->seller->id,
        ]);

        $this->assertSame(5.0, (float) $this->seller->fresh()->rating);
        $this->assertSame(1, $this->seller->fresh()->review_count);
    }

    public function test_cannot_leave_duplicate_review_for_same_transaction(): void
    {
        $transaction = Transaction::create([
            'listing_id' => $this->listing->id,
            'seller_id' => $this->seller->id,
            'buyer_id' => $this->buyer->id,
            'type' => 'VENTE',
        ]);

        Review::create([
            'from_uid' => $this->buyer->id,
            'to_uid' => $this->seller->id,
            'listing_id' => $this->listing->id,
            'transaction_id' => $transaction->id,
            'rating' => 4,
        ]);

        $response = $this->actingAs($this->buyer)
            ->postJson('/api/v1/reviews', [
                'transaction_id' => $transaction->id,
                'rating' => 5,
            ]);

        $response->assertStatus(409);
    }

    public function test_user_can_add_and_list_favorites(): void
    {
        $createResponse = $this->actingAs($this->buyer)
            ->postJson("/api/v1/favorites/{$this->listing->id}");

        $createResponse->assertStatus(201)
            ->assertJsonPath('data.listing_id', $this->listing->id);

        $this->assertDatabaseHas('favorites', [
            'user_id' => $this->buyer->id,
            'listing_id' => $this->listing->id,
        ]);

        $listResponse = $this->actingAs($this->buyer)
            ->getJson('/api/v1/favorites');

        $listResponse->assertStatus(200);
        $this->assertCount(1, $listResponse->json('data'));
    }

    public function test_user_can_remove_favorite(): void
    {
        $favorite = Favorite::create([
            'user_id' => $this->buyer->id,
            'listing_id' => $this->listing->id,
            'listing_title' => $this->listing->title,
            'listing_photo' => $this->listing->photos[0],
            'listing_price' => $this->listing->price,
            'listing_type' => $this->listing->type,
        ]);

        $response = $this->actingAs($this->buyer)
            ->deleteJson("/api/v1/favorites/{$this->listing->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('favorites', ['id' => $favorite->id]);
    }

    public function test_participant_can_view_transaction_detail(): void
    {
        $transaction = Transaction::create([
            'listing_id' => $this->listing->id,
            'seller_id' => $this->seller->id,
            'buyer_id' => $this->buyer->id,
            'type' => 'VENTE',
            'final_price' => 150000,
        ]);

        $response = $this->actingAs($this->buyer)
            ->getJson("/api/v1/transactions/{$transaction->id}");

        $response->assertOk()
            ->assertJsonPath('data.id', $transaction->id);
    }

    public function test_public_user_reviews_returns_received_reviews(): void
    {
        $transaction = Transaction::create([
            'listing_id' => $this->listing->id,
            'seller_id' => $this->seller->id,
            'buyer_id' => $this->buyer->id,
            'type' => 'VENTE',
            'final_price' => 150000,
        ]);

        Review::create([
            'from_uid' => $this->buyer->id,
            'to_uid' => $this->seller->id,
            'listing_id' => $this->listing->id,
            'transaction_id' => $transaction->id,
            'rating' => 5,
            'comment' => 'Tres bon vendeur',
        ]);

        $response = $this->getJson("/api/v1/users/{$this->seller->id}/reviews");

        $response->assertOk()
            ->assertJsonPath('data.0.to_uid', $this->seller->id)
            ->assertJsonPath('data.0.rating', 5);
    }
}
