<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('home page requires authentication', function () {
    $this->get('/')->assertRedirect('/login');
});

test('authenticated user can access home page', function () {
    $user = User::factory()->create(['name' => 'Aitor Fernández']);

    $this->actingAs($user)
        ->get('/')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('home')
            ->has('firstName')
            ->where('firstName', 'Aitor')
        );
});

test('home page extracts first name from user name', function () {
    $user = User::factory()->create(['name' => 'María García López']);

    $this->actingAs($user)
        ->get('/')
        ->assertInertia(fn ($page) => $page
            ->where('firstName', 'María')
        );
});

test('login redirects to home page', function () {
    $user = User::factory()->create();

    $this->post('/login', [
        'email' => $user->email,
        'password' => 'password',
    ])->assertRedirect(route('home'));
});
