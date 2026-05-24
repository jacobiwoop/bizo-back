<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FavoriteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'listing_id' => $this->listing_id,
            'listing_title' => $this->listing_title,
            'listing_photo' => $this->listing_photo,
            'listing_price' => $this->listing_price,
            'listing_type' => $this->listing_type,
            'created_at' => $this->created_at,
            'listing' => new ListingResource($this->whenLoaded('listing')),
        ];
    }
}