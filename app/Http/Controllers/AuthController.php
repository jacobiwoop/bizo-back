<?php

namespace App\Http\Controllers;

use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordWithOtpRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\SendPasswordOtpRequest;
use App\Http\Resources\UserResource;
use App\Models\PasswordResetOtp;
use App\Models\User;
use App\Notifications\PasswordResetOtpNotification;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'display_name' => $request->display_name,
            'username' => $request->username,
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;
        $user = $user->fresh();

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Identifiants incorrects',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();

        $user->updateQuietly(['last_seen_at' => now()]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => new UserResource($user),
        ]);
    }

    public function logout(): JsonResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $user->update(['fcm_token' => null]);

        if ($token = $user->currentAccessToken()) {
            $token->delete();
        }

        Auth::guard('web')->logout();

        return response()->json([
            'message' => 'Déconnexion réussie.',
        ]);
    }

    public function updateFcmToken(\Illuminate\Http\Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        $validated = $request->validate([
            'fcm_token' => ['required', 'string', 'max:500'],
        ]);

        $user->update([
            'fcm_token' => $validated['fcm_token'],
        ]);

        return response()->json([
            'message' => 'Token FCM mis a jour avec succes.',
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => 'Si ce compte existe, un lien de réinitialisation a été envoyé par email.',
        ]);
    }

    public function sendPasswordOtp(SendPasswordOtpRequest $request): JsonResponse
    {
        $email = strtolower((string) $request->input('email'));
        $user = User::where('email', $email)->first();

        if ($user) {
            $otp = (string) random_int(100000, 999999);
            $expiresInMinutes = 10;

            PasswordResetOtp::where('email', $email)
                ->whereNull('used_at')
                ->delete();

            PasswordResetOtp::create([
                'email' => $email,
                'otp_hash' => Hash::make($otp),
                'expires_at' => now()->addMinutes($expiresInMinutes),
            ]);

            $user->notify(new PasswordResetOtpNotification($otp, $expiresInMinutes));
        }

        return response()->json([
            'message' => 'Si ce compte existe, un code de réinitialisation a été envoyé par email.',
        ]);
    }

    public function resetPasswordWithOtp(ResetPasswordWithOtpRequest $request): JsonResponse
    {
        $email = strtolower((string) $request->input('email'));
        $otp = (string) $request->input('otp');
        $user = User::where('email', $email)->first();

        $resetOtp = PasswordResetOtp::where('email', $email)
            ->whereNull('used_at')
            ->latest()
            ->first();

        if (!$user || !$resetOtp || $resetOtp->isExpired() || $resetOtp->isLocked()) {
            return response()->json([
                'message' => 'Code OTP invalide ou expiré.',
            ], 400);
        }

        if (!Hash::check($otp, $resetOtp->otp_hash)) {
            $resetOtp->increment('attempts');

            return response()->json([
                'message' => 'Code OTP invalide ou expiré.',
            ], 400);
        }

        DB::transaction(function () use ($user, $resetOtp, $request, $email) {
            $user->forceFill([
                'password' => Hash::make((string) $request->input('password')),
            ])->save();

            $user->tokens()->delete();

            PasswordResetOtp::where('email', $email)
                ->whereNull('used_at')
                ->update(['used_at' => now()]);

            $resetOtp->forceFill(['used_at' => now()])->save();

            event(new PasswordReset($user));
        });

        return response()->json([
            'message' => 'Mot de passe mis à jour.',
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->save();

                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => __($status),
            ], 400);
        }

        return response()->json([
            'message' => 'Mot de passe réinitialisé avec succès.',
        ]);
    }
}
