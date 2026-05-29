<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ListingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'type' => $this->type,
            'price' => $this->price,
            'cash_complement' => $this->cash_complement,
            'exchange_for' => $this->exchange_for,
            'category' => $this->category,
            'attributes' => $this->attributes ?? [],
            'condition' => $this->condition,
            'delivery_mode' => $this->delivery_mode,
            'photos' => $this->photos ?? [],
            'country' => $this->country,
            'city' => $this->city,
            'neighborhood' => $this->neighborhood,
            'location_id' => $this->location_id,
            'place_id' => $this->place_id,
            'display_lat' => $this->display_lat,
            'display_lng' => $this->display_lng,
            'location_accuracy' => $this->location_accuracy,
            'exact_lat' => $this->when($request->user()?->id === $this->owner_id, $this->exact_lat),
            'exact_lng' => $this->when($request->user()?->id === $this->owner_id, $this->exact_lng),
            'location' => new LocationResource($this->whenLoaded('location')),
            'place' => new PlaceResource($this->whenLoaded('place')),
            'tags' => $this->tags ?? [],
            'view_count' => $this->view_count,
            'favorite_count' => $this->favorite_count,
            'distance_km' => $this->when(isset($this->distance_km), round((float) $this->distance_km, 2)),
            'status' => $this->status,
            'is_boosted' => $this->is_boosted,
            'price_history' => $this->price_history ?? [],
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'owner' => new UserResource($this->whenLoaded('owner')),
        ];
    }
}
