<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConversationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $userId = $request->user()?->id;
        $listingOwnerId = $this->relationLoaded('listing')
            ? $this->listing?->owner_id
            : null;

        $otherUser = $this->participant_1 === $userId
            ? $this->participant2
            : $this->participant1;

        return [
            'id' => $this->id,
            'listing_id' => $this->listing_id,
            'listing_owner_id' => $listingOwnerId,
            'current_user_role' => $listingOwnerId && $userId
                ? ($listingOwnerId === $userId ? 'seller' : 'buyer')
                : null,
            'listing_title' => $this->listing_title,
            'listing_photo' => $this->listing_photo,
            'last_message' => $this->last_message,
            'last_message_at' => $this->last_message_at,
            'unread_count' => $this->unreadCountFor($userId ?? ''),
            'other_user' => $otherUser ? [
                'id' => $otherUser->id,
                'display_name' => $otherUser->display_name,
                'photo_url' => $otherUser->photo_url,
                'last_seen_at' => $otherUser->last_seen_at,
            ] : null,
            'created_at' => $this->created_at,
        ];
    }
}
