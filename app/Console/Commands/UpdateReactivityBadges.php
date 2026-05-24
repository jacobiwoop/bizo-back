<?php

namespace App\Console\Commands;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Console\Command;

class UpdateReactivityBadges extends Command
{
    protected $signature = 'bizo:update-reactivity-badges';

    protected $description = 'Recalcule avg_response_time et response_rate pour chaque utilisateur.';

    public function handle(): int
    {
        User::query()->each(function (User $user): void {
            $conversations = Conversation::where('participant_1', $user->id)
                ->orWhere('participant_2', $user->id)
                ->get();

            $responseTimes = [];
            $respondedCount = 0;

            foreach ($conversations as $conversation) {
                $messages = $conversation->messages()->orderBy('created_at')->get();

                $pendingIncoming = null;

                foreach ($messages as $message) {
                    if ($message->sender_id !== $user->id && $pendingIncoming === null) {
                        $pendingIncoming = $message->created_at;
                        continue;
                    }

                    if ($message->sender_id === $user->id && $pendingIncoming !== null) {
                        $responseTimes[] = $pendingIncoming->diffInSeconds($message->created_at);
                        $respondedCount++;
                        $pendingIncoming = null;
                    }
                }
            }

            $totalTracked = count($responseTimes) + collect($conversations)->filter(function (Conversation $conversation) use ($user) {
                $messages = $conversation->messages()->orderBy('created_at')->get();
                $firstIncoming = $messages->firstWhere('sender_id', '!=', $user->id);

                return $firstIncoming !== null;
            })->count() - $respondedCount;

            $user->update([
                'avg_response_time' => count($responseTimes) > 0 ? (int) round(array_sum($responseTimes) / count($responseTimes)) : null,
                'response_rate' => $totalTracked > 0 ? round(($respondedCount / $totalTracked) * 100, 2) : null,
            ]);
        });

        $this->info('Badges de reactivite recalcules.');

        return self::SUCCESS;
    }
}
