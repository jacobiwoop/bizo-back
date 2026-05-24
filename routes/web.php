<?php

use App\Http\Controllers\WebPreviewController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'status' => 'bootstrapped',
    ]);
});

Route::get('/reset-password/{token}', function (string $token) {
    return response()->json([
        'message' => 'Utilisez l application mobile pour finaliser la reinitialisation du mot de passe.',
        'token' => $token,
        'email' => request()->query('email'),
    ]);
})->name('password.reset');

Route::get('/a/{listingId}', [WebPreviewController::class, 'listing'])->name('preview.listing');
Route::get('/u/{username}', [WebPreviewController::class, 'seller'])->name('preview.seller');
Route::get('/.well-known/assetlinks.json', [WebPreviewController::class, 'assetLinks'])->name('assetlinks');
