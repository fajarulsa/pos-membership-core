<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Customer;
use App\Models\Product;
use App\Models\Reward;
use Illuminate\Database\Seeder;

class PosSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Sample Products
        Product::create(['name' => 'Kopi Gula Aren', 'sku' => 'KGA-01', 'price' => 18000, 'stock' => 50]);
        Product::create(['name' => 'Matcha Latte', 'sku' => 'ML-02', 'price' => 22000, 'stock' => 30]);
        Product::create(['name' => 'Croissant', 'sku' => 'CRS-03', 'price' => 15000, 'stock' => 20]);

        // Sample Customer
        Customer::create([
            'name' => 'Budi Santoso',
            'phone' => '081234567890',
            'total_points' => 50,
        ]);

        // Sample Reward
        Reward::create([
            'name' => 'Diskon Rp 10.000',
            'points_required' => 20,
            'discount_amount' => 10000,
        ]);
    }
}
