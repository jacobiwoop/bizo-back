<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class AppDownloadTest extends TestCase
{
    use RefreshDatabase;

    private string $apkPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->apkPath = storage_path('framework/testing/mobile-builds');
        config()->set('mobile.apk_storage_path', $this->apkPath);
        File::deleteDirectory($this->apkPath);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->apkPath);

        parent::tearDown();
    }

    public function test_download_page_shows_empty_state_when_no_apk_exists(): void
    {
        $this->get('/downloads/android')
            ->assertOk()
            ->assertSee('Aucun APK disponible');
    }

    public function test_download_page_shows_latest_build_metadata(): void
    {
        File::ensureDirectoryExists($this->apkPath.'/latest');
        File::put($this->apkPath.'/latest/app-debug.apk', 'fake-apk');
        File::put($this->apkPath.'/latest/latest.json', json_encode([
            'download_name' => 'bizo-app-debug.apk',
            'version_name' => '1.0.0',
            'version_code' => 1,
            'git_sha' => 'eb5c25c',
            'built_at' => '2026-05-25T15:30:00Z',
        ], JSON_THROW_ON_ERROR));

        $this->get('/downloads/android')
            ->assertOk()
            ->assertSee('Telecharger le dernier APK')
            ->assertSee('eb5c25c');
    }

    public function test_latest_apk_can_be_downloaded(): void
    {
        File::ensureDirectoryExists($this->apkPath.'/latest');
        File::put($this->apkPath.'/latest/app-debug.apk', 'fake-apk');
        File::put($this->apkPath.'/latest/latest.json', json_encode([
            'download_name' => 'bizo-app-debug.apk',
        ], JSON_THROW_ON_ERROR));

        $this->get('/downloads/android/latest.apk')
            ->assertOk()
            ->assertHeader('content-type', 'application/vnd.android.package-archive')
            ->assertHeader('content-disposition');
    }
}
