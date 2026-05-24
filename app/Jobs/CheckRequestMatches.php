<?php

namespace App\Jobs;

use App\Models\Listing;
use App\Models\ListingRequest;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class CheckRequestMatches implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly ListingRequest $listingRequest,
    ) {}

    public function handle(): void
    {
        $matches = Listing::with('owner')
            ->where('status', 'active')
            ->where('category', $this->listingRequest->category)
            ->where('country', $this->listingRequest->country)
            ->when($this->listingRequest->max_price, function ($query) {
                $query->where(function ($query) {
                    $query->whereNull('price')
                        ->orWhere('price', '<=', $this->listingRequest->max_price);
                });
            })
            ->get();

        foreach ($matches as $listing) {
            if ($listing->owner_id === $this->listingRequest->owner_id) {
                continue;
            }

            if ($this->listingRequest->owner) {
                SendPushNotification::dispatch(
                    $this->listingRequest->owner,
                    'Annonce correspondante',
                    'Une annonce correspond a votre recherche.',
                    ['type' => 'request_match', 'listing_id' => $listing->id],
                    'request_match'
                );
            }
        }
    }
}
