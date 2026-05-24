<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class FcmService
{
    private string $projectId;

    public function __construct()
    {
        $this->projectId = env('FCM_PROJECT_ID', 'bizo-f2187');
    }

    /**
     * Envoie une notification push via Firebase FCM HTTP v1.
     */
    public function send(string $fcmToken, string $title, string $body, array $data = []): void
    {
        $accessToken = $this->getAccessToken();

        if (!$accessToken) {
            return;
        }

        Http::withToken($accessToken)
            ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", [
                'message' => [
                    'token' => $fcmToken,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => array_map('strval', $data),
                    'android' => [
                        'priority' => 'high',
                        'notification' => [
                            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                        ],
                    ],
                ],
            ]);
    }

    private function getAccessToken(): ?string
    {
        $serviceAccountJson = env('FCM_SERVICE_ACCOUNT_JSON');

        if (!$serviceAccountJson) {
            return null;
        }

        return Cache::remember('fcm_access_token', 3300, function () use ($serviceAccountJson) {
            $serviceAccount = json_decode(base64_decode($serviceAccountJson), true);

            if (!$serviceAccount || !isset($serviceAccount['client_email'])) {
                return null;
            }

            $client = new \Google\Client();
            $client->setAuthConfig($serviceAccount);
            $client->addScope('https://www.googleapis.com/auth/firebase.messaging');

            return $client->fetchAccessTokenWithAssertion()['access_token'] ?? null;
        });
    }
}