<?php

use App\Models\Animal;
use App\Models\Exploitation;
use App\Models\SubExploitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected from scanner page', function () {
    $response = $this->get(route('scanner.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the scanner page', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user);

    $response = $this->get(route('scanner.index'));
    $response->assertOk();
});

test('lookup by crotal returns animal with sub exploitation', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);
    $subExploitation = SubExploitation::factory()->create(['exploitation_id' => $exploitation->id]);
    $animal = Animal::factory()->create([
        'sub_exploitation_id' => $subExploitation->id,
        'crotal_code' => 'ES4800123456789',
    ]);

    $this->actingAs($user);

    $response = $this->getJson(route('api.animals.by-crotal', ['code' => 'ES4800123456789']));
    $response->assertOk();
    $response->assertJsonFragment(['crotal_code' => 'ES4800123456789']);
    $response->assertJsonPath('sub_exploitation.id', $subExploitation->id);
});

test('lookup by crotal returns 404 for unknown code', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->getJson(route('api.animals.by-crotal', ['code' => 'ES0000000000000']));
    $response->assertNotFound();
});

test('random crotal returns animal belonging to authenticated user', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);
    $subExploitation = SubExploitation::factory()->create(['exploitation_id' => $exploitation->id]);
    $animal = Animal::factory()->create(['sub_exploitation_id' => $subExploitation->id]);

    $this->actingAs($user);

    $response = $this->getJson(route('api.animals.random-crotal'));
    $response->assertOk();
    $response->assertJsonPath('id', $animal->id);
});

test('random crotal does not return animals from other users', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $otherExploitation = Exploitation::factory()->create(['user_id' => $otherUser->id]);
    $otherSubExploitation = SubExploitation::factory()->create(['exploitation_id' => $otherExploitation->id]);
    Animal::factory()->create(['sub_exploitation_id' => $otherSubExploitation->id]);

    $this->actingAs($user);

    $response = $this->getJson(route('api.animals.random-crotal'));
    $response->assertNotFound();
});

test('random crotal returns 404 when user has no animals', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $response = $this->getJson(route('api.animals.random-crotal'));
    $response->assertNotFound();
});
