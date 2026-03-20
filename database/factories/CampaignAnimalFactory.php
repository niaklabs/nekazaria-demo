<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\CampaignAnimal;
use App\Models\SanitaryCampaign;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CampaignAnimal>
 */
class CampaignAnimalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sanitary_campaign_id' => SanitaryCampaign::factory(),
            'animal_id' => Animal::factory(),
            'status' => fake()->randomElement(['pending', 'sampled', 'immobilized']),
            'immobilization_reason' => null,
        ];
    }

    public function immobilized(string $restrictionType = 'blocked'): static
    {
        return $this->state(fn () => [
            'status' => 'immobilized',
            'immobilization_reason' => 'Resultado positivo en prueba serológica BVD. Requiere segunda muestra confirmatoria.',
            'restriction_type' => $restrictionType,
        ]);
    }
}
