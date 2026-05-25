<?php

namespace App\Http\Controllers;

use App\Events\ConversationMessageCreated;
use App\Events\ConversationSummaryUpdated;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Jobs\SendPushNotification;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use App\Models\User;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ConversationController extends Controller
{
    public function __construct(
        private readonly ConversationService $conversationService,
    ) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $userId = $request->user()->id;

        $conversations = Conversation::with(['participant1', 'participant2'])
            ->where('participant_1', $userId)
            ->orWhere('participant_2', $userId)
            ->orderByDesc('last_message_at')
            ->paginate($request->integer('per_page', 20));

        return ConversationResource::collection($conversations);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::with(['participant1', 'participant2', 'listing'])
            ->findOrFail($id);

        if (!in_array($request->user()->id, [$conversation->participant_1, $conversation->participant_2], true)) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        return response()->json([
            'data' => new ConversationResource($conversation),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'listing_id' => ['required', 'string', 'exists:listings,id'],
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $listing = Listing::with('owner')->findOrFail($validated['listing_id']);
        $buyer = $request->user();

        if ($listing->status !== 'active') {
            return response()->json(['message' => 'Annonce inactive.'], 400);
        }

        if ($buyer->id === $listing->owner_id) {
            return response()->json(['message' => 'Vous ne pouvez pas vous contacter vous-meme.'], 400);
        }

        $conversation = $this->conversationService->findOrCreate($listing, $buyer->id, $listing->owner_id);

        $message = Message::create([
            'conv_id' => $conversation->id,
            'sender_id' => $buyer->id,
            'type' => 'text',
            'text' => $validated['message'],
        ]);

        $conversation->update([
            'last_message' => $validated['message'],
            'last_message_at' => now(),
            'last_sender_id' => $buyer->id,
            'unread_p1' => $conversation->participant_1 === $buyer->id ? 0 : $conversation->unread_p1 + 1,
            'unread_p2' => $conversation->participant_2 === $buyer->id ? 0 : $conversation->unread_p2 + 1,
        ]);

        if ($listing->owner) {
            SendPushNotification::dispatch(
                $listing->owner,
                'Nouveau message',
                $validated['message'],
                ['type' => 'new_message', 'conv_id' => $conversation->id],
                'new_message'
            );
        }

        $conversation = $conversation->fresh()->load(['participant1', 'participant2']);
        $message = $message->fresh();

        event(new ConversationMessageCreated($message));
        $this->broadcastConversationSummary($conversation, [$buyer, $listing->owner]);

        return response()->json([
            'data' => new ConversationResource($conversation),
            'message' => new MessageResource($message),
        ], 201);
    }

    private function broadcastConversationSummary(Conversation $conversation, array $users): void
    {
        foreach ($users as $user) {
            if (! $user instanceof User) {
                continue;
            }

            event(new ConversationSummaryUpdated($conversation, $user));
        }
    }
}
