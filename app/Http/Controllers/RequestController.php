<?php

namespace App\Http\Controllers;

use App\Http\Resources\ListingRequestResource;
use App\Jobs\CheckRequestMatches;
use App\Models\ListingRequest;
use App\Support\ListingCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class RequestController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $requests = ListingRequest::where('status', 'active')
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return ListingRequestResource::collection($requests);
    }

    public function myRequests(Request $request): AnonymousResourceCollection
    {
        $requests = ListingRequest::where('owner_id', $request->user()->id)
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return ListingRequestResource::collection($requests);
    }

    public function store(Request $request): JsonResponse
    {
        $request->merge([
            'category' => ListingCategory::normalize($request->input('category')),
        ]);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', Rule::in(ListingCategory::values())],
            'max_price' => ['nullable', 'integer', 'min:0'],
            'country' => ['required', 'string', 'max:5'],
            'city' => ['required', 'string', 'max:80'],
        ]);

        $listingRequest = ListingRequest::create([
            'owner_id' => $request->user()->id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'category' => $validated['category'],
            'max_price' => $validated['max_price'] ?? null,
            'country' => $validated['country'],
            'city' => $validated['city'],
            'status' => 'active',
            'expires_at' => now()->addDays(30),
        ]);

        CheckRequestMatches::dispatch($listingRequest);

        return response()->json([
            'data' => new ListingRequestResource($listingRequest),
        ], 201);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $listingRequest = ListingRequest::findOrFail($id);

        if ($listingRequest->owner_id !== $request->user()->id) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        $listingRequest->delete();

        return response()->json(null, 204);
    }
}
