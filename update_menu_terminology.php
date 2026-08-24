<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Menu;
use Illuminate\Support\Facades\DB;

DB::beginTransaction();
try {
    // 1. Level 1 Menus
    Menu::where('name', 'CIF')->update(['name' => 'Anggota', 'icon' => 'Users']);
    Menu::where('name', 'Buka Tabungan')->update(['name' => 'Simpanan', 'icon' => 'Wallet']);
    
    // 2. Level 2 Menus (Anggota)
    Menu::where('name', 'Data CIF')->update(['name' => 'Data Anggota']);
    Menu::where('name', 'Otorisasi CIF')->update(['name' => 'Otorisasi Anggota']);
    
    // 3. Level 2 Menus (Simpanan)
    Menu::where('name', 'Data Tabungan')->update(['name' => 'Rekening Simpanan']);
    Menu::where('name', 'Otorisasi Buka Tabungan')->update(['name' => 'Otorisasi Rekening']);
    
    // 4. Level 2 Menus (Transaksi)
    Menu::where('name', 'Setor & Tarik')->update(['name' => 'Setor & Tarik Simpanan']);
    Menu::where('name', 'Otorisasi Setor Tunai')->update(['name' => 'Otor Setoran']);
    Menu::where('name', 'Otorisasi Tarik Tunai')->update(['name' => 'Otor Penarikan']);
    Menu::where('name', 'Otorisasi Transfer')->update(['name' => 'Otor Transfer']);

    DB::commit();
    echo "Menu terminology updated successfully!\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error updating menus: " . $e->getMessage() . "\n";
}
