<?php

use App\Models\Animal;
use App\Models\CampaignAnimal;
use App\Models\Exploitation;
use App\Models\Regulation;
use App\Models\SanitaryCampaign;
use App\Models\SubExploitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->exploitation = Exploitation::factory()->create(['user_id' => $this->user->id]);
});

test('guests cannot access normativa page', function () {
    $this->get(route('normativa.index'))
        ->assertRedirect(route('login'));
});

test('authenticated users can view normativa index', function () {
    Regulation::factory()->count(3)->create(['exploitation_id' => $this->exploitation->id]);

    $this->actingAs($this->user)
        ->get(route('normativa.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('normativa/index')
            ->has('regulations', 3)
        );
});

test('normativa index sorts regulations by severity then date', function () {
    Regulation::factory()->info()->create([
        'exploitation_id' => $this->exploitation->id,
        'title' => 'Info alert',
    ]);
    Regulation::factory()->urgent()->create([
        'exploitation_id' => $this->exploitation->id,
        'title' => 'Urgent alert',
    ]);
    Regulation::factory()->warning()->create([
        'exploitation_id' => $this->exploitation->id,
        'title' => 'Warning alert',
    ]);

    $this->actingAs($this->user)
        ->get(route('normativa.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('normativa/index')
            ->has('regulations', 3)
            ->where('regulations.0.severity', 'urgent')
            ->where('regulations.1.severity', 'warning')
            ->where('regulations.2.severity', 'info')
        );
});

test('normativa index only shows regulations for the users exploitation', function () {
    $otherExploitation = Exploitation::factory()->create();

    Regulation::factory()->create(['exploitation_id' => $this->exploitation->id]);
    Regulation::factory()->create(['exploitation_id' => $otherExploitation->id]);

    $this->actingAs($this->user)
        ->get(route('normativa.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('regulations', 1)
        );
});

test('normativa index returns severity counts', function () {
    Regulation::factory()->urgent()->count(2)->create(['exploitation_id' => $this->exploitation->id]);
    Regulation::factory()->warning()->count(3)->create(['exploitation_id' => $this->exploitation->id]);
    Regulation::factory()->info()->count(1)->create(['exploitation_id' => $this->exploitation->id]);

    $this->actingAs($this->user)
        ->get(route('normativa.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('counts.urgent', 2)
            ->where('counts.warning', 3)
            ->where('counts.info', 1)
        );
});

test('can mark regulation as read', function () {
    $regulation = Regulation::factory()->create([
        'exploitation_id' => $this->exploitation->id,
        'is_read' => false,
    ]);

    $this->actingAs($this->user)
        ->post(route('api.regulations.read', $regulation))
        ->assertRedirect(route('normativa.index'));

    expect($regulation->fresh()->is_read)->toBeTrue();
});

test('can mark regulation as resolved', function () {
    $regulation = Regulation::factory()->create([
        'exploitation_id' => $this->exploitation->id,
        'is_resolved' => false,
    ]);

    $this->actingAs($this->user)
        ->post(route('api.regulations.resolve', $regulation))
        ->assertRedirect(route('normativa.index'));

    expect($regulation->fresh()->is_resolved)->toBeTrue();
});

test('guests cannot access sanitary campaign page', function () {
    $campaign = SanitaryCampaign::factory()->create(['exploitation_id' => $this->exploitation->id]);

    $this->get(route('normativa.campanas.show', $campaign))
        ->assertRedirect(route('login'));
});

test('authenticated users can view sanitary campaign detail', function () {
    $campaign = SanitaryCampaign::factory()->create(['exploitation_id' => $this->exploitation->id]);
    $sub = SubExploitation::factory()->create(['exploitation_id' => $this->exploitation->id]);
    $animal = Animal::factory()->create(['sub_exploitation_id' => $sub->id]);
    CampaignAnimal::factory()->create([
        'sanitary_campaign_id' => $campaign->id,
        'animal_id' => $animal->id,
        'status' => 'pending',
    ]);

    $this->actingAs($this->user)
        ->get(route('normativa.campanas.show', $campaign))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('normativa/campanas/show')
            ->has('campaign')
            ->where('campaign.name', $campaign->name)
            ->has('animals.pending', 1)
            ->has('animals.sampled', 0)
            ->has('animals.immobilized', 0)
        );
});

test('sanitary campaign groups animals by status', function () {
    $campaign = SanitaryCampaign::factory()->create(['exploitation_id' => $this->exploitation->id]);
    $sub = SubExploitation::factory()->create(['exploitation_id' => $this->exploitation->id]);

    $animals = Animal::factory()->count(5)->create(['sub_exploitation_id' => $sub->id]);

    CampaignAnimal::factory()->create(['sanitary_campaign_id' => $campaign->id, 'animal_id' => $animals[0]->id, 'status' => 'sampled']);
    CampaignAnimal::factory()->create(['sanitary_campaign_id' => $campaign->id, 'animal_id' => $animals[1]->id, 'status' => 'sampled']);
    CampaignAnimal::factory()->create(['sanitary_campaign_id' => $campaign->id, 'animal_id' => $animals[2]->id, 'status' => 'pending']);
    CampaignAnimal::factory()->immobilized()->create(['sanitary_campaign_id' => $campaign->id, 'animal_id' => $animals[3]->id]);
    CampaignAnimal::factory()->immobilized()->create(['sanitary_campaign_id' => $campaign->id, 'animal_id' => $animals[4]->id]);

    $this->actingAs($this->user)
        ->get(route('normativa.campanas.show', $campaign))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->has('animals.sampled', 2)
            ->has('animals.pending', 1)
            ->has('animals.immobilized', 2)
        );
});
