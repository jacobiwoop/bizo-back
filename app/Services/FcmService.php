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
    public function send(string $fcmToken, string $title, string $body, array $data = [], ?string $imageUrl = null, bool $dataOnly = false): void
    {
        $accessToken = $this->getAccessToken();

        if (!$accessToken) {
            return;
        }

        $resolvedImageUrl = $this->resolveImageUrl($imageUrl);
        $stringData = array_map('strval', $data);
        $stringData['title'] ??= $title;
        $stringData['body'] ??= $body;

        if ($resolvedImageUrl) {
            $stringData['image_url'] = $resolvedImageUrl;
            $stringData['notification_avatar_url'] ??= $resolvedImageUrl;
        }

        $message = [
            'token' => $fcmToken,
            'data' => $stringData,
            'android' => [
                'priority' => 'high',
            ],
        ];

        if ($dataOnly) {
            Http::withToken($accessToken)
                ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", [
                    'message' => $message,
                ]);

            return;
        }

        $notification = [
            'title' => $title,
            'body' => $body,
        ];
        $androidNotification = [
            'channel_id' => 'bizo-alerts',
            'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
            'default_sound' => true,
            'default_vibrate_timings' => true,
            'notification_priority' => 'PRIORITY_HIGH',
        ];

        if ($resolvedImageUrl) {
            $notification['image'] = $resolvedImageUrl;
            $androidNotification['image'] = $resolvedImageUrl;
        }

        $message['notification'] = $notification;
        $message['android']['notification'] = $androidNotification;

        Http::withToken($accessToken)
            ->post("https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send", [
                'message' => $message,
            ]);
    }

    private function resolveImageUrl(?string $imageUrl): ?string
    {
        if (!$imageUrl) {
            return null;
        }

        if (str_starts_with($imageUrl, 'http://') || str_starts_with($imageUrl, 'https://')) {
            return $imageUrl;
        }

        if (str_starts_with($imageUrl, '/')) {
            return url($imageUrl);
        }

        return url('/'.$imageUrl);
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
