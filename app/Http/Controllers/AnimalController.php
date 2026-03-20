<?php

namespace App\Http\Controllers;

use App\Models\Animal;
use App\Models\SubExploitation;
use Carbon\Carbon;
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

    public function show(SubExploitation $subExploitation, Animal $animal): Response
    {
        $subExploitation->load('exploitation');

        $speciesLabels = [
            'bovine' => 'Bovino',
            'ovine' => 'Ovino',
            'caprine' => 'Caprino',
            'porcine' => 'Porcino',
            'equine' => 'Equino',
        ];

        $sexLabels = [
            'male' => 'Macho',
            'female' => 'Hembra',
        ];

        $birthDate = $animal->birth_date;
        $age = $birthDate ? Carbon::parse($birthDate)->age : null;
        $ageLabel = $age !== null ? ($age === 1 ? '1 año' : "{$age} años") : null;

        $speciesLabel = $speciesLabels[$animal->species] ?? $animal->species;
        $sexLabel = $sexLabels[$animal->sex] ?? $animal->sex;

        // Mock sanitary status
        $sanitaryStatuses = [
            [
                'status' => 'warning',
                'title' => 'Alerta sanitaria activa',
                'description' => 'Campaña BVD — Pendiente de muestreo. Resultado esperado antes del 15/03/2026.',
            ],
            [
                'status' => 'ok',
                'title' => 'Estado sanitario correcto',
                'description' => 'Sin alertas sanitarias activas. Todas las campañas al día.',
            ],
            [
                'status' => 'danger',
                'title' => 'Animal inmovilizado',
                'description' => 'Inmovilizado por resultado positivo en campaña de Tuberculosis. Pendiente de sacrificio sanitario.',
            ],
        ];

        $sanitaryIndex = crc32($animal->crotal_code) % count($sanitaryStatuses);
        $sanitaryState = $sanitaryStatuses[abs($sanitaryIndex)];

        // Mock movement history (deterministic based on animal id)
        $movements = [
            [
                'type' => 'entry',
                'label' => 'Entrada — Explotación origen: ES48023012345',
                'date' => '10/01/2026',
                'color' => 'green',
            ],
            [
                'type' => 'exit',
                'label' => 'Salida — Destino: ES48005012345',
                'date' => '05/01/2025',
                'color' => 'red',
            ],
            [
                'type' => 'birth',
                'label' => 'Nacimiento — Explotación actual',
                'date' => $birthDate ? Carbon::parse($birthDate)->format('d/m/Y') : '15/03/2023',
                'color' => 'green',
            ],
        ];

        return Inertia::render('animales/show', [
            'subExploitation' => $subExploitation,
            'animal' => [
                'id' => $animal->id,
                'crotal_code' => strtoupper($animal->crotal_code),
                'species_label' => $speciesLabel,
                'sex_label' => $sexLabel,
                'age_label' => $ageLabel,
                'breed' => $animal->breed,
            ],
            'sanitaryState' => $sanitaryState,
            'movements' => $movements,
        ]);
    }
}
