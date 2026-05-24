<?php

namespace App\Http\Controllers;

use App\Http\Resources\ListingResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\StorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
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
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
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

        $user->tokens()->delete();
        $user->delete();

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
