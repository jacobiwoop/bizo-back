<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'from_uid' => $this->from_uid,
            'to_uid' => $this->to_uid,
            'listing_id' => $this->listing_id,
            'transaction_id' => $this->transaction_id,
            'rating' => $this->rating,
            'comment' => $this->comment,
            'author' => new UserResource($this->whenLoaded('author')),
            'created_at' => $this->created_at,
        ];
    }
}