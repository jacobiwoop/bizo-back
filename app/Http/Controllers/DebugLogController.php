<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreDebugLogRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DebugLogController extends Controller
{
    private const BASE_DIRECTORY = 'debug-logs';

    public function store(StoreDebugLogRequest $request): JsonResponse
    {
        $reference = $this->generateReference();
        $receivedAt = now()->toIso8601String();
        $user = $request->user();
        $directory = $this->userDirectory($user->id);
        $filename = sprintf('%s_%s.json', now()->format('Ymd_His'), $reference);

        $payload = [
            'reference' => $reference,
            'received_at' => $receivedAt,
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
                'display_name' => $user->display_name,
                'username' => $user->username,
            ],
            'app' => $request->input('app'),
            'device' => $request->input('device'),
            'context' => $request->input('context'),
            'logs' => $request->input('logs', []),
        ];

        Storage::disk('local')->put(
            $directory.'/'.$filename,
            json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        );

        return response()->json([
            'message' => 'Logs envoyes avec succes.',
            'reference' => $reference,
            'received_at' => $receivedAt,
        ], 201);
    }

    public function history(Request $request): JsonResponse
    {
        $directory = $this->userDirectory($request->user()->id);
        $files = collect(Storage::disk('local')->files($directory))
            ->sortDesc()
            ->take(50)
            ->values();

        $history = $files->map(function (string $path) {
            $decoded = json_decode(Storage::disk('local')->get($path), true) ?? [];

            return [
                'reference' => $decoded['reference'] ?? pathinfo($path, PATHINFO_FILENAME),
                'received_at' => $decoded['received_at'] ?? null,
                'log_count' => count($decoded['logs'] ?? []),
                'file' => basename($path),
            ];
        })->values();

        return response()->json([
            'data' => $history,
        ]);
    }

    private function generateReference(): string
    {
        for ($attempt = 0; $attempt < 20; $attempt++) {
            $reference = str_pad((string) random_int(0, 99999), 5, '0', STR_PAD_LEFT);

            if (!$this->referenceExistsToday($reference)) {
                return $reference;
            }
        }

        return now()->format('His');
    }

    private function referenceExistsToday(string $reference): bool
    {
        $todayDirectory = self::BASE_DIRECTORY.'/'.now()->format('Y/m/d');

        foreach (Storage::disk('local')->allFiles($todayDirectory) as $path) {
            if (str_ends_with($path, '_'.$reference.'.json')) {
                return true;
            }
        }

        return false;
    }

    private function userDirectory(string $userId): string
    {
        return self::BASE_DIRECTORY.'/'.now()->format('Y/m/d').'/'.$userId;
    }
}
