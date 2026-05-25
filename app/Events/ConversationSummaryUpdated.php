<?php

namespace App\Events;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationSummaryUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Conversation $conversation,
        public User $recipient,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('users.'.$this->recipient->id.'.conversations'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'conversation.summary.updated';
    }

    public function broadcastWith(): array
    {
        $otherUser = $this->conversation->participant_1 === $this->recipient->id
            ? $this->conversation->participant2
            : $this->conversation->participant1;

        return [
            'conversation' => [
                'id' => $this->conversation->id,
                'listing_id' => $this->conversation->listing_id,
                'listing_title' => $this->conversation->listing_title,
                'listing_photo' => $this->conversation->listing_photo,
                'last_message' => $this->conversation->last_message,
                'last_message_at' => optional($this->conversation->last_message_at)?->toJSON(),
                'unread_count' => $this->conversation->unreadCountFor($this->recipient->id),
                'other_user' => $otherUser ? [
                    'id' => $otherUser->id,
                    'display_name' => $otherUser->display_name,
                    'photo_url' => $otherUser->photo_url,
                    'last_seen_at' => optional($otherUser->last_seen_at)?->toJSON(),
                ] : null,
                'created_at' => optional($this->conversation->created_at)?->toJSON(),
            ],
        ];
    }
}
