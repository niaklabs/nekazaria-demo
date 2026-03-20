<?php

use App\Models\Animal;
use App\Models\Exploitation;
use App\Models\SubExploitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->exploitation = Exploitation::factory()->create(['user_id' => $this->user->id]);
    $this->subExploitation = SubExploitation::factory()->create(['exploitation_id' => $this->exploitation->id]);
    $this->animal = Animal::factory()->create(['sub_exploitation_id' => $this->subExploitation->id]);
});

test('guests cannot access animal show', function () {
    $this->get(route('subexplotaciones.animales.show', [$this->subExploitation, $this->animal]))
        ->assertRedirect(route('login'));
});

test('authenticated users can view animal show', function () {
    $this->actingAs($this->user)
        ->get(route('subexplotaciones.animales.show', [$this->subExploitation, $this->animal]))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('animales/show')
            ->has('subExploitation')
            ->has('animal')
            ->has('sanitaryState')
            ->has('movements')
            ->has('animal.crotal_code')
            ->has('animal.species_label')
            ->has('animal.sex_label')
        );
});

test('animal crotal code is uppercase in show', function () {
    $animal = Animal::factory()->create([
        'sub_exploitation_id' => $this->subExploitation->id,
        'crotal_code' => 'es4812345678901',
    ]);

    $this->actingAs($this->user)
        ->get(route('subexplotaciones.animales.show', [$this->subExploitation, $animal]))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('animal.crotal_code', 'ES4812345678901')
        );
});

test('animal show returns movements history', function () {
    $this->actingAs($this->user)
        ->get(route('subexplotaciones.animales.show', [$this->subExploitation, $this->animal]))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('movements', 3)
            ->has('movements.0.label')
            ->has('movements.0.date')
            ->has('movements.0.color')
        );
});

test('animal show returns sanitary state', function () {
    $this->actingAs($this->user)
        ->get(route('subexplotaciones.animales.show', [$this->subExploitation, $this->animal]))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('sanitaryState.status')
            ->has('sanitaryState.title')
            ->has('sanitaryState.description')
        );
});
