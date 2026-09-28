<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Akun Owner
        User::factory()->create([
            'name' => 'Owner Kedai',
            'email' => 'owner@kodepagihari.com',
            'role' => 'owner',
            'password' => bcrypt('password'),
        ]);

        // Akun Kasir
        User::factory()->create([
            'name' => 'Kasir Budi',
            'email' => 'kasir@kodepagihari.com',
            'role' => 'cashier',
            'password' => bcrypt('password'),
        ]);
    }
}
