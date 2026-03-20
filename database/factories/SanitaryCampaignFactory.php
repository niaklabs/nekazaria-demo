<?php

namespace Database\Factories;

use App\Models\Exploitation;
use App\Models\SanitaryCampaign;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SanitaryCampaign>
 */
class SanitaryCampaignFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'exploitation_id' => Exploitation::factory(),
            'name' => 'BVD '.fake()->year(),
            'species' => 'bovine',
            'status' => 'in_progress',
            'start_date' => fake()->dateTimeBetween('-3 months', 'now'),
            'end_date' => fake()->dateTimeBetween('+1 month', '+6 months'),
            'total_animals' => 12,
            'sampled_animals' => 7,
        ];
    }
}
