<?php

namespace App\Http\Controllers;

use App\Http\Resources\ListingRequestResource;
use App\Jobs\CheckRequestMatches;
use App\Models\ListingRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

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
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'category' => ['required', 'string', 'max:50'],
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
}
