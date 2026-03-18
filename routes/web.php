<?php

use App\Http\Controllers\BirthRegistrationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\KrotalScannerController;
use App\Http\Controllers\RegulationController;
use App\Http\Controllers\SanitaryCampaignController;
use App\Models\Regulation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/dashboard')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::get('scanner', [KrotalScannerController::class, 'index'])->name('scanner.index');

    Route::get('normativa', [RegulationController::class, 'index'])->name('normativa.index');
    Route::get('normativa/campanas/{sanitaryCampaign}', [SanitaryCampaignController::class, 'show'])->name('normativa.campanas.show');

    Route::patch('api/regulations/{regulation}/read', function (Request $request, Regulation $regulation) {
        $regulation->update(['is_read' => true]);

        return response()->json(['success' => true]);
    })->name('api.regulations.read');

    Route::patch('api/regulations/{regulation}/resolve', function (Request $request, Regulation $regulation) {
        $regulation->update(['is_resolved' => true]);

        return response()->json(['success' => true]);
    })->name('api.regulations.resolve');

    Route::get('nacimientos/crear', [BirthRegistrationController::class, 'create'])->name('nacimientos.create');
    Route::post('nacimientos', [BirthRegistrationController::class, 'store'])->name('nacimientos.store');

    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('chat/messages', [ChatController::class, 'store'])->name('chat.store');
});

Route::middleware(['auth'])->group(function () {
    Route::get('api/animals/by-crotal/{code}', [KrotalScannerController::class, 'lookupByCrotal'])->name('api.animals.by-crotal');
    Route::get('api/animals/random-crotal', [KrotalScannerController::class, 'randomCrotal'])->name('api.animals.random-crotal');
});

require __DIR__.'/settings.php';
