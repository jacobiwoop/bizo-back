<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'android_app' => [
        'package_name' => env('ANDROID_APP_PACKAGE_NAME'),
        'sha256_cert_fingerprints' => array_values(array_filter(array_map(
            static fn (string $fingerprint) => trim($fingerprint),
            explode(',', (string) env('ANDROID_APP_SHA256_CERT_FINGERPRINTS', ''))
        ))),
        'play_store_url' => env('ANDROID_APP_PLAY_STORE_URL', '#'),
    ],

    'location' => [
        'osm_user_agent' => env('BIZO_OSM_USER_AGENT', 'BizoLocationResearch/1.0'),
        'nominatim_url' => env('BIZO_NOMINATIM_URL', 'https://nominatim.openstreetmap.org'),
        'overpass_url' => env('BIZO_OVERPASS_URL', 'https://overpass-api.de/api/interpreter'),
        'mapbox_token' => env('MAPBOX_TOKEN'),
    ],

];
