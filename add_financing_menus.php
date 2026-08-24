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
    // Parent Menu: Pembiayaan
    $pembiayaan = Menu::create([
        'name' => 'Pembiayaan',
        'url' => null,
        'icon' => 'Briefcase',
        'parent_id' => null,
        'order' => 4, // Setelah Transaksi Simpanan
    ]);

    // Sub Menu: Pengajuan Pembiayaan
    $pengajuan = Menu::create([
        'name' => 'Pengajuan Pembiayaan',
        'url' => '/financings',
        'icon' => 'FilePlus',
        'parent_id' => $pembiayaan->id,
        'order' => 1,
    ]);

    // Sub Menu: Otorisasi Pencairan
    $pencairan = Menu::create([
        'name' => 'Otorisasi Pencairan',
        'url' => '/approvals/maker-checker?type=financing',
        'icon' => 'CheckSquare',
        'parent_id' => $pembiayaan->id,
        'order' => 2,
    ]);

    // Sub Menu: Pembayaran Angsuran
    $angsuran = Menu::create([
        'name' => 'Pembayaran Angsuran',
        'url' => '/financing-payments',
        'icon' => 'Banknotes',
        'parent_id' => $pembiayaan->id,
        'order' => 3,
    ]);

    // Assign ke Super Admin
    $superAdmin = Role::where('name', 'Super Admin')->first();
    if ($superAdmin) {
        $superAdmin->menus()->attach([$pembiayaan->id, $pengajuan->id, $pencairan->id, $angsuran->id]);
    }

    DB::commit();
    echo "Menu Pembiayaan berhasil ditambahkan!\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error: " . $e->getMessage() . "\n";
}
