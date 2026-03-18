<?php

namespace Database\Factories;

use App\Models\Exploitation;
use App\Models\Regulation;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Regulation>
 */
class RegulationFactory extends Factory
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
            'type' => fake()->randomElement(['sanitary_campaign', 'animal_immobilized', 'birth_deadline', 'census_reminder', 'subsidy_open', 'movement_pending', 'document_expiring', 'capacity_warning']),
            'severity' => fake()->randomElement(['urgent', 'warning', 'info']),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(),
            'action_label' => fake()->optional()->words(3, true),
            'action_url' => fake()->optional()->url(),
            'due_date' => fake()->optional()->dateTimeBetween('now', '+3 months'),
            'is_read' => false,
            'is_resolved' => false,
            'metadata' => null,
        ];
    }

    public function urgent(): static
    {
        return $this->state(fn () => ['severity' => 'urgent']);
    }

    public function warning(): static
    {
        return $this->state(fn () => ['severity' => 'warning']);
    }

    public function info(): static
    {
        return $this->state(fn () => ['severity' => 'info']);
    }

    public function resolved(): static
    {
        return $this->state(fn () => ['is_resolved' => true]);
    }

    public function read(): static
    {
        return $this->state(fn () => ['is_read' => true]);
    }
}
