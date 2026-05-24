<?php

namespace App\Http\Controllers;

use App\Http\Resources\TransactionResource;
use App\Jobs\SendPushNotification;
use App\Models\Listing;
use App\Models\Notification;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'listing_id' => ['required', 'string', 'exists:listings,id'],
            'buyer_id' => ['required', 'string', 'exists:users,id'],
            'type' => ['required', 'string', 'in:VENTE,TROC,TROC_CASH'],
            'final_price' => ['nullable', 'integer', 'min:0'],
        ]);

        $listing = Listing::findOrFail($validated['listing_id']);

        if ($request->user()->id !== $listing->owner_id) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        if ($listing->status !== 'active') {
            return response()->json(['message' => 'Annonce inactive.'], 400);
        }

        $transaction = Transaction::create([
            'listing_id' => $listing->id,
            'seller_id' => $request->user()->id,
            'buyer_id' => $validated['buyer_id'],
            'type' => $validated['type'],
            'final_price' => $validated['final_price'] ?? null,
        ]);

        $listing->update(['status' => 'sold']);

        $buyer = User::find($validated['buyer_id']);

        foreach ([$request->user(), $buyer] as $user) {
            if (!$user) {
                continue;
            }

            Notification::create([
                'user_id' => $user->id,
                'type' => 'transaction_done',
                'title' => 'Transaction finalisee',
                'body' => 'Une transaction vient d etre finalisee.',
                'data' => ['transaction_id' => $transaction->id],
            ]);
        }

        if ($buyer) {
            SendPushNotification::dispatch(
                $buyer,
                'Transaction finalisee',
                'Une transaction vient d etre finalisee.',
                ['type' => 'transaction_done', 'transaction_id' => $transaction->id],
                'transaction_done'
            );
        }

        return response()->json([
            'data' => new TransactionResource($transaction->fresh()),
        ], 201);
    }
}
