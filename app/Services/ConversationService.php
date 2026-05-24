<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Listing;
use Illuminate\Support\Facades\DB;

class ConversationService
{
    /**
     * Genere l'ID de conversation : "{minUid}_{maxUid}_{listingId}"
     */
    public function generateId(string $uid1, string $uid2, string $listingId): string
    {
        $parts = [$uid1, $uid2];
        sort($parts);

        return $parts[0].'_'.$parts[1].'_'.$listingId;
    }

    /**
     * Trouve ou cree une conversation.
     */
    public function findOrCreate(Listing $listing, string $buyerId, string $sellerId): Conversation
    {
        $convId = $this->generateId($buyerId, $sellerId, $listing->id);

        /** @var Conversation $conv */
        $conv = Conversation::firstOrCreate(
            ['id' => $convId],
            [
                'listing_id' => $listing->id,
                'listing_title' => $listing->title,
                'listing_photo' => $listing->photos[0] ?? null,
                'participant_1' => min($buyerId, $sellerId),
                'participant_2' => max($buyerId, $sellerId),
            ]
        );

        return $conv;
    }

    /**
     * Marque les messages comme lus pour un participant.
     */
    public function markAsRead(Conversation $conversation, string $userId): void
    {
        if ($conversation->participant_1 === $userId) {
            $conversation->update(['unread_p1' => 0]);
        } elseif ($conversation->participant_2 === $userId) {
            $conversation->update(['unread_p2' => 0]);
        }
    }
}