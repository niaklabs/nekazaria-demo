<?php

use App\Models\Animal;
use App\Models\BirthRegistration;
use App\Models\BirthRegistrationCalf;
use App\Models\Exploitation;
use App\Models\SubExploitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected from birth registration create page', function () {
    $response = $this->get(route('nacimientos.create'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the birth registration create page', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);
    $subExploitation = SubExploitation::factory()->create(['exploitation_id' => $exploitation->id]);

    $this->actingAs($user);

    $response = $this->get(route('nacimientos.create'));
    $response->assertOk();
});

test('authenticated users without exploitation can visit the birth registration create page', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->get(route('nacimientos.create'));
    $response->assertOk();
    $response->assertInertia(fn ($page) => $page->where('exploitation', null));
});

test('birth registration can be stored with a single calf', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);
    $subExploitation = SubExploitation::factory()->create([
        'exploitation_id' => $exploitation->id,
        'species' => 'bovino',
        'current_capacity' => 10,
        'max_capacity' => 50,
    ]);
    $mother = Animal::factory()->create([
        'sub_exploitation_id' => $subExploitation->id,
        'sex' => 'hembra',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    $response = $this->post(route('nacimientos.store'), [
        'sub_exploitation_id' => $subExploitation->id,
        'mother_id' => $mother->id,
        'father_id' => null,
        'birth_type' => 'simple',
        'calves' => [
            [
                'sex' => 'female',
                'breed' => 'pirenaica',
                'name' => 'Luna',
                'birth_date' => now()->toDateString(),
            ],
        ],
    ]);

    $response->assertRedirect(route('nacimientos.create'));
    $response->assertSessionHas('success');

    expect(BirthRegistration::count())->toBe(1);
    expect(BirthRegistrationCalf::count())->toBe(1);

    $registration = BirthRegistration::first();
    expect($registration->status)->toBe('submitted');
    expect($registration->reference_code)->toStartWith('NC-');
    expect($registration->calf_count)->toBe(1);
    expect($registration->mother_id)->toBe($mother->id);

    $calf = BirthRegistrationCalf::first();
    expect($calf->assigned_crotal)->toStartWith('ES');

    $newAnimal = Animal::where('crotal_code', $calf->assigned_crotal)->first();
    expect($newAnimal)->not->toBeNull();
    expect($newAnimal->species)->toBe('bovino');
    expect($newAnimal->mother_id)->toBe($mother->id);

    expect($subExploitation->fresh()->current_capacity)->toBe(11);
});

test('birth registration can be stored with multiple calves', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);
    $subExploitation = SubExploitation::factory()->create([
        'exploitation_id' => $exploitation->id,
        'species' => 'bovino',
        'current_capacity' => 10,
        'max_capacity' => 50,
    ]);
    $mother = Animal::factory()->create([
        'sub_exploitation_id' => $subExploitation->id,
        'sex' => 'hembra',
        'status' => 'active',
    ]);
    $father = Animal::factory()->create([
        'sub_exploitation_id' => $subExploitation->id,
        'sex' => 'macho',
        'status' => 'active',
    ]);

    $this->actingAs($user);

    $response = $this->post(route('nacimientos.store'), [
        'sub_exploitation_id' => $subExploitation->id,
        'mother_id' => $mother->id,
        'father_id' => $father->id,
        'birth_type' => 'multiple',
        'calves' => [
            [
                'sex' => 'male',
                'breed' => 'pirenaica',
                'name' => null,
                'birth_date' => now()->toDateString(),
            ],
            [
                'sex' => 'female',
                'breed' => 'pirenaica',
                'name' => 'Estrella',
                'birth_date' => now()->toDateString(),
            ],
        ],
    ]);

    $response->assertRedirect(route('nacimientos.create'));

    expect(BirthRegistration::count())->toBe(1);
    expect(BirthRegistrationCalf::count())->toBe(2);
    expect(BirthRegistration::first()->calf_count)->toBe(2);
    expect($subExploitation->fresh()->current_capacity)->toBe(12);
});

test('birth registration store validates required fields', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);

    $this->actingAs($user);

    $response = $this->post(route('nacimientos.store'), []);

    $response->assertSessionHasErrors([
        'sub_exploitation_id',
        'mother_id',
        'birth_type',
        'calves',
    ]);
});

test('birth registration store validates calf data', function () {
    $user = User::factory()->create();
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);
    $subExploitation = SubExploitation::factory()->create(['exploitation_id' => $exploitation->id]);
    $mother = Animal::factory()->create([
        'sub_exploitation_id' => $subExploitation->id,
        'sex' => 'hembra',
    ]);

    $this->actingAs($user);

    $response = $this->post(route('nacimientos.store'), [
        'sub_exploitation_id' => $subExploitation->id,
        'mother_id' => $mother->id,
        'birth_type' => 'simple',
        'calves' => [
            [
                'sex' => 'invalid',
                'breed' => '',
                'birth_date' => 'not-a-date',
            ],
        ],
    ]);

    $response->assertSessionHasErrors([
        'calves.0.sex',
        'calves.0.breed',
        'calves.0.birth_date',
    ]);
});
