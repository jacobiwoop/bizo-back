<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable, SoftDeletes;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'email',
        'password',
        'display_name',
        'username',
        'bio',
        'photo_url',
        'country_code',
        'rating',
        'review_count',
        'total_sales',
        'fcm_token',
        'is_verified',
        'is_profile_public',
        'has_seen_onboarding',
        'response_rate',
        'avg_response_time',
        'last_seen_at',
        'blocked_users',
        'saved_searches',
        'notif_messages',
        'notif_troc',
        'notif_rappels',
        'notif_favoris',
    ];

    protected $hidden = [
        'password',
        'fcm_token',
        'blocked_users',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'blocked_users' => 'array',
            'saved_searches' => 'array',
            'is_profile_public' => 'boolean',
            'notif_messages' => 'boolean',
            'notif_troc' => 'boolean',
            'notif_rappels' => 'boolean',
            'notif_favoris' => 'boolean',
            'has_seen_onboarding' => 'boolean',
            'is_verified' => 'boolean',
            'review_count' => 'integer',
            'total_sales' => 'integer',
            'avg_response_time' => 'integer',
            'rating' => 'float',
            'response_rate' => 'float',
            'last_seen_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class, 'owner_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'to_uid');
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }
}
