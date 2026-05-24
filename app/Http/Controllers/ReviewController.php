<?php

namespace App\Http\Controllers;

use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'transaction_id' => ['required', 'string', 'exists:transactions,id'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:300'],
        ]);

        $transaction = Transaction::findOrFail($validated['transaction_id']);
        $author = $request->user();

        if (!in_array($author->id, [$transaction->seller_id, $transaction->buyer_id], true)) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        if (Review::where('from_uid', $author->id)->where('transaction_id', $transaction->id)->exists()) {
            return response()->json(['message' => 'Avis deja existant.'], 409);
        }

        $recipientId = $transaction->seller_id === $author->id ? $transaction->buyer_id : $transaction->seller_id;

        $review = Review::create([
            'from_uid' => $author->id,
            'to_uid' => $recipientId,
            'listing_id' => $transaction->listing_id,
            'transaction_id' => $transaction->id,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
        ]);

        $recipient = User::findOrFail($recipientId);
        $recipient->update([
            'rating' => Review::where('to_uid', $recipientId)->avg('rating') ?? 0,
            'review_count' => Review::where('to_uid', $recipientId)->count(),
        ]);

        $transaction->update([
            'seller_reviewed' => $transaction->seller_id === $author->id ? true : $transaction->seller_reviewed,
            'buyer_reviewed' => $transaction->buyer_id === $author->id ? true : $transaction->buyer_reviewed,
        ]);

        return response()->json([
            'data' => new ReviewResource($review->fresh()->load('author')),
        ], 201);
    }

    public function indexForUser(string $uid, Request $request): AnonymousResourceCollection
    {
        $reviews = Review::with('author')
            ->where('to_uid', $uid)
            ->latest()
            ->paginate($request->integer('per_page', 20));

        return ReviewResource::collection($reviews);
    }
}
