<?php

namespace App\Console\Commands;

use App\Jobs\SendPushNotification;
use App\Models\Listing;
use Illuminate\Console\Command;

class SendListingReminders extends Command
{
    protected $signature = 'bizo:send-reminders';

    protected $description = 'Envoie les rappels pour les annonces actives publiees il y a 3 a 4 jours.';

    public function handle(): int
    {
        $listings = Listing::with('owner')
            ->where('status', 'active')
            ->whereNull('reminder_sent_at')
            ->whereBetween('created_at', [now()->subDays(4), now()->subDays(3)])
            ->get();

        foreach ($listings as $listing) {
            if ($listing->owner) {
                SendPushNotification::dispatch(
                    $listing->owner,
                    'Rappel annonce',
                    'Votre annonce est toujours en ligne.',
                    ['type' => 'listing_reminder', 'listing_id' => $listing->id],
                    'listing_reminder'
                );
            }

            $listing->update(['reminder_sent_at' => now()]);
        }

        $this->info("{$listings->count()} rappel(s) envoye(s).");

        return self::SUCCESS;
    }
}
