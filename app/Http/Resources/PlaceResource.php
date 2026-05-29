<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PlaceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'category' => $this->category,
            'location_id' => $this->location_id,
            'country_code' => $this->country_code,
            'lat' => $this->lat,
            'lng' => $this->lng,
            'source' => $this->source,
            'external_id' => $this->external_id,
            'confidence' => $this->confidence,
            'is_verified' => $this->is_verified,
            'tags' => $this->tags ?? [],
            'location' => new LocationResource($this->whenLoaded('location')),
        ];
    }
}
