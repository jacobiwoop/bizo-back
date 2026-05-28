<?php

namespace Tests\Feature;

use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Notifications\PasswordResetOtpNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function validRegisterData(): array
    {
        return [
            'email' => 'test@bizo.ci',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'display_name' => 'Kouassi Test',
            'username' => 'kouassi_test',
        ];
    }

    // ─── POST /auth/register ──────────────────────────────────

    public function test_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validRegisterData());

        $response->assertStatus(201)
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'email', 'display_name', 'username', 'photo_url'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'test@bizo.ci',
            'display_name' => 'Kouassi Test',
            'username' => 'kouassi_test',
        ]);
    }

    public function test_register_requires_email(): void
    {
        $response = $this->postJson('/api/v1/auth/register', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password', 'display_name']);
    }

    public function test_register_requires_valid_email(): void
    {
        $data = $this->validRegisterData();
        $data['email'] = 'pas-un-email';

        $response = $this->postJson('/api/v1/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_register_requires_unique_email(): void
    {
        User::factory()->create(['email' => 'test@bizo.ci']);

        $response = $this->postJson('/api/v1/auth/register', $this->validRegisterData());

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_register_requires_min_8_chars_password(): void
    {
        $data = $this->validRegisterData();
        $data['password'] = '1234567';
        $data['password_confirmation'] = '1234567';

        $response = $this->postJson('/api/v1/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_register_requires_password_confirmation(): void
    {
        $data = $this->validRegisterData();
        unset($data['password_confirmation']);

        $response = $this->postJson('/api/v1/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_register_accepts_null_username(): void
    {
        $data = $this->validRegisterData();
        $data['username'] = null;

        $response = $this->postJson('/api/v1/auth/register', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', [
            'email' => 'test@bizo.ci',
            'username' => null,
        ]);
    }

    public function test_register_validates_username_format(): void
    {
        $data = $this->validRegisterData();
        $data['username'] = 'INVALID UPPERCASE';

        $response = $this->postJson('/api/v1/auth/register', $data);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['username']);
    }

    public function test_register_returns_token(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->validRegisterData());

        $response->assertStatus(201);
        $this->assertNotEmpty($response->json('token'));
    }

    // ─── POST /auth/login ─────────────────────────────────────

    public function test_login_with_valid_credentials(): void
    {
        User::factory()->create([
            'email' => 'test@bizo.ci',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@bizo.ci',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'email', 'display_name'],
            ]);
    }

    public function test_login_with_wrong_password(): void
    {
        User::factory()->create([
            'email' => 'test@bizo.ci',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'test@bizo.ci',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Identifiants incorrects',
            ]);
    }

    public function test_login_with_non_existent_email(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@bizo.ci',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    // ─── POST /auth/logout ────────────────────────────────────

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200);

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_logout_requires_auth(): void
    {
        $response = $this->postJson('/api/v1/auth/logout');

        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_update_fcm_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withToken($token)
            ->postJson('/api/v1/auth/fcm-token', [
                'fcm_token' => 'fcm_token_device_123',
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Token FCM mis a jour avec succes.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'fcm_token' => 'fcm_token_device_123',
        ]);
    }

    public function test_fcm_token_update_requires_auth(): void
    {
        $response = $this->postJson('/api/v1/auth/fcm-token', [
            'fcm_token' => 'fcm_token_device_123',
        ]);

        $response->assertStatus(401);
    }

    public function test_forgot_password_returns_generic_message_for_existing_email(): void
    {
        User::factory()->create(['email' => 'test@bizo.ci']);

        $response = $this->postJson('/api/v1/auth/password/reset', [
            'email' => 'test@bizo.ci',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Si ce compte existe, un lien de réinitialisation a été envoyé par email.',
            ]);
    }

    public function test_forgot_password_returns_generic_message_for_unknown_email(): void
    {
        $response = $this->postJson('/api/v1/auth/password/reset', [
            'email' => 'unknown@bizo.ci',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Si ce compte existe, un lien de réinitialisation a été envoyé par email.',
            ]);
    }

    public function test_password_otp_send_creates_hashed_code_and_sends_notification(): void
    {
        Notification::fake();

        $user = User::factory()->create(['email' => 'test@bizo.ci']);

        $response = $this->postJson('/api/v1/auth/password/otp/send', [
            'email' => 'test@bizo.ci',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Si ce compte existe, un code de réinitialisation a été envoyé par email.',
            ]);

        $otp = PasswordResetOtp::where('email', 'test@bizo.ci')->first();

        $this->assertNotNull($otp);
        $this->assertFalse(Hash::check('000000', $otp->otp_hash));
        $this->assertTrue($otp->expires_at->greaterThan(now()));

        Notification::assertSentTo($user, PasswordResetOtpNotification::class, function ($notification) {
            return preg_match('/^\d{6}$/', $notification->otp) === 1;
        });
    }

    public function test_password_otp_send_is_neutral_for_unknown_email(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/password/otp/send', [
            'email' => 'unknown@bizo.ci',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Si ce compte existe, un code de réinitialisation a été envoyé par email.',
            ]);

        $this->assertDatabaseCount('password_reset_otps', 0);
        Notification::assertNothingSent();
    }

    public function test_password_otp_reset_updates_password_and_revokes_tokens(): void
    {
        $user = User::factory()->create([
            'email' => 'test@bizo.ci',
            'password' => bcrypt('oldpassword123'),
        ]);
        $user->createToken('auth-token');

        PasswordResetOtp::create([
            'email' => 'test@bizo.ci',
            'otp_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->postJson('/api/v1/auth/password/otp/reset', [
            'email' => 'test@bizo.ci',
            'otp' => '123456',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Mot de passe mis à jour.',
            ]);

        $user->refresh();

        $this->assertTrue(Hash::check('newpassword123', $user->password));
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertNotNull(PasswordResetOtp::where('email', 'test@bizo.ci')->first()->used_at);
    }

    public function test_password_otp_reset_rejects_invalid_code(): void
    {
        User::factory()->create([
            'email' => 'test@bizo.ci',
            'password' => bcrypt('oldpassword123'),
        ]);

        $otp = PasswordResetOtp::create([
            'email' => 'test@bizo.ci',
            'otp_hash' => Hash::make('123456'),
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = $this->postJson('/api/v1/auth/password/otp/reset', [
            'email' => 'test@bizo.ci',
            'otp' => '654321',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(400)
            ->assertJson([
                'message' => 'Code OTP invalide ou expiré.',
            ]);

        $this->assertSame(1, $otp->fresh()->attempts);
    }

    public function test_web_reset_password_page_renders_html_form(): void
    {
        $response = $this->get('/reset-password/sample-token?email=test@bizo.ci');

        $response->assertStatus(200)
            ->assertSee('Réinitialiser le mot de passe')
            ->assertSee('test@bizo.ci')
            ->assertDontSee('Utilisez l application mobile');
    }

    public function test_reset_password_updates_password_and_revokes_tokens(): void
    {
        $user = User::factory()->create([
            'email' => 'test@bizo.ci',
            'password' => bcrypt('oldpassword123'),
        ]);
        $user->createToken('auth-token');
        $token = Password::createToken($user);

        $response = $this->postJson('/api/v1/auth/password/update', [
            'email' => 'test@bizo.ci',
            'token' => $token,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Mot de passe réinitialisé avec succès.',
            ]);

        $user->refresh();

        $this->assertTrue(Hash::check('newpassword123', $user->password));
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_web_reset_password_updates_password_and_redirects_to_success_page(): void
    {
        $user = User::factory()->create([
            'email' => 'test@bizo.ci',
            'password' => bcrypt('oldpassword123'),
        ]);

        $token = Password::createToken($user);

        $response = $this->post('/reset-password', [
            'email' => 'test@bizo.ci',
            'token' => $token,
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertRedirect(route('password.reset.complete'));

        $user->refresh();

        $this->assertTrue(Hash::check('newpassword123', $user->password));
    }

    public function test_reset_password_requires_valid_token(): void
    {
        User::factory()->create(['email' => 'test@bizo.ci']);

        $response = $this->postJson('/api/v1/auth/password/update', [
            'email' => 'test@bizo.ci',
            'token' => 'invalid-token',
            'password' => 'newpassword123',
            'password_confirmation' => 'newpassword123',
        ]);

        $response->assertStatus(400);
    }
}
