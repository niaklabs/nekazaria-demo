<?php

namespace Database\Seeders;

use App\Models\Animal;
use App\Models\Exploitation;
use App\Models\SubExploitation;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Aitor Etxeberri', 'email' => 'demo@nekazaria.eus'],
            ['name' => 'Gaston', 'email' => 'gaston@niak.com'],
            ['name' => 'Salome', 'email' => 'salome@niak.com'],
        ];

        foreach ($users as $user) {
            User::factory()->create($user);
        }

        $demoUser = User::where('email', 'demo@nekazaria.eus')->first();

        $exploitation = Exploitation::create([
            'user_id' => $demoUser->id,
            'rega_code' => 'ES048012300001',
            'name' => 'Baserri Etxeberri',
        ]);

        $bovine = SubExploitation::create([
            'exploitation_id' => $exploitation->id,
            'species' => 'bovine',
            'exploitation_type' => 'Producción de leche',
            'zootechnical_classification' => 'Producción',
            'productive_system' => 'Extensivo',
            'current_capacity' => 10,
            'max_capacity' => 50,
            'sustainability' => 'Integrado',
            'self_consumption' => false,
            'census_date' => '2026-01-15',
            'status' => 'active',
        ]);

        $ovine = SubExploitation::create([
            'exploitation_id' => $exploitation->id,
            'species' => 'ovine',
            'exploitation_type' => 'Producción de carne',
            'zootechnical_classification' => 'Producción',
            'productive_system' => 'Mixto',
            'current_capacity' => 8,
            'max_capacity' => 30,
            'sustainability' => null,
            'self_consumption' => true,
            'census_date' => '2026-01-15',
            'status' => 'active',
        ]);

        $this->seedBovineAnimals($bovine);
        $this->seedOvineAnimals($ovine);
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
            Animal::create([
                'sub_exploitation_id' => $sub->id,
                'species' => 'bovine',
                'sex' => 'female',
                'status' => 'active',
                ...$data,
            ]);
        }

        $males = [
            ['crotal_code' => 'ES0480123000107', 'breed' => 'Pirenaica', 'name' => 'Tximist', 'birth_date' => '2019-11-05'],
            ['crotal_code' => 'ES0480123000108', 'breed' => 'Asturiana', 'name' => null, 'birth_date' => '2021-07-20'],
            ['crotal_code' => 'ES0480123000109', 'breed' => 'Pirenaica', 'name' => 'Indartsu', 'birth_date' => '2022-08-10'],
            ['crotal_code' => 'ES0480123000110', 'breed' => 'Rubia Gallega', 'name' => null, 'birth_date' => '2023-05-03'],
        ];

        foreach ($males as $data) {
            Animal::create([
                'sub_exploitation_id' => $sub->id,
                'species' => 'bovine',
                'sex' => 'male',
                'status' => 'active',
                ...$data,
            ]);
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
            Animal::create([
                'sub_exploitation_id' => $sub->id,
                'species' => 'ovine',
                'sex' => 'female',
                'status' => 'active',
                ...$data,
            ]);
        }

        $males = [
            ['crotal_code' => 'ES0480123000206', 'breed' => 'Latxa', 'name' => null, 'birth_date' => '2020-09-14'],
            ['crotal_code' => 'ES0480123000207', 'breed' => 'Carranzana', 'name' => null, 'birth_date' => '2022-06-08'],
            ['crotal_code' => 'ES0480123000208', 'breed' => 'Latxa', 'name' => null, 'birth_date' => '2023-04-22'],
        ];

        foreach ($males as $data) {
            Animal::create([
                'sub_exploitation_id' => $sub->id,
                'species' => 'ovine',
                'sex' => 'male',
                'status' => 'active',
                ...$data,
            ]);
        }
    }
}
