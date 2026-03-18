<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CampaignAnimal extends Model
{
    protected $fillable = [
        'sanitary_campaign_id',
        'animal_id',
        'status',
        'immobilization_reason',
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
