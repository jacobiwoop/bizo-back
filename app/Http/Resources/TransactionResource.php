<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'listing_id' => $this->listing_id,
            'seller_id' => $this->seller_id,
            'buyer_id' => $this->buyer_id,
            'type' => $this->type,
            'final_price' => $this->final_price,
            'seller_reviewed' => $this->seller_reviewed,
            'buyer_reviewed' => $this->buyer_reviewed,
            'created_at' => $this->created_at,
        ];
    }
}