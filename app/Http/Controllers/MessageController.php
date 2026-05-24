<?php

namespace App\Http\Controllers;

use App\Http\Resources\MessageResource;
use App\Jobs\SendPushNotification;
use App\Models\Conversation;
use App\Models\Listing;
use App\Models\Message;
use App\Services\ConversationService;
use App\Services\StorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MessageController extends Controller
{
    public function __construct(
        private readonly StorageService $storageService,
        private readonly ConversationService $conversationService,
    ) {}

    public function index(Request $request, string $id): AnonymousResourceCollection|JsonResponse
    {
        $conversation = Conversation::findOrFail($id);

        if (!in_array($request->user()->id, [$conversation->participant_1, $conversation->participant_2], true)) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        $this->conversationService->markAsRead($conversation, $request->user()->id);

        $messages = Message::where('conv_id', $conversation->id)
            ->orderBy('created_at')
            ->paginate($request->integer('per_page', 50));

        return MessageResource::collection($messages);
    }

    public function store(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::findOrFail($id);
        $user = $request->user();

        if (!in_array($user->id, [$conversation->participant_1, $conversation->participant_2], true)) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        $validated = $request->validate([
            'type' => ['required', 'string', 'in:text,image,troc_proposal'],
            'text' => ['required_if:type,text', 'nullable', 'string', 'max:1000'],
            'image' => ['required_if:type,image', 'nullable', 'image', 'mimes:jpg,jpeg,png', 'max:61440'],
            'offered_listing_id' => ['required_if:type,troc_proposal', 'nullable', 'string', 'exists:listings,id'],
            'cash_amount' => ['nullable', 'integer', 'min:0'],
        ]);

        $payload = [
            'conv_id' => $conversation->id,
            'sender_id' => $user->id,
            'type' => $validated['type'],
            'text' => $validated['type'] === 'text' ? $validated['text'] : null,
            'image_url' => null,
        ];

        if ($validated['type'] === 'image') {
            $payload['image_url'] = $this->storageService->uploadPhoto($request->file('image'), 'messages');
        }

        if ($validated['type'] === 'troc_proposal') {
            $offeredListing = Listing::findOrFail($validated['offered_listing_id']);

            if ($offeredListing->owner_id !== $user->id) {
                return response()->json(['message' => 'L annonce proposee doit vous appartenir.'], 403);
            }

            $payload = array_merge($payload, [
                'offered_listing_id' => $offeredListing->id,
                'offered_listing_title' => $offeredListing->title,
                'offered_listing_photo' => $offeredListing->photos[0] ?? null,
                'cash_amount' => $validated['cash_amount'] ?? null,
                'proposal_status' => 'pending',
            ]);
        }

        $message = Message::create($payload);

        $conversation->update([
            'last_message' => $validated['type'] === 'text' ? $validated['text'] : $validated['type'],
            'last_message_at' => now(),
            'last_sender_id' => $user->id,
            'unread_p1' => $conversation->participant_1 === $user->id ? 0 : $conversation->unread_p1 + 1,
            'unread_p2' => $conversation->participant_2 === $user->id ? 0 : $conversation->unread_p2 + 1,
        ]);

        $recipientId = $conversation->participant_1 === $user->id ? $conversation->participant_2 : $conversation->participant_1;
        $recipient = \App\Models\User::find($recipientId);

        if ($recipient) {
            $type = $validated['type'] === 'troc_proposal' ? 'troc_proposal' : 'new_message';
            $body = $validated['type'] === 'text' ? $validated['text'] : 'Nouveau message';

            SendPushNotification::dispatch(
                $recipient,
                'Nouveau message',
                $body,
                ['type' => $type, 'conv_id' => $conversation->id],
                $type
            );
        }

        return response()->json([
            'data' => new MessageResource($message->fresh()),
        ], 201);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::findOrFail($id);

        if (!in_array($request->user()->id, [$conversation->participant_1, $conversation->participant_2], true)) {
            return response()->json(['message' => 'Non autorise.'], 403);
        }

        Message::where('conv_id', $conversation->id)
            ->where('sender_id', '!=', $request->user()->id)
            ->update(['is_read' => true]);

        $this->conversationService->markAsRead($conversation, $request->user()->id);

        return response()->json(['message' => 'Messages marques comme lus.']);
    }
}
