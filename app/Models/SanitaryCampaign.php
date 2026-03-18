<?php

namespace App\Models;

use Database\Factories\SanitaryCampaignFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SanitaryCampaign extends Model
{
    /** @use HasFactory<SanitaryCampaignFactory> */
    use HasFactory;

    protected $fillable = [
        'exploitation_id',
        'name',
        'status',
        'start_date',
        'end_date',
        'total_animals',
        'sampled_animals',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function exploitation(): BelongsTo
    {
        return $this->belongsTo(Exploitation::class);
    }

    public function campaignAnimals(): HasMany
    {
        return $this->hasMany(CampaignAnimal::class);
    }
}
