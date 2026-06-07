<?php

namespace App\Jobs;

use App\Models\Notification as NotificationModel;
use App\Models\User;
use App\Services\FcmService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendPushNotification implements ShouldQueue
{
    use Queueable;

    /**
     * @param array<string, string> $data
     */
    public function __construct(
        private readonly User $user,
        private readonly string $title,
        private readonly string $body,
        private readonly array $data = [],
        private readonly string $type = 'new_message',
        private readonly ?string $imageUrl = null,
    ) {}

    public function handle(FcmService $fcm): void
    {
        // Verifier les preferences de notification
        $prefKey = match ($this->type) {
            'troc_proposal', 'troc_refused' => 'notif_troc',
            'listing_reminder', 'listing_expired' => 'notif_rappels',
            'new_favorite' => 'notif_favoris',
            default => 'notif_messages',
        };

        if (!$this->user->$prefKey) {
            return;
        }

        // Persister la notification en base
        NotificationModel::create([
            'user_id' => $this->user->id,
            'type' => $this->type,
            'title' => $this->title,
            'body' => $this->body,
            'data' => $this->data,
        ]);

        // Push FCM si token disponible
        if ($this->user->fcm_token) {
            $fcm->send($this->user->fcm_token, $this->title, $this->body, $this->data, $this->imageUrl);
        }
    }
}
