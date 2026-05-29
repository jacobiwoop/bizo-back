<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PendingLocationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'normalized_name' => $this->normalized_name,
            'parent_id' => $this->parent_id,
            'country_code' => $this->country_code,
            'suggested_lat' => $this->suggested_lat,
            'suggested_lng' => $this->suggested_lng,
            'source' => $this->source,
            'usage_count' => $this->usage_count,
            'status' => $this->status,
            'parent' => new LocationResource($this->whenLoaded('parent')),
        ];
    }
}
