<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'listing_id',
        'listing_title',
        'listing_photo',
        'participant_1',
        'participant_2',
        'last_message',
        'last_message_at',
        'last_sender_id',
        'unread_p1',
        'unread_p2',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
        ];
    }

    public function unreadCountFor(string $uid): int
    {
        if ($this->participant_1 === $uid) {
            return $this->unread_p1;
        }

        if ($this->participant_2 === $uid) {
            return $this->unread_p2;
        }

        return 0;
    }

    public function messageNotificationImageFor(User $sender, User $recipient): ?string
    {
        $this->loadMissing('listing');

        if ($this->listing && $this->listing->owner_id === $recipient->id) {
            return $sender->photo_url ?: $this->listing_photo;
        }

        return $this->listing_photo ?: $sender->photo_url;
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function participant1(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_1');
    }

    public function participant2(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_2');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class, 'conv_id');
    }
}
