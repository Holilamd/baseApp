<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Menu;
use App\Models\Role;
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
try {
    // 1. Temukan parent "Transaksi"
    $parentTransaksi = Menu::where('name', 'Transaksi')->first();
    
    if ($parentTransaksi) {
        // 2. Ubah menu lama (Setor & Tarik Simpanan) menjadi Setoran Simpanan
        $setoranMenu = Menu::where('name', 'Setor & Tarik Simpanan')->first();
        if ($setoranMenu) {
            $setoranMenu->update([
                'name' => 'Setoran Simpanan',
                'url' => '/saving-transactions?type=DEPOSIT'
            ]);
            
            // 3. Buat menu baru untuk Penarikan Simpanan
            $tarikanMenu = Menu::create([
                'name' => 'Penarikan Simpanan',
                'url' => '/saving-transactions?type=WITHDRAWAL',
                'icon' => 'ArrowUpCircle',
                'parent_id' => $parentTransaksi->id,
                'order' => $setoranMenu->order + 1
            ]);
            
            // Berikan akses menu baru ini ke Super Admin
            $superAdmin = Role::where('name', 'Super Admin')->first();
            if ($superAdmin) {
                $superAdmin->menus()->attach($tarikanMenu->id);
            }
        }
    }

    DB::commit();
    echo "Menu Transaksi berhasil dipisah!\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
