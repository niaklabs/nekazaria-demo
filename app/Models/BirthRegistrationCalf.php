<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BirthRegistrationCalf extends Model
{
    protected $fillable = [
        'birth_registration_id',
        'sex',
        'breed',
        'name',
        'birth_date',
        'assigned_crotal',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
        ];
    }

    public function birthRegistration(): BelongsTo
    {
        return $this->belongsTo(BirthRegistration::class);
    }
}
