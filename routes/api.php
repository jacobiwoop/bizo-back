<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConversationController;
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\ListingController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RequestController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\TransactionController;
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
    Route::get('/search', [SearchController::class, 'index']);
    Route::get('/requests', [RequestController::class, 'index']);

    // ─── Routes authentifiées ─────────────────────────────
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/me', function (Request $request) {
            return new \App\Http\Resources\UserResource($request->user());
        });

        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::post('/auth/fcm-token', [AuthController::class, 'updateFcmToken']);

        // ─── Annonces authentifiées ───────────────────────
        Route::post('/listings', [ListingController::class, 'store']);
        Route::put('/listings/{id}', [ListingController::class, 'update']);
        Route::delete('/listings/{id}', [ListingController::class, 'destroy']);
        Route::post('/listings/{id}/photos', [ListingController::class, 'uploadPhotos']);
        Route::delete('/listings/{id}/photos/{idx}', [ListingController::class, 'deletePhoto']);
        Route::post('/listings/{id}/boost', [ListingController::class, 'boost']);
        Route::post('/listings/{id}/renew', [ListingController::class, 'renew']);

        Route::get('/my/listings', [ListingController::class, 'myListings']);

        // ─── Social ───────────────────────────────────────
        Route::get('/conversations', [ConversationController::class, 'index']);
        Route::post('/conversations', [ConversationController::class, 'store']);
        Route::get('/conversations/{id}/messages', [MessageController::class, 'index']);
        Route::post('/conversations/{id}/messages', [MessageController::class, 'store']);
        Route::post('/conversations/{id}/read', [MessageController::class, 'markRead']);

        Route::post('/transactions', [TransactionController::class, 'store']);
        Route::post('/reviews', [ReviewController::class, 'store']);
        Route::post('/reports', [ReportController::class, 'store']);
        Route::post('/requests', [RequestController::class, 'store']);
        Route::get('/my/requests', [RequestController::class, 'myRequests']);

        Route::get('/favorites', [FavoriteController::class, 'index']);
        Route::post('/favorites/{listingId}', [FavoriteController::class, 'store']);
        Route::delete('/favorites/{listingId}', [FavoriteController::class, 'destroy']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    });
});
