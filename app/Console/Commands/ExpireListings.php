<?php

namespace App\Console\Commands;

use App\Jobs\SendPushNotification;
use App\Models\Listing;
use Illuminate\Console\Command;

class ExpireListings extends Command
{
    protected $signature = 'bizo:expire-listings';

    protected $description = 'Expire les annonces actives dont la date de fin est depassee.';

    public function handle(): int
    {
        $listings = Listing::with('owner')
            ->where('status', 'active')
            ->whereNotNull('expires_at')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($listings as $listing) {
            $listing->update(['status' => 'expired']);

            if ($listing->owner) {
                SendPushNotification::dispatch(
                    $listing->owner,
                    'Annonce expiree',
                    'Votre annonce a expire.',
                    ['type' => 'listing_expired', 'listing_id' => $listing->id],
                    'listing_expired'
                );
            }
        }

        $this->info("{$listings->count()} annonce(s) expiree(s).");

        return self::SUCCESS;
    }
}
