<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class AppDownloadTest extends TestCase
{
    use RefreshDatabase;

    private string $apkPath;
    private string $logPath;
    private string $scriptPath;

    protected function setUp(): void
    {
        parent::setUp();

        $this->apkPath = storage_path('framework/testing/mobile-builds');
        $this->logPath = storage_path('framework/testing/mobile-apk-build.log');
        $this->scriptPath = storage_path('framework/testing/fake-mobile-build.sh');
        config()->set('mobile.apk_storage_path', $this->apkPath);
        config()->set('mobile.build_log_path', $this->logPath);
        config()->set('mobile.build_script_path', $this->scriptPath);
        File::deleteDirectory($this->apkPath);
        File::delete($this->logPath);
        File::delete($this->scriptPath);
    }

    protected function tearDown(): void
    {
        File::deleteDirectory($this->apkPath);
        File::delete($this->logPath);
        File::delete($this->scriptPath);

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

    public function test_download_page_shows_build_controls_when_token_is_configured(): void
    {
        config()->set('mobile.build_trigger_token', 'secret-build-token');

        $this->get('/downloads/android')
            ->assertOk()
            ->assertSee('Activer le mode build');
    }

    public function test_authorize_build_rejects_invalid_token(): void
    {
        config()->set('mobile.build_trigger_token', 'secret-build-token');

        $this->post('/downloads/android/authorize', [
            'token' => 'wrong-token',
        ])
            ->assertRedirect()
            ->assertSessionHas('build_error', 'Token de build invalide.');
    }

    public function test_authorize_build_accepts_valid_token(): void
    {
        config()->set('mobile.build_trigger_token', 'secret-build-token');

        $this->post('/downloads/android/authorize', [
            'token' => 'secret-build-token',
        ])
            ->assertRedirect(route('downloads.android'))
            ->assertSessionHas('build_success', 'Mode build active pour cette session.');
    }

    public function test_trigger_build_requires_authorized_session(): void
    {
        config()->set('mobile.build_trigger_token', 'secret-build-token');

        $this->post('/downloads/android/build')
            ->assertRedirect()
            ->assertSessionHas('build_error', 'Session build non autorisee.');
    }

    public function test_trigger_build_accepts_authorized_session_without_reentering_token(): void
    {
        config()->set('mobile.build_trigger_token', 'secret-build-token');
        File::put($this->scriptPath, "#!/usr/bin/env bash\necho 'fake build' >> ".escapeshellarg($this->logPath)."\n");
        chmod($this->scriptPath, 0755);

        $this->withSession([
            'downloads.android.build_authorized' => true,
        ])->post('/downloads/android/build')
            ->assertRedirect(route('downloads.android'))
            ->assertSessionHas('build_success');
    }

    public function test_logout_build_clears_authorized_session(): void
    {
        config()->set('mobile.build_trigger_token', 'secret-build-token');

        $this->withSession([
            'downloads.android.build_authorized' => true,
        ])->post('/downloads/android/logout')
            ->assertRedirect(route('downloads.android'))
            ->assertSessionHas('build_success', 'Mode build desactive.');
    }
}
