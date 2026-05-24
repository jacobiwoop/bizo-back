<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ListingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/ping', function () {
        return response()->json([
            'status' => 'ok',
            'service' => config('app.name'),
        ]);
    });

    // ─── Auth publique ────────────────────────────────────
    Route::controller(AuthController::class)->group(function () {
        Route::post('/auth/register', 'register');
        Route::post('/auth/login', 'login');
        Route::post('/auth/password/reset', 'forgotPassword');
        Route::post('/auth/password/update', 'resetPassword');
    });

    // ─── Annonces publiques ───────────────────────────────
    Route::get('/listings', [ListingController::class, 'index']);
    Route::get('/listings/{id}', [ListingController::class, 'show']);
    Route::get('/listings/{id}/similar', [ListingController::class, 'similar']);

    // ─── Routes authentifiées ─────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', function (Request $request) {
            return new \App\Http\Resources\UserResource($request->user());
        });

        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // ─── Annonces authentifiées ───────────────────────
        Route::post('/listings', [ListingController::class, 'store']);
        Route::put('/listings/{id}', [ListingController::class, 'update']);
        Route::delete('/listings/{id}', [ListingController::class, 'destroy']);
        Route::post('/listings/{id}/photos', [ListingController::class, 'uploadPhotos']);
        Route::delete('/listings/{id}/photos/{idx}', [ListingController::class, 'deletePhoto']);
        Route::post('/listings/{id}/boost', [ListingController::class, 'boost']);
        Route::post('/listings/{id}/renew', [ListingController::class, 'renew']);

        Route::get('/my/listings', [ListingController::class, 'myListings']);
    });
});
