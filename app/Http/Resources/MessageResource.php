<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $proposal = null;

        if ($this->type === 'troc_proposal') {
            $proposal = [
                'offered_listing_id' => $this->offered_listing_id,
                'offered_listing_title' => $this->offered_listing_title,
                'offered_listing_photo' => $this->offered_listing_photo,
                'cash_amount' => $this->cash_amount,
                'status' => $this->proposal_status,
                'refusal_reason' => $this->refusal_reason,
            ];
        }

        return [
            'id' => $this->id,
            'conv_id' => $this->conv_id,
            'sender_id' => $this->sender_id,
            'type' => $this->type,
            'text' => $this->text,
            'image_url' => $this->image_url,
            'proposal' => $proposal,
            'is_read' => $this->is_read,
            'created_at' => $this->created_at,
        ];
    }
}