<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Favorite;
use App\Http\Resources\ListingResource;
use App\Http\Resources\UserResource;
use App\Models\Listing;
use App\Models\ListingRequest;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Report;
use App\Models\User;
use App\Services\StorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ProfileController extends Controller
{
    public function __construct(
        private readonly StorageService $storageService,
    ) {}

    public function show(Request $request): UserResource
    {
        return new UserResource($request->user());
    }

    public function update(Request $request): UserResource
    {
        $user = $request->user();

        $validated = $request->validate([
            'display_name' => ['sometimes', 'string', 'max:80'],
            'username' => [
                'sometimes',
                'nullable',
                'regex:/^[a-z0-9_]{3,30}$/',
                Rule::unique('users', 'username')->ignore($user->id),
            ],
            'bio' => ['sometimes', 'nullable', 'string', 'max:500'],
            'country_code' => ['sometimes', 'nullable', 'string', 'max:5'],
            'is_profile_public' => ['sometimes', 'boolean'],
            'has_seen_onboarding' => ['sometimes', 'boolean'],
            'notif_messages' => ['sometimes', 'boolean'],
            'notif_troc' => ['sometimes', 'boolean'],
            'notif_rappels' => ['sometimes', 'boolean'],
            'notif_favoris' => ['sometimes', 'boolean'],
        ]);

        $user->update($validated);

        return new UserResource($user->fresh());
    }

    public function uploadAvatar(Request $request): UserResource
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:61440'],
        ]);

        $user = $request->user();

        if ($user->photo_url) {
            $this->storageService->deleteByUrl($user->photo_url);
        }

        $photoUrl = $this->storageService->uploadRaw($request->file('avatar'), 'avatars');

        $user->update([
            'photo_url' => $photoUrl,
        ]);

        return new UserResource($user->fresh());
    }

    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($user) {
            $listingIds = Listing::where('owner_id', $user->id)->pluck('id');
            $conversationIds = Conversation::query()
                ->where('participant_1', $user->id)
                ->orWhere('participant_2', $user->id)
                ->orWhereIn('listing_id', $listingIds)
                ->pluck('id');

            $listingPhotos = Listing::whereIn('id', $listingIds)
                ->pluck('photos')
                ->flatten()
                ->filter()
                ->values()
                ->all();

            if (!empty($listingPhotos)) {
                $this->storageService->deleteMany($listingPhotos);
            }

            if ($user->photo_url) {
                $this->storageService->deleteByUrl($user->photo_url);
            }

            Favorite::where('user_id', $user->id)->delete();
            Notification::where('user_id', $user->id)->delete();
            ListingRequest::where('owner_id', $user->id)->delete();
            Report::where('from_uid', $user->id)->delete();

            if ($conversationIds->isNotEmpty()) {
                Message::whereIn('conv_id', $conversationIds)->delete();
                Conversation::whereIn('id', $conversationIds)->delete();
            }

            Listing::whereIn('id', $listingIds)->update(['status' => 'deleted']);
            Listing::whereIn('id', $listingIds)->delete();

            $user->tokens()->delete();
            $user->delete();
        });

        return response()->json(null, 204);
    }

    public function publicShow(string $uid): UserResource
    {
        $user = User::query()
            ->whereKey($uid)
            ->where('is_profile_public', true)
            ->firstOrFail();

        return new UserResource($user);
    }

    public function publicListings(Request $request, string $uid): AnonymousResourceCollection
    {
        $user = User::query()
            ->whereKey($uid)
            ->where('is_profile_public', true)
            ->firstOrFail();

        $listings = $user->listings()
            ->active()
            ->with('owner')
            ->orderBy('is_boosted', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(min($request->integer('per_page', 20), 50));

        return ListingResource::collection($listings);
    }
}
