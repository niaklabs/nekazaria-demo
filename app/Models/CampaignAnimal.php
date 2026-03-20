<?php

namespace App\Models;

use Database\Factories\CampaignAnimalFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignAnimal extends Model
{
    /** @use HasFactory<CampaignAnimalFactory> */
    use HasFactory;

    protected $fillable = [
        'sanitary_campaign_id',
        'animal_id',
        'status',
        'immobilization_reason',
        'restriction_type',
    ];

    public function sanitaryCampaign(): BelongsTo
    {
        return $this->belongsTo(SanitaryCampaign::class);
    }

    public function animal(): BelongsTo
    {
        return $this->belongsTo(Animal::class);
    }
}
