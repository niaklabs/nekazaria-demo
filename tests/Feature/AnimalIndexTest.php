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
});

test('guests cannot access animals index', function () {
    $this->get(route('subexplotaciones.animales.index', $this->subExploitation))
        ->assertRedirect(route('login'));
});

test('authenticated users can view animals index', function () {
    Animal::factory()->count(3)->create(['sub_exploitation_id' => $this->subExploitation->id]);

    $this->actingAs($this->user)
        ->get(route('subexplotaciones.animales.index', $this->subExploitation))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('animales/index')
            ->has('subExploitation')
            ->has('speciesLabel')
            ->has('animals', 3)
            ->has('animals.0.crotal_code')
            ->has('animals.0.status')
            ->has('animals.0.subtitle')
        );
});

test('animals index returns empty list when no animals exist', function () {
    $this->actingAs($this->user)
        ->get(route('subexplotaciones.animales.index', $this->subExploitation))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('animals', 0)
        );
});

test('animals crotal codes are uppercase', function () {
    Animal::factory()->create([
        'sub_exploitation_id' => $this->subExploitation->id,
        'crotal_code' => 'ES4812345678901',
    ]);

    $this->actingAs($this->user)
        ->get(route('subexplotaciones.animales.index', $this->subExploitation))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('animals.0.crotal_code', 'ES4812345678901')
        );
});
