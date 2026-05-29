<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PendingLocation extends Model
{
    use HasFactory, HasUuids;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'name',
        'normalized_name',
        'parent_id',
        'country_code',
        'suggested_lat',
        'suggested_lng',
        'source',
        'usage_count',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'suggested_lat' => 'float',
            'suggested_lng' => 'float',
            'usage_count' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (PendingLocation $location) {
            $location->country_code = strtoupper($location->country_code);
            $location->normalized_name = $location->normalized_name ?: Location::normalizeName($location->name);
        });
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'parent_id');
    }
}
