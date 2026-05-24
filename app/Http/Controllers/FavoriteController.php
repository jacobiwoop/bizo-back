<?php

namespace App\Http\Controllers;

use App\Http\Resources\FavoriteResource;
use App\Jobs\SendPushNotification;
use App\Models\Favorite;
use App\Models\Listing;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FavoriteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $favorites = Favorite::with('listing')
            ->where('user_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return FavoriteResource::collection($favorites);
    }

    public function store(Request $request, string $listingId): JsonResponse
    {
        $listing = Listing::with('owner')->findOrFail($listingId);

        $favorite = Favorite::firstOrCreate(
            [
                'user_id' => $request->user()->id,
                'listing_id' => $listing->id,
            ],
            [
                'listing_title' => $listing->title,
                'listing_photo' => $listing->photos[0] ?? null,
                'listing_price' => $listing->price,
                'listing_type' => $listing->type,
            ]
        );

        if ($favorite->wasRecentlyCreated) {
            $listing->increment('favorite_count');

            if ($listing->owner && $listing->owner_id !== $request->user()->id) {
                SendPushNotification::dispatch(
                    $listing->owner,
                    'Nouveau favori',
                    'Quelqu un a ajoute votre annonce en favori.',
                    ['type' => 'new_favorite', 'listing_id' => $listing->id],
                    'new_favorite'
                );
            }
        }

        return response()->json([
            'data' => new FavoriteResource($favorite->fresh()->load('listing')),
        ], 201);
    }

    public function destroy(Request $request, string $listingId): JsonResponse
    {
        $favorite = Favorite::where('user_id', $request->user()->id)
            ->where('listing_id', $listingId)
            ->first();

        if (!$favorite) {
            return response()->json(['message' => 'Favori introuvable.'], 404);
        }

        $listing = Listing::find($listingId);
        $favorite->delete();

        if ($listing && $listing->favorite_count > 0) {
            $listing->decrement('favorite_count');
        }

        return response()->json(null, 204);
    }
}
