<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChatMessage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'quick_replies',
        'metadata',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'quick_replies' => 'array',
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(ChatConversation::class, 'conversation_id');
    }
}
