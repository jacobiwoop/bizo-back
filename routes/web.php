<?php

use App\Http\Controllers\WebPasswordResetController;
use App\Http\Controllers\WebApkController;
use App\Http\Controllers\WebPreviewController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'name' => config('app.name'),
        'status' => 'bootstrapped',
    ]);
});

Route::get('/reset-password-complete', [WebPasswordResetController::class, 'complete'])->name('password.reset.complete');
Route::get('/reset-password/{token}', [WebPasswordResetController::class, 'show'])->name('password.reset');
Route::post('/reset-password', [WebPasswordResetController::class, 'store'])->name('password.update.web');

Route::get('/a/{listingId}', [WebPreviewController::class, 'listing'])->name('preview.listing');
Route::get('/u/{username}', [WebPreviewController::class, 'seller'])->name('preview.seller');
Route::get('/.well-known/assetlinks.json', [WebPreviewController::class, 'assetLinks'])->name('assetlinks');
Route::get('/downloads/android', [WebApkController::class, 'index'])->name('downloads.android');
Route::get('/downloads/android/latest.apk', [WebApkController::class, 'downloadLatest'])->name('downloads.android.latest');
