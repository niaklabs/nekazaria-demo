<?php

use App\Http\Controllers\AnimalController;
use App\Http\Controllers\BirthRegistrationController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\KrotalScannerController;
use App\Http\Controllers\RegulationController;
use App\Http\Controllers\SanitaryCampaignController;
use App\Http\Controllers\SubExploitationController;
use App\Models\Regulation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/', HomeController::class)->name('home');
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('scanner', [KrotalScannerController::class, 'index'])->name('scanner.index');

    Route::get('normativa', [RegulationController::class, 'index'])->name('normativa.index');
    Route::get('normativa/campanas', [SanitaryCampaignController::class, 'index'])->name('normativa.campanas.index');
    Route::get('normativa/campanas/{sanitaryCampaign}', [SanitaryCampaignController::class, 'show'])->name('normativa.campanas.show');

    Route::post('api/regulations/{regulation}/read', function (Request $request, Regulation $regulation) {
        $regulation->update(['is_read' => true]);

        return redirect()->route('normativa.index');
    })->name('api.regulations.read');

    Route::post('api/regulations/{regulation}/resolve', function (Request $request, Regulation $regulation) {
        $regulation->update(['is_resolved' => true]);

        return redirect()->route('normativa.index');
    })->name('api.regulations.resolve');

    Route::get('nacimientos/crear', [BirthRegistrationController::class, 'create'])->name('nacimientos.create');
    Route::post('nacimientos', [BirthRegistrationController::class, 'store'])->name('nacimientos.store');

    Route::get('subexplotaciones/{subExploitation}', [SubExploitationController::class, 'show'])->name('subexplotaciones.show');
    Route::get('subexplotaciones/{subExploitation}/animales', [AnimalController::class, 'index'])->name('subexplotaciones.animales.index');
    Route::get('subexplotaciones/{subExploitation}/animales/{animal}', [AnimalController::class, 'show'])->name('subexplotaciones.animales.show');

    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('chat/messages', [ChatController::class, 'store'])->name('chat.store');
});

Route::middleware(['auth'])->group(function () {
    Route::get('auth/giltza', fn () => Inertia\Inertia::render('auth/giltza'))->name('auth.giltza');
    Route::get('api/animals/by-crotal/{code}', [KrotalScannerController::class, 'lookupByCrotal'])->name('api.animals.by-crotal');
    Route::get('api/animals/random-crotal', [KrotalScannerController::class, 'randomCrotal'])->name('api.animals.random-crotal');
});

require __DIR__.'/settings.php';
