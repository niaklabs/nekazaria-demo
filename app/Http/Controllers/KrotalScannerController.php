<?php

namespace App\Http\Controllers;

use App\Models\Animal;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class KrotalScannerController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        $exploitation = $user->exploitations()->with('subExploitations')->first();

        return Inertia::render('scanner/index', [
            'exploitation' => $exploitation,
        ]);
    }

    public function lookupByCrotal(string $code): JsonResponse
    {
        $animal = Animal::query()
            ->with('subExploitation')
            ->where('crotal_code', $code)
            ->first();

        if (! $animal) {
            return response()->json(['message' => 'Animal no encontrado'], 404);
        }

        return response()->json($animal);
    }

    public function randomCrotal(): JsonResponse
    {
        $user = Auth::user();

        $subExploitationIds = $user->exploitations()
            ->with('subExploitations')
            ->get()
            ->flatMap(fn ($exploitation) => $exploitation->subExploitations->pluck('id'));

        $animal = Animal::query()
            ->with('subExploitation')
            ->whereIn('sub_exploitation_id', $subExploitationIds)
            ->inRandomOrder()
            ->first();

        if (! $animal) {
            return response()->json(['message' => 'No se encontraron animales'], 404);
        }

        return response()->json($animal);
    }
}
