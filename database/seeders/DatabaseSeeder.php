<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $users = [
            ['name' => 'Gaston', 'email' => 'gaston@niak.com'],
            ['name' => 'Salome', 'email' => 'salome@niak.com'],
            ['name' => 'Mariano', 'email' => 'mariano@niak.com'],
        ];

        foreach ($users as $user) {
            User::factory()->create($user);
        }
    }
}
