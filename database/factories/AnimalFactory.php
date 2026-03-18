<?php

namespace Database\Factories;

use App\Models\Animal;
use App\Models\SubExploitation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Animal>
 */
class AnimalFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'sub_exploitation_id' => SubExploitation::factory(),
            'crotal_code' => 'ES'.fake()->unique()->numerify('#############'),
            'species' => fake()->randomElement(['bovino', 'ovino', 'caprino', 'porcino']),
            'breed' => fake()->randomElement(['frisona', 'pirenaica', 'latxa', 'terreña']),
            'sex' => fake()->randomElement(['macho', 'hembra']),
            'name' => fake()->optional(0.7)->firstName(),
            'birth_date' => fake()->dateTimeBetween('-5 years', '-6 months'),
            'status' => 'active',
        ];
    }
}
