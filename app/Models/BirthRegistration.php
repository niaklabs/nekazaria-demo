<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BirthRegistration extends Model
{
    protected $fillable = [
        'sub_exploitation_id',
        'mother_id',
        'father_id',
        'birth_type',
        'calf_count',
        'status',
        'submitted_at',
        'reference_code',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'calf_count' => 'integer',
        ];
    }

    public function subExploitation(): BelongsTo
    {
        return $this->belongsTo(SubExploitation::class);
    }

    public function mother(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'mother_id');
    }

    public function father(): BelongsTo
    {
        return $this->belongsTo(Animal::class, 'father_id');
    }

    public function calves(): HasMany
    {
        return $this->hasMany(BirthRegistrationCalf::class);
    }
}
