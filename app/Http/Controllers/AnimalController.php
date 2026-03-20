<?php

namespace App\Http\Controllers;

use App\Models\SubExploitation;
use Inertia\Inertia;
use Inertia\Response;

class AnimalController extends Controller
{
    public function index(SubExploitation $subExploitation): Response
    {
        $subExploitation->load('exploitation');
        $animals = $subExploitation->animals()->orderBy('crotal_code')->get();

        $speciesLabels = [
            'bovine' => 'Bovino',
            'ovine' => 'Ovino',
            'caprine' => 'Caprino',
            'porcine' => 'Porcino',
            'equine' => 'Equino',
        ];

        $movementTypes = ['Entrada', 'Salida'];

        $animalsData = $animals->map(function ($animal) use ($movementTypes) {
            // Mocked semaphore status and movement data for demo
            $statuses = ['ok', 'warning', 'danger'];
            $weights = [60, 25, 15];
            $rand = rand(1, 100);
            $status = $rand <= $weights[0] ? $statuses[0] : ($rand <= $weights[0] + $weights[1] ? $statuses[1] : $statuses[2]);

            $hasAlert = $status === 'warning';
            $isImmobilized = $status === 'danger';

            $movementType = fake()->randomElement($movementTypes);
            $movementDate = fake()->dateTimeBetween('-1 year', 'now')->format('d/m/Y');

            $subtitle = $isImmobilized
                ? 'Inmovilizado · Campaña BVD'
                : "Último mov: {$movementType} · {$movementDate}";

            $subtitleColor = $isImmobilized ? 'danger' : 'muted';

            return [
                'id' => $animal->id,
                'crotal_code' => strtoupper($animal->crotal_code),
                'status' => $status,
                'has_alert' => $hasAlert,
                'is_immobilized' => $isImmobilized,
                'subtitle' => $subtitle,
                'subtitle_color' => $subtitleColor,
            ];
        });

        return Inertia::render('animales/index', [
            'subExploitation' => $subExploitation,
            'animals' => $animalsData,
            'speciesLabel' => $speciesLabels[$subExploitation->species] ?? $subExploitation->species,
        ]);
    }
}
