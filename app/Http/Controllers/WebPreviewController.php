<?php

namespace App\Http\Controllers;

use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\View\View;

class WebPreviewController extends Controller
{
    public function listing(string $listingId): View
    {
        $listing = Listing::with('owner')->findOrFail($listingId);

        return view('preview.listing', [
            'listing' => $listing,
            'owner' => $listing->owner,
        ]);
    }

    public function seller(string $username): View
    {
        $seller = User::query()
            ->where('username', $username)
            ->where('is_profile_public', true)
            ->with([
                'listings' => fn ($query) => $query->active()->latest()->limit(6),
            ])
            ->firstOrFail();

        return view('preview.seller', [
            'seller' => $seller,
            'listings' => $seller->listings,
        ]);
    }

    public function assetLinks(): JsonResponse
    {
        $packageName = config('services.android_app.package_name');
        $fingerprints = config('services.android_app.sha256_cert_fingerprints', []);

        if (!$packageName || empty($fingerprints)) {
            return response()->json([]);
        }

        return response()->json([
            [
                'relation' => ['delegate_permission/common.handle_all_urls'],
                'target' => [
                    'namespace' => 'android_app',
                    'package_name' => $packageName,
                    'sha256_cert_fingerprints' => array_values($fingerprints),
                ],
            ],
        ]);
    }
}
