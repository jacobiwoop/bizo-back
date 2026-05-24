<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'email' => $this->email,
            'display_name' => $this->display_name,
            'username' => $this->username,
            'photo_url' => $this->photo_url,
            'bio' => $this->bio,
            'country_code' => $this->country_code,
            'rating' => $this->rating,
            'review_count' => $this->review_count,
            'total_sales' => $this->total_sales,
            'is_verified' => $this->is_verified,
            'has_seen_onboarding' => $this->has_seen_onboarding,
            'created_at' => $this->created_at,
        ];
    }
}