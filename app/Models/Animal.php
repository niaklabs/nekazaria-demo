<?php

namespace App\Models;

use Database\Factories\AnimalFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Animal extends Model
{
    /** @use HasFactory<AnimalFactory> */
    use HasFactory;

    protected $fillable = [
        'sub_exploitation_id',
        'crotal_code',
        'species',
        'breed',
        'sex',
        'name',
        'birth_date',
        'mother_id',
        'father_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
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

    public function offspring(): HasMany
    {
        return $this->hasMany(Animal::class, 'mother_id');
    }
}
