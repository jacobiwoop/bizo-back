<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Location extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'slug',
        'type',
        'parent_id',
        'country_code',
        'lat',
        'lng',
        'source',
        'external_id',
        'confidence',
        'is_verified',
    ];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
            'confidence' => 'float',
            'is_verified' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Location $location) {
            $location->country_code = strtoupper($location->country_code);
            $location->slug = $location->slug ?: self::normalizeName($location->name);
        });
    }

    public static function normalizeName(string $value): string
    {
        return Str::of($value)->ascii()->lower()->squish()->replaceMatches('/[^a-z0-9]+/', '-')->trim('-')->toString();
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Location::class, 'parent_id');
    }

    public function places(): HasMany
    {
        return $this->hasMany(Place::class);
    }
}
