<?php

use App\Models\Conversation;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
}, ['guards' => ['sanctum']]);

Broadcast::channel('users.{id}.conversations', function ($user, string $id) {
    return (string) $user->id === (string) $id;
}, ['guards' => ['sanctum']]);

Broadcast::channel('conversation.{conversationId}', function ($user, string $conversationId) {
    $conversation = Conversation::query()
        ->select(['id', 'participant_1', 'participant_2'])
        ->find($conversationId);

    if (! $conversation) {
        return false;
    }

    return in_array($user->id, [$conversation->participant_1, $conversation->participant_2], true);
}, ['guards' => ['sanctum']]);
