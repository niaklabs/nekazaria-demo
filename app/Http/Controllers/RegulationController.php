<?php

namespace App\Http\Controllers;

use App\Models\Regulation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RegulationController extends Controller
{
    public function index(Request $request): Response
    {
        $exploitation = $request->user()->exploitations()->first();

        $regulations = $exploitation
            ? Regulation::query()
                ->where('exploitation_id', $exploitation->id)
                ->orderByRaw("CASE severity WHEN 'urgent' THEN 1 WHEN 'warning' THEN 2 WHEN 'info' THEN 3 ELSE 4 END")
                ->latest()
                ->get()
            : collect();

        $grouped = $regulations->groupBy('severity');

        return Inertia::render('normativa/index', [
            'regulations' => $regulations,
            'grouped' => $grouped,
            'counts' => [
                'urgent' => $grouped->get('urgent')?->count() ?? 0,
                'warning' => $grouped->get('warning')?->count() ?? 0,
                'info' => $grouped->get('info')?->count() ?? 0,
            ],
        ]);
    }
}
