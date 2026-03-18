<?php

namespace App\Models;

use Database\Factories\RegulationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Regulation extends Model
{
    /** @use HasFactory<RegulationFactory> */
    use HasFactory;

    protected $fillable = [
        'exploitation_id',
        'type',
        'severity',
        'title',
        'description',
        'action_label',
        'action_url',
        'due_date',
        'is_read',
        'is_resolved',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'is_read' => 'boolean',
            'is_resolved' => 'boolean',
            'metadata' => 'array',
        ];
    }

    public function exploitation(): BelongsTo
    {
        return $this->belongsTo(Exploitation::class);
    }
}
