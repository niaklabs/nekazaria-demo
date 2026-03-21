<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $firstName = explode(' ', trim($user->name))[0];

        $exploitation = $user->exploitations()->first();

        $auraSummary = $exploitation
            ? Regulation::query()
                ->where('exploitation_id', $exploitation->id)
                ->where('is_resolved', false)
                ->orderByRaw("CASE severity WHEN 'urgent' THEN 1 WHEN 'warning' THEN 2 WHEN 'info' THEN 3 ELSE 4 END")
                ->limit(3)
                ->get(['id', 'title', 'severity', 'action_url'])
            : collect();

        return Inertia::render('home', [
            'firstName' => $firstName,
            'avatar' => $user->avatar,
            'auraSummary' => $auraSummary,
        ]);
    }
}
