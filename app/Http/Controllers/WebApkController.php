<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class WebApkController extends Controller
{
    public function index(): View
    {
        $build = $this->latestBuild();

        return view('downloads.apk', [
            'build' => $build,
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
}
