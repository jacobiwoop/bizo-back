<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'from_uid',
        'to_uid',
        'listing_id',
        'transaction_id',
        'rating',
        'comment',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_uid');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(User::class, 'to_uid');
    }

    public function listing(): BelongsTo
    {
        return $this->belongsTo(Listing::class);
    }

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(Transaction::class);
    }
}
