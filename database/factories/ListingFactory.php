<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ListingFactory extends Factory
{
    public function definition(): array
    {
        $type = fake()->randomElement(['VENTE', 'TROC', 'TROC_CASH']);

        return [
            'owner_id' => User::factory(),
            'title' => fake()->sentence(4),
            'description' => fake()->paragraph(3),
            'type' => $type,
            'price' => $type === 'TROC' ? null : fake()->numberBetween(5000, 500000),
            'exchange_for' => $type !== 'VENTE' ? fake()->sentence(3) : null,
            'category' => fake()->randomElement(['electronique', 'vetements', 'maison', 'vehicules', 'services']),
            'condition' => fake()->randomElement(['neuf', 'excellent', 'bon', 'correct']),
            'delivery_mode' => fake()->randomElement(['main_propre', 'livraison', 'les_deux']),
            'photos' => ['https://picsum.photos/400/300'],
            'country' => 'BJ',
            'city' => fake()->randomElement(['Cotonou', 'Porto-Novo', 'Parakou']),
            'status' => 'active',
            'expires_at' => now()->addDays(30),
        ];
    }
}