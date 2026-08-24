<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\GlAccount;
use App\Models\Tenant;

class CoaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::first();
        if (!$tenant) {
            $this->command->warn('Tenant belum ada, COA tidak di-seed.');
            return;
        }

        $tenantId = $tenant->id;

        // 1. AKTIVA (Aset) - Normal Balance: DEBIT
        $aktiva = GlAccount::firstOrCreate([
            'tenant_id' => $tenantId,
            'account_number' => '1000',
        ], [
            'name' => 'Aset / Aktiva',
            'normal_balance' => 'DEBIT'
        ]);

        $kasBank = GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '1100'], ['name' => 'Kas & Bank', 'parent_id' => $aktiva->id, 'normal_balance' => 'DEBIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '1110'], ['name' => 'Kas Teller', 'parent_id' => $kasBank->id, 'normal_balance' => 'DEBIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '1120'], ['name' => 'Kas Besar (Brankas)', 'parent_id' => $kasBank->id, 'normal_balance' => 'DEBIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '1210'], ['name' => 'Rekening Bank Syariah', 'parent_id' => $kasBank->id, 'normal_balance' => 'DEBIT']);

        $pembiayaan = GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '1300'], ['name' => 'Piutang & Pembiayaan', 'parent_id' => $aktiva->id, 'normal_balance' => 'DEBIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '1310'], ['name' => 'Piutang Murabahah', 'parent_id' => $pembiayaan->id, 'normal_balance' => 'DEBIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '1320'], ['name' => 'Pembiayaan Mudharabah', 'parent_id' => $pembiayaan->id, 'normal_balance' => 'DEBIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '1330'], ['name' => 'Pembiayaan Musyarakah', 'parent_id' => $pembiayaan->id, 'normal_balance' => 'DEBIT']);

        // 2. KEWAJIBAN (Pasiva) - Normal Balance: CREDIT
        $kewajiban = GlAccount::firstOrCreate([
            'tenant_id' => $tenantId,
            'account_number' => '2000',
        ], [
            'name' => 'Kewajiban / Pasiva',
            'normal_balance' => 'CREDIT'
        ]);

        $danaPihakKetiga = GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '2100'], ['name' => 'Dana Pihak Ketiga (Simpanan)', 'parent_id' => $kewajiban->id, 'normal_balance' => 'CREDIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '2110'], ['name' => 'Simpanan Wadi\'ah (Sukarela)', 'parent_id' => $danaPihakKetiga->id, 'normal_balance' => 'CREDIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '2120'], ['name' => 'Simpanan Mudharabah', 'parent_id' => $danaPihakKetiga->id, 'normal_balance' => 'CREDIT']);

        // 3. EKUITAS (Modal) - Normal Balance: CREDIT
        $ekuitas = GlAccount::firstOrCreate([
            'tenant_id' => $tenantId,
            'account_number' => '3000',
        ], [
            'name' => 'Ekuitas / Modal',
            'normal_balance' => 'CREDIT'
        ]);

        $modal = GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '3100'], ['name' => 'Modal BMT', 'parent_id' => $ekuitas->id, 'normal_balance' => 'CREDIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '3110'], ['name' => 'Simpanan Pokok', 'parent_id' => $modal->id, 'normal_balance' => 'CREDIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '3120'], ['name' => 'Simpanan Wajib', 'parent_id' => $modal->id, 'normal_balance' => 'CREDIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '3130'], ['name' => 'SHU Ditahan', 'parent_id' => $modal->id, 'normal_balance' => 'CREDIT']);

        // 4. PENDAPATAN - Normal Balance: CREDIT
        $pendapatan = GlAccount::firstOrCreate([
            'tenant_id' => $tenantId,
            'account_number' => '4000',
        ], [
            'name' => 'Pendapatan',
            'normal_balance' => 'CREDIT'
        ]);

        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '4110'], ['name' => 'Pendapatan Margin Murabahah', 'parent_id' => $pendapatan->id, 'normal_balance' => 'CREDIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '4120'], ['name' => 'Pendapatan Bagi Hasil Mudharabah', 'parent_id' => $pendapatan->id, 'normal_balance' => 'CREDIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '4130'], ['name' => 'Pendapatan Administrasi', 'parent_id' => $pendapatan->id, 'normal_balance' => 'CREDIT']);

        // 5. BEBAN - Normal Balance: DEBIT
        $beban = GlAccount::firstOrCreate([
            'tenant_id' => $tenantId,
            'account_number' => '5000',
        ], [
            'name' => 'Beban Operasional',
            'normal_balance' => 'DEBIT'
        ]);

        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '5110'], ['name' => 'Beban Gaji Karyawan', 'parent_id' => $beban->id, 'normal_balance' => 'DEBIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '5120'], ['name' => 'Beban Sewa Kantor', 'parent_id' => $beban->id, 'normal_balance' => 'DEBIT']);
        GlAccount::firstOrCreate(['tenant_id' => $tenantId, 'account_number' => '5130'], ['name' => 'Beban ATK & Cetak', 'parent_id' => $beban->id, 'normal_balance' => 'DEBIT']);
        
        $this->command->info('Master COA (Bagan Akun Standar BMT) berhasil ditambahkan.');
    }
}
