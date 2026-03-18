<?php

namespace App\Http\Controllers;

use App\Models\ChatConversation;
use App\Services\ChatbotService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function index(Request $request): Response
    {
        $conversation = ChatConversation::query()
            ->firstOrCreate(
                ['user_id' => $request->user()->id],
                [
                    'started_at' => now(),
                    'last_message_at' => now(),
                ],
            );

        $conversation->load('messages');

        return Inertia::render('chat/index', [
            'conversation' => $conversation,
            'messages' => $conversation->messages()->orderBy('created_at')->get(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'message' => ['required', 'string', 'max:1000'],
        ]);

        $user = $request->user();

        $conversation = ChatConversation::query()
            ->firstOrCreate(
                ['user_id' => $user->id],
                [
                    'started_at' => now(),
                    'last_message_at' => now(),
                ],
            );

        $conversation->messages()->create([
            'role' => 'user',
            'content' => $request->input('message'),
            'created_at' => now(),
        ]);

        $chatbotService = new ChatbotService;
        $response = $chatbotService->respond($request->input('message'), $user);

        $assistantMessage = $conversation->messages()->create([
            'role' => 'assistant',
            'content' => $response['content'],
            'quick_replies' => $response['quick_replies'],
            'created_at' => now(),
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'message' => $assistantMessage,
        ]);
    }
}
