<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Place extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'slug',
        'category',
        'location_id',
        'country_code',
        'lat',
        'lng',
        'source',
        'external_id',
        'confidence',
        'is_verified',
        'tags',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'confidence' => 'float',
            'is_verified' => 'boolean',
            'tags' => 'array',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Place $place) {
            $place->country_code = strtoupper($place->country_code);
            $place->slug = $place->slug ?: Location::normalizeName($place->name);
        });
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
