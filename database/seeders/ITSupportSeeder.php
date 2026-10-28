<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class ITSupportSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'itsupport@example.com'],
            [
                'name' => 'IT Support',
                'password' => Hash::make('GantiPassword123!'),
                'role' => 'it_support',
                'is_active' => true,
            ]
        );
    }
}
