<?php

namespace Tests\Feature;

use Tests\TestCase;

class CorsTest extends TestCase
{
    public function test_api_preflight_request_returns_cors_headers(): void
    {
        config()->set('cors.allowed_origins', ['*']);

        $response = $this->call('OPTIONS', '/api/v1/ping', [], [], [], [
            'HTTP_ORIGIN' => 'https://app.example.com',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
            'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'Authorization, Content-Type',
        ]);

        $response->assertNoContent();
        $response->assertHeader('Access-Control-Allow-Origin', '*');
        $response->assertHeader('Access-Control-Allow-Methods');
    }

    public function test_non_api_route_does_not_get_api_cors_headers(): void
    {
        config()->set('cors.allowed_origins', ['*']);

        $response = $this->call('OPTIONS', '/', [], [], [], [
            'HTTP_ORIGIN' => 'https://app.example.com',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ]);

        $this->assertFalse($response->headers->has('Access-Control-Allow-Origin'));
    }
}
