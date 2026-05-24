<?php

namespace App\Services;

use Google\Auth\Credentials\ServiceAccountCredentials;
use Google\Auth\HttpHandler\HttpHandlerFactory;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

        $serviceAccount = json_decode(base64_decode($serviceAccountJson), true);

        if (!$serviceAccount || !isset($serviceAccount['client_email'])) {
            return null;
        }

        try {
            $credentials = new ServiceAccountCredentials(
                'https://www.googleapis.com/auth/firebase.messaging',
                $serviceAccount
            );

            $token = $credentials->fetchAuthToken(HttpHandlerFactory::build());

            return $token['access_token'] ?? null;
        } catch (\Throwable $e) {
            Log::warning('Unable to fetch FCM access token.', [
                'error' => $e->getMessage(),
            ]);

            return null;
        }
    }
}
