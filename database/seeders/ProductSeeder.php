<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Tenant;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();
        if (!$tenant) return;

        Product::firstOrCreate(
            ['tenant_id' => $tenant->id, 'code' => 'TAB-WADIAH'],
            ['name' => 'Tabungan Wadi\'ah (Titipan)', 'type' => 'FUNDING', 'status' => 'ACTIVE', 'description' => 'Tabungan bebas biaya administrasi.']
        );
        
        Product::firstOrCreate(
            ['tenant_id' => $tenant->id, 'code' => 'TAB-MUDHARABAH'],
            ['name' => 'Tabungan Mudharabah (Bagi Hasil)', 'type' => 'FUNDING', 'status' => 'ACTIVE', 'description' => 'Tabungan investasi dengan sistem bagi hasil.']
        );

        Product::firstOrCreate(
            ['tenant_id' => $tenant->id, 'code' => 'PEM-MURABAHAH'],
            ['name' => 'Pembiayaan Murabahah (Jual Beli)', 'type' => 'LENDING', 'status' => 'ACTIVE', 'description' => 'Pembiayaan barang dengan margin keuntungan yang disepakati.']
        );
    }
}
