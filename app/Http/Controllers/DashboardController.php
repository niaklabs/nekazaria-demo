<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $exploitation = $request->user()
            ->exploitations()
            ->with(['subExploitations' => function ($query) {
                $query->withCount('animals')->orderBy('species');
            }])
            ->first();

        $unreadRegulationsCount = 0;

        if ($exploitation) {
            $unreadRegulationsCount = $exploitation->regulations()
                ->where('is_read', false)
                ->count();
        }

        return Inertia::render('dashboard', [
            'exploitation' => $exploitation,
            'unreadRegulationsCount' => $unreadRegulationsCount,
        ]);
    }
}
