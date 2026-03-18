<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\CampaignAnimal;
use App\Models\Exploitation;
use App\Models\Regulation;
use App\Models\SanitaryCampaign;
use App\Models\SubExploitation;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     *
     * Idempotent — safe to run multiple times in production.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Aitor Etxeberri', 'email' => 'demo@nekazaria.eus'],
            ['name' => 'Gaston', 'email' => 'gaston@niak.com'],
            ['name' => 'Salome', 'email' => 'salome@niak.com'],
        ];

        foreach ($users as $user) {
            User::firstOrCreate(
                ['email' => $user['email']],
                ['name' => $user['name'], 'password' => Hash::make('password')],
            );
        }

        $demoUser = User::where('email', 'demo@nekazaria.eus')->first();

        $exploitation = Exploitation::firstOrCreate(
            ['rega_code' => 'ES048012300001'],
            [
                'user_id' => $demoUser->id,
                'name' => 'Baserri Etxeberri',
                'municipality' => 'Bilbao',
                'province' => 'Bizkaia',
            ],
        );

        $exploitation->update(['municipality' => 'Bilbao', 'province' => 'Bizkaia']);

        $bovineData = [
            'exploitation_type' => 'Producción de leche',
            'zootechnical_classification' => 'Producción',
            'productive_system' => 'Extensivo',
            'current_capacity' => 45,
            'max_capacity' => 50,
            'sustainability' => 'Ecológico',
            'self_consumption' => false,
            'census_date' => '2026-01-15',
            'status' => 'active',
        ];

        $bovine = SubExploitation::firstOrCreate(
            ['exploitation_id' => $exploitation->id, 'species' => 'bovine'],
            $bovineData,
        );

        $bovine->update($bovineData);

        $ovineData = [
            'exploitation_type' => 'Producción de carne',
            'zootechnical_classification' => 'Reproducción',
            'productive_system' => 'Extensivo',
            'current_capacity' => 120,
            'max_capacity' => 200,
            'sustainability' => 'Integrado',
            'self_consumption' => false,
            'census_date' => '2026-01-15',
            'status' => 'active',
        ];

        $ovine = SubExploitation::firstOrCreate(
            ['exploitation_id' => $exploitation->id, 'species' => 'ovine'],
            $ovineData,
        );

        $ovine->update($ovineData);

        $this->seedBovineAnimals($bovine);
        $this->seedOvineAnimals($ovine);
        $this->seedRegulations($exploitation);
    }

    private function seedBovineAnimals(SubExploitation $sub): void
    {
        $females = [
            ['crotal_code' => 'ES0480123000101', 'breed' => 'Pirenaica', 'name' => 'Txuri', 'birth_date' => '2020-03-12'],
            ['crotal_code' => 'ES0480123000102', 'breed' => 'Pirenaica', 'name' => 'Gorria', 'birth_date' => '2019-06-22'],
            ['crotal_code' => 'ES0480123000103', 'breed' => 'Asturiana', 'name' => 'Beltza', 'birth_date' => '2021-01-08'],
            ['crotal_code' => 'ES0480123000104', 'breed' => 'Rubia Gallega', 'name' => null, 'birth_date' => '2022-04-15'],
            ['crotal_code' => 'ES0480123000105', 'breed' => 'Pirenaica', 'name' => 'Edurne', 'birth_date' => '2021-09-30'],
            ['crotal_code' => 'ES0480123000106', 'breed' => 'Asturiana', 'name' => null, 'birth_date' => '2023-02-14'],
        ];

        foreach ($females as $data) {
            Animal::firstOrCreate(
                ['crotal_code' => $data['crotal_code']],
                ['sub_exploitation_id' => $sub->id, 'species' => 'bovine', 'sex' => 'female', 'status' => 'active', ...$data],
            );
        }

        $males = [
            ['crotal_code' => 'ES0480123000107', 'breed' => 'Pirenaica', 'name' => 'Tximist', 'birth_date' => '2019-11-05'],
            ['crotal_code' => 'ES0480123000108', 'breed' => 'Asturiana', 'name' => null, 'birth_date' => '2021-07-20'],
            ['crotal_code' => 'ES0480123000109', 'breed' => 'Pirenaica', 'name' => 'Indartsu', 'birth_date' => '2022-08-10'],
            ['crotal_code' => 'ES0480123000110', 'breed' => 'Rubia Gallega', 'name' => null, 'birth_date' => '2023-05-03'],
            ['crotal_code' => 'ES0480123000111', 'breed' => 'Pirenaica', 'name' => 'Basatxi', 'birth_date' => '2020-12-18'],
            ['crotal_code' => 'ES0480123000112', 'breed' => 'Asturiana', 'name' => null, 'birth_date' => '2022-02-25'],
        ];

        foreach ($males as $data) {
            Animal::firstOrCreate(
                ['crotal_code' => $data['crotal_code']],
                ['sub_exploitation_id' => $sub->id, 'species' => 'bovine', 'sex' => 'male', 'status' => 'active', ...$data],
            );
        }
    }

    private function seedOvineAnimals(SubExploitation $sub): void
    {
        $females = [
            ['crotal_code' => 'ES0480123000201', 'breed' => 'Latxa', 'name' => null, 'birth_date' => '2021-02-18'],
            ['crotal_code' => 'ES0480123000202', 'breed' => 'Latxa', 'name' => null, 'birth_date' => '2020-05-11'],
            ['crotal_code' => 'ES0480123000203', 'breed' => 'Carranzana', 'name' => null, 'birth_date' => '2022-03-25'],
            ['crotal_code' => 'ES0480123000204', 'breed' => 'Latxa', 'name' => null, 'birth_date' => '2023-01-07'],
            ['crotal_code' => 'ES0480123000205', 'breed' => 'Carranzana', 'name' => null, 'birth_date' => '2021-11-30'],
        ];

        foreach ($females as $data) {
            Animal::firstOrCreate(
                ['crotal_code' => $data['crotal_code']],
                ['sub_exploitation_id' => $sub->id, 'species' => 'ovine', 'sex' => 'female', 'status' => 'active', ...$data],
            );
        }

        $males = [
            ['crotal_code' => 'ES0480123000206', 'breed' => 'Latxa', 'name' => null, 'birth_date' => '2020-09-14'],
            ['crotal_code' => 'ES0480123000207', 'breed' => 'Carranzana', 'name' => null, 'birth_date' => '2022-06-08'],
            ['crotal_code' => 'ES0480123000208', 'breed' => 'Latxa', 'name' => null, 'birth_date' => '2023-04-22'],
        ];

        foreach ($males as $data) {
            Animal::firstOrCreate(
                ['crotal_code' => $data['crotal_code']],
                ['sub_exploitation_id' => $sub->id, 'species' => 'ovine', 'sex' => 'male', 'status' => 'active', ...$data],
            );
        }
    }

    private function seedRegulations(Exploitation $exploitation): void
    {
        $campaign = SanitaryCampaign::firstOrCreate(
            ['exploitation_id' => $exploitation->id, 'name' => 'BVD 2026'],
            [
                'status' => 'in_progress',
                'start_date' => '2026-01-15',
                'end_date' => '2026-06-10',
                'total_animals' => 12,
                'sampled_animals' => 7,
            ],
        );

        $bovineAnimals = Animal::whereHas('subExploitation', function ($query) use ($exploitation) {
            $query->where('exploitation_id', $exploitation->id)->where('species', 'bovine');
        })->limit(12)->get();

        $statuses = array_merge(
            array_fill(0, 7, 'sampled'),
            array_fill(0, 3, 'pending'),
            array_fill(0, 2, 'immobilized'),
        );

        foreach ($bovineAnimals->take(12) as $index => $animal) {
            $status = $statuses[$index] ?? 'pending';

            CampaignAnimal::firstOrCreate(
                ['sanitary_campaign_id' => $campaign->id, 'animal_id' => $animal->id],
                [
                    'status' => $status,
                    'immobilization_reason' => $status === 'immobilized'
                        ? 'Resultado positivo en prueba serológica BVD. Requiere segunda muestra confirmatoria.'
                        : null,
                ],
            );
        }

        $regulations = [
            [
                'type' => 'animal_immobilized',
                'severity' => 'urgent',
                'title' => '2 animales inmovilizados — BVD 2026',
                'description' => 'Tienes 2 animales bloqueados por la campaña sanitaria BVD. Para desbloquearlos debes completar el muestreo.',
                'action_label' => 'Ver cómo resolverlo',
                'action_url' => '/normativa/campanas/'.$campaign->id,
                'due_date' => '2026-06-10',
            ],
            [
                'type' => 'sanitary_campaign',
                'severity' => 'warning',
                'title' => 'Campaña BVD 2026: 5 animales pendientes',
                'description' => 'La campaña BVD 2026 termina el 10/06. Te quedan 5 animales pendientes de muestreo.',
                'action_label' => 'Ver animales pendientes',
                'action_url' => '/normativa/campanas/'.$campaign->id,
                'due_date' => '2026-06-10',
            ],
            [
                'type' => 'birth_deadline',
                'severity' => 'warning',
                'title' => '3 nacimientos pendientes de comunicar',
                'description' => 'Tienes 3 nacimientos pendientes de comunicar antes del 25/03. El plazo legal es de 7 días desde el nacimiento.',
                'action_label' => 'Comunicar nacimiento',
                'action_url' => '/nacimientos/crear',
                'due_date' => '2026-03-25',
            ],
            [
                'type' => 'movement_pending',
                'severity' => 'warning',
                'title' => 'Guía de movimiento pendiente de validación',
                'description' => 'La guía de movimiento GM-2026-048-00198 está pendiente de validación por parte de la administración.',
                'action_label' => 'Ver estado',
                'action_url' => '#',
                'due_date' => null,
            ],
            [
                'type' => 'subsidy_open',
                'severity' => 'info',
                'title' => 'Convocatoria: Ayudas ganadería ecológica 2026',
                'description' => 'Convocatoria abierta: Ayudas a la ganadería ecológica 2026. Plazo de solicitud hasta el 30/04.',
                'action_label' => 'Ver detalles',
                'action_url' => '#',
                'due_date' => '2026-04-30',
            ],
            [
                'type' => 'census_reminder',
                'severity' => 'info',
                'title' => 'Declaración de censo anual pendiente',
                'description' => 'Declaración de censo anual pendiente para subexplotación avícola. Plazo hasta el 31/03.',
                'action_label' => 'Declarar censo',
                'action_url' => '#',
                'due_date' => '2026-03-31',
            ],
            [
                'type' => 'document_expiring',
                'severity' => 'warning',
                'title' => 'Libro de establo caduca el 15/04/2026',
                'description' => 'Tu libro de establo caduca el 15/04/2026. Solicita la renovación con antelación para evitar problemas.',
                'action_label' => 'Solicitar renovación',
                'action_url' => '#',
                'due_date' => '2026-04-15',
            ],
            [
                'type' => 'capacity_warning',
                'severity' => 'info',
                'title' => 'Subexplotación bovina al 90% de capacidad',
                'description' => 'La subexplotación bovina está al 90% de capacidad (45/50). Revisa si necesitas ampliar o tramitar bajas.',
                'action_label' => 'Ver subexplotación',
                'action_url' => '#',
                'due_date' => null,
            ],
        ];

        foreach ($regulations as $data) {
            Regulation::firstOrCreate(
                ['exploitation_id' => $exploitation->id, 'title' => $data['title']],
                ['is_read' => false, 'is_resolved' => false, ...$data],
            );
        }
    }
}
