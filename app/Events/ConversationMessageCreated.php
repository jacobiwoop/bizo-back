<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ConversationMessageCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public Message $message,
    ) {}

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('conversation.'.$this->message->conv_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'conversation.message.created';
    }

    public function broadcastWith(): array
    {
        $proposal = null;

        if ($this->message->type === 'troc_proposal') {
            $proposal = [
                'offered_listing_id' => $this->message->offered_listing_id,
                'offered_listing_title' => $this->message->offered_listing_title,
                'offered_listing_photo' => $this->message->offered_listing_photo,
                'cash_amount' => $this->message->cash_amount,
                'status' => $this->message->proposal_status,
                'refusal_reason' => $this->message->refusal_reason,
            ];
        }

        return [
            'message' => [
                'id' => $this->message->id,
                'conv_id' => $this->message->conv_id,
                'sender_id' => $this->message->sender_id,
                'type' => $this->message->type,
                'text' => $this->message->text,
                'image_url' => $this->message->image_url,
                'proposal' => $proposal,
                'is_read' => $this->message->is_read,
                'created_at' => optional($this->message->created_at)?->toJSON(),
            ],
        ];
    }
}
