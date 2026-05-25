<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DebugLogsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_upload_debug_logs(): void
    {
        Storage::fake('local');
        $user = User::factory()->create([
            'email' => 'debug@bizo.ci',
            'display_name' => 'Debug User',
            'username' => 'debug_user',
        ]);

        $response = $this->actingAs($user)->postJson('/api/v1/debug-logs', [
            'app' => [
                'version' => '1.0.0-debug',
                'build' => 42,
            ],
            'device' => [
                'model' => 'Pixel 9',
                'android' => '16',
            ],
            'context' => [
                'screen' => 'conversation_thread',
            ],
            'logs' => [
                [
                    'timestamp' => '2026-05-25T12:00:00Z',
                    'level' => 'INFO',
                    'category' => 'MESSAGE',
                    'title' => 'Send message request',
                    'details' => 'Posting first message from detail screen.',
                ],
            ],
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['message', 'reference', 'received_at']);

        $reference = $response->json('reference');
        $this->assertMatchesRegularExpression('/^\d{5}$/', $reference);

        $directory = 'debug-logs/'.now()->format('Y/m/d').'/'.$user->id;
        $files = Storage::disk('local')->files($directory);

        $this->assertCount(1, $files);

        $stored = json_decode(Storage::disk('local')->get($files[0]), true);

        $this->assertSame($reference, $stored['reference']);
        $this->assertSame($user->id, $stored['user']['id']);
        $this->assertSame('Pixel 9', $stored['device']['model']);
        $this->assertSame('Send message request', $stored['logs'][0]['title']);
    }

    public function test_debug_logs_upload_requires_authentication(): void
    {
        $this->postJson('/api/v1/debug-logs', [
            'logs' => [
                ['title' => 'Anonymous log'],
            ],
        ])->assertUnauthorized();
    }

    public function test_authenticated_user_can_list_debug_log_history(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();

        $baseDirectory = 'debug-logs/'.now()->format('Y/m/d').'/'.$user->id;

        Storage::disk('local')->put($baseDirectory.'/20260525_101010_12345.json', json_encode([
            'reference' => '12345',
            'received_at' => '2026-05-25T10:10:10Z',
            'logs' => [
                ['title' => 'First log'],
                ['title' => 'Second log'],
            ],
        ]));

        Storage::disk('local')->put($baseDirectory.'/20260525_111111_54321.json', json_encode([
            'reference' => '54321',
            'received_at' => '2026-05-25T11:11:11Z',
            'logs' => [
                ['title' => 'Latest log'],
            ],
        ]));

        $response = $this->actingAs($user)->getJson('/api/v1/debug-logs/history');

        $response->assertOk()
            ->assertJsonPath('data.0.reference', '54321')
            ->assertJsonPath('data.0.log_count', 1)
            ->assertJsonPath('data.1.reference', '12345')
            ->assertJsonPath('data.1.log_count', 2);
    }
}
