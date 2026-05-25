<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\Process\Process;

class WebApkController extends Controller
{
    public function index(Request $request): View
    {
        $build = $this->latestBuild();

        return view('downloads.apk', [
            'build' => $build,
            'buildStatus' => $this->buildStatus(),
            'showBuildControls' => filled(config('mobile.build_trigger_token')),
            'tokenPrefilled' => $request->query('token', ''),
        ]);
    }

    public function downloadLatest(): BinaryFileResponse
    {
        $build = $this->latestBuild();

        abort_unless($build !== null, 404, 'Aucun APK disponible.');

        return response()->download(
            $build['path'],
            $build['download_name'],
            ['Content-Type' => 'application/vnd.android.package-archive']
        );
    }

    public function triggerBuild(Request $request): RedirectResponse
    {
        $expectedToken = (string) config('mobile.build_trigger_token');

        abort_unless($expectedToken !== '', 404);

        $providedToken = (string) $request->input('token', '');

        if (! hash_equals($expectedToken, $providedToken)) {
            return back()->withInput()->with('build_error', 'Token de build invalide.');
        }

        $scriptPath = (string) config('mobile.build_script_path');
        $logPath = (string) config('mobile.build_log_path');

        if ($scriptPath === '' || ! File::exists($scriptPath)) {
            return back()->with('build_error', 'Script de build introuvable.');
        }

        File::ensureDirectoryExists(dirname($logPath));

        $command = sprintf(
            "mkdir -p %s %s && touch %s && nohup env OUTPUT_DIR=%s bash %s >> %s 2>&1 < /dev/null & echo $!",
            escapeshellarg(dirname($logPath)),
            escapeshellarg((string) config('mobile.apk_storage_path')),
            escapeshellarg($logPath),
            escapeshellarg((string) config('mobile.apk_storage_path')),
            escapeshellarg($scriptPath),
            escapeshellarg($logPath)
        );

        $process = Process::fromShellCommandline($command, base_path());
        $process->setTimeout(10);
        $process->run();

        if (! $process->isSuccessful()) {
            return back()->with('build_error', 'Impossible de lancer le build APK.');
        }

        $pid = trim($process->getOutput());

        return redirect()
            ->route('downloads.android')
            ->with('build_success', $pid !== '' ? "Build lance en arriere-plan (PID $pid)." : 'Build lance en arriere-plan.');
    }

    private function latestBuild(): ?array
    {
        $basePath = config('mobile.apk_storage_path');
        $latestApk = $basePath.'/latest/app-debug.apk';
        $metadataPath = $basePath.'/latest/latest.json';

        if (! File::exists($latestApk)) {
            return null;
        }

        $metadata = [];

        if (File::exists($metadataPath)) {
            $decoded = json_decode(File::get($metadataPath), true);
            if (is_array($decoded)) {
                $metadata = $decoded;
            }
        }

        $builtAt = $metadata['built_at'] ?? null;

        return [
            'path' => $latestApk,
            'download_name' => $metadata['download_name'] ?? 'bizo-app-debug.apk',
            'version' => $metadata['version_name'] ?? null,
            'version_code' => $metadata['version_code'] ?? null,
            'git_sha' => $metadata['git_sha'] ?? null,
            'size_mb' => round(File::size($latestApk) / 1024 / 1024, 2),
            'built_at' => $builtAt ? Carbon::parse($builtAt) : Carbon::createFromTimestamp(File::lastModified($latestApk)),
        ];
    }

    private function buildStatus(): array
    {
        $logPath = (string) config('mobile.build_log_path');
        $logTail = null;
        $logUpdatedAt = null;

        if ($logPath !== '' && File::exists($logPath)) {
            $content = File::get($logPath);
            $lines = preg_split("/\r\n|\n|\r/", $content) ?: [];
            $logTail = trim(implode("\n", array_slice($lines, -40)));
            $logUpdatedAt = Carbon::createFromTimestamp(File::lastModified($logPath));
        }

        return [
            'log_tail' => $logTail,
            'log_updated_at' => $logUpdatedAt,
        ];
    }
}
