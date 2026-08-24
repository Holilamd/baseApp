<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\Tenant;
use App\Models\Branch;

class CustomerSeeder extends Seeder
{
    public function run(): void
    {
        $tenant = Tenant::first();
        $branch = Branch::first();
        
        // If there is no branch, let's create a default one so we can seed customers
        if (!$branch && $tenant) {
            $branch = Branch::create(['tenant_id' => $tenant->id, 'code' => '001', 'name' => 'Kantor Pusat BMT']);
        }

        if (!$tenant || !$branch) return;

        Customer::firstOrCreate(
            ['tenant_id' => $tenant->id, 'cif_number' => '1001001001'],
            [
                'branch_id' => $branch->id,
                'full_name' => 'Ahmad Fulan',
                'identity_type' => 'KTP',
                'identity_number' => '3271123456789001',
                'address' => 'Jl. Kebon Jeruk No. 12, Jakarta',
                'phone_number' => '081234567890',
                'mother_maiden_name' => 'Siti Aminah',
                'status' => 'ACTIVE'
            ]
        );

        Customer::firstOrCreate(
            ['tenant_id' => $tenant->id, 'cif_number' => '1001001002'],
            [
                'branch_id' => $branch->id,
                'full_name' => 'Fatimah Az-Zahra',
                'identity_type' => 'KTP',
                'identity_number' => '3271123456789002',
                'address' => 'Jl. Mawar No. 45, Bandung',
                'phone_number' => '085678901234',
                'mother_maiden_name' => 'Khadijah',
                'status' => 'ACTIVE'
            ]
        );
    }
}
