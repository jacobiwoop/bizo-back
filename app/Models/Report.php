<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $fillable = [
        'from_uid',
        'target_type',
        'target_id',
        'reason',
        'status',
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'from_uid');
    }
}
