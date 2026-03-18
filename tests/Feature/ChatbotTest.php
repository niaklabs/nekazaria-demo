<?php

use App\Models\Animal;
use App\Models\ChatConversation;
use App\Models\Exploitation;
use App\Models\SubExploitation;
use App\Models\User;
use App\Services\ChatbotService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('guests are redirected from chat page', function () {
    $response = $this->get(route('chat.index'));
    $response->assertRedirect(route('login'));
});

test('authenticated users can visit the chat page', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->get(route('chat.index'));
    $response->assertOk();
});

test('visiting chat page creates a conversation if none exists', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    expect(ChatConversation::where('user_id', $user->id)->count())->toBe(0);

    $this->get(route('chat.index'));

    expect(ChatConversation::where('user_id', $user->id)->count())->toBe(1);
});

test('sending a message stores user and assistant messages', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->postJson(route('chat.store'), [
        'message' => 'Hola',
    ]);

    $response->assertOk();
    $response->assertJsonPath('message.role', 'assistant');

    $conversation = ChatConversation::where('user_id', $user->id)->first();
    expect($conversation)->not->toBeNull();
    expect($conversation->messages()->count())->toBe(2);
    expect($conversation->messages()->where('role', 'user')->first()->content)->toBe('Hola');
});

test('sending a message requires a message field', function () {
    $user = User::factory()->create();

    $this->actingAs($user);

    $response = $this->postJson(route('chat.store'), []);
    $response->assertUnprocessable();
    $response->assertJsonValidationErrors('message');
});

test('chatbot service responds to greeting with farmer name', function () {
    $user = User::factory()->create(['name' => 'Aitor Etxeberria']);
    $service = new ChatbotService;

    $response = $service->respond('Hola', $user);

    expect($response['content'])->toContain('Hola Aitor');
    expect($response['quick_replies'])->toBeArray();
    expect($response['quick_replies'])->toContain('Mis animales');
});

test('chatbot service responds to animal count query', function () {
    $user = User::factory()->create(['name' => 'Aitor Etxeberria']);
    $exploitation = Exploitation::factory()->create(['user_id' => $user->id]);
    $sub = SubExploitation::factory()->create([
        'exploitation_id' => $exploitation->id,
        'species' => 'bovino',
    ]);
    Animal::factory()->count(5)->create(['sub_exploitation_id' => $sub->id]);

    $service = new ChatbotService;
    $response = $service->respond('¿Cuántos animales tengo?', $user);

    expect($response['content'])->toContain('5 animales');
});

test('chatbot service returns default response for unknown input', function () {
    $user = User::factory()->create();
    $service = new ChatbotService;

    $response = $service->respond('asdfghjkl', $user);

    expect($response['content'])->toContain('No he entendido del todo');
    expect($response['quick_replies'])->toContain('Ayuda');
});

test('chatbot service matches keywords case-insensitively', function () {
    $user = User::factory()->create(['name' => 'Aitor']);
    $service = new ChatbotService;

    $response = $service->respond('HOLA BUENOS DÍAS', $user);

    expect($response['content'])->toContain('Hola Aitor');
});
