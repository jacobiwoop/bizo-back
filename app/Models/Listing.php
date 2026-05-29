<?php

namespace App\Models;

use App\Support\ListingCategory;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'owner_id',
        'title',
        'title_search',
        'description',
        'type',
        'price',
        'cash_complement',
        'exchange_for',
        'category',
        'attributes',
        'condition',
        'delivery_mode',
        'photos',
        'country',
        'city',
        'neighborhood',
        'location_id',
        'place_id',
        'exact_lat',
        'exact_lng',
        'display_lat',
        'display_lng',
        'location_accuracy',
        'tags',
        'status',
        'is_boosted',
        'boosted_until',
        'price_history',
        'expires_at',
        'reminder_sent_at',
    ];

    protected function casts(): array
    {
        return [
            'photos' => 'array',
            'attributes' => 'array',
            'tags' => 'array',
            'price_history' => 'array',
            'is_boosted' => 'boolean',
            'exact_lat' => 'float',
            'exact_lng' => 'float',
            'display_lat' => 'float',
            'display_lng' => 'float',
            'boosted_until' => 'datetime',
            'expires_at' => 'datetime',
            'reminder_sent_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    protected function title(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => [
                'title' => $value,
                'title_search' => mb_strtolower($value),
            ],
        );
    }

    protected function category(): Attribute
    {
        return Attribute::make(
            set: fn (?string $value) => ListingCategory::normalize($value),
        );
    }

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function place(): BelongsTo
    {
        return $this->belongsTo(Place::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
