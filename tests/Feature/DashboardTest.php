<?php

use App\Models\Exploitation;
use App\Models\Regulation;
use App\Models\SubExploitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected to the login page', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated users can visit the dashboard', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk();
});

test('dashboard shows exploitation data with subexploitations', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create([
        'user_id' => $user->id,
        'rega_code' => 'ES480099900001',
        'municipality' => 'Bilbao',
        'province' => 'Bizkaia',
    ]);

    SubExploitation::factory()->create([
        'exploitation_id' => $exploitation->id,
        'species' => 'bovine',
        'current_capacity' => 45,
        'max_capacity' => 50,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(
            fn($page) => $page
                ->component('dashboard')
                ->has('exploitation')
                ->where('exploitation.rega_code', 'ES480099900001')
                ->where('exploitation.municipality', 'Bilbao')
                ->has('exploitation.sub_exploitations', 1)
                ->has('unreadRegulationsCount')
        );
});

test('dashboard shows correct unread regulations count', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);

    Regulation::factory()->count(3)->create([
        'exploitation_id' => $exploitation->id,
        'is_read' => false,
    ]);

    Regulation::factory()->count(2)->create([
        'exploitation_id' => $exploitation->id,
        'is_read' => true,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(
            fn($page) => $page
                ->where('unreadRegulationsCount', 3)
        );
});

test('dashboard handles user without exploitation', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(
            fn($page) => $page
                ->component('dashboard')
                ->where('exploitation', null)
                ->where('unreadRegulationsCount', 0)
        );
});
