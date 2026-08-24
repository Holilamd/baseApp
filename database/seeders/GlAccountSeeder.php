<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\GlAccount;
use App\Models\Tenant;

class GlAccountSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tenant = Tenant::first();
        if (!$tenant) return;

        $tenant_id = $tenant->id;

        $accounts = [
            // 1. ASET (DEBIT)
            ['account_number' => '1000', 'name' => 'ASET', 'normal_balance' => 'DEBIT', 'parent_id' => null],
            // 11. ASET LANCAR
            ['account_number' => '1100', 'name' => 'ASET LANCAR', 'normal_balance' => 'DEBIT', 'parent_number' => '1000'],
            ['account_number' => '1110', 'name' => 'Kas Teller Pusat', 'normal_balance' => 'DEBIT', 'parent_number' => '1100'],
            ['account_number' => '1120', 'name' => 'Kas Besar / Brankas', 'normal_balance' => 'DEBIT', 'parent_number' => '1100'],
            ['account_number' => '1130', 'name' => 'Bank Syariah Indonesia (BSI)', 'normal_balance' => 'DEBIT', 'parent_number' => '1100'],
            ['account_number' => '1140', 'name' => 'Bank Muamalat', 'normal_balance' => 'DEBIT', 'parent_number' => '1100'],
            // 14. PIUTANG PEMBIAYAAN
            ['account_number' => '1400', 'name' => 'PIUTANG PEMBIAYAAN', 'normal_balance' => 'DEBIT', 'parent_number' => '1000'],
            ['account_number' => '1410', 'name' => 'Piutang Murabahah', 'normal_balance' => 'DEBIT', 'parent_number' => '1400'],
            ['account_number' => '1420', 'name' => 'Piutang Qardh', 'normal_balance' => 'DEBIT', 'parent_number' => '1400'],
            // 15. PEMBIAYAAN
            ['account_number' => '1500', 'name' => 'PEMBIAYAAN', 'normal_balance' => 'DEBIT', 'parent_number' => '1000'],
            ['account_number' => '1510', 'name' => 'Pembiayaan Mudharabah', 'normal_balance' => 'DEBIT', 'parent_number' => '1500'],
            ['account_number' => '1520', 'name' => 'Pembiayaan Musyarakah', 'normal_balance' => 'DEBIT', 'parent_number' => '1500'],
            // 19. ASET TETAP
            ['account_number' => '1900', 'name' => 'ASET TETAP & INVENTARIS', 'normal_balance' => 'DEBIT', 'parent_number' => '1000'],
            ['account_number' => '1910', 'name' => 'Aset Tanah & Bangunan', 'normal_balance' => 'DEBIT', 'parent_number' => '1900'],
            ['account_number' => '1920', 'name' => 'Aset Kendaraan', 'normal_balance' => 'DEBIT', 'parent_number' => '1900'],
            
            // 2. KEWAJIBAN / LIABILITAS (CREDIT)
            ['account_number' => '2000', 'name' => 'KEWAJIBAN', 'normal_balance' => 'CREDIT', 'parent_id' => null],
            // 21. KEWAJIBAN SEGERA / TITIPAN
            ['account_number' => '2100', 'name' => 'KEWAJIBAN SEGERA', 'normal_balance' => 'CREDIT', 'parent_number' => '2000'],
            ['account_number' => '2110', 'name' => 'Simpanan Wadiah', 'normal_balance' => 'CREDIT', 'parent_number' => '2100'],
            ['account_number' => '2120', 'name' => 'Dana ZIS (Zakat, Infaq, Sedekah)', 'normal_balance' => 'CREDIT', 'parent_number' => '2100'],
            ['account_number' => '2130', 'name' => 'Dana Wakaf', 'normal_balance' => 'CREDIT', 'parent_number' => '2100'],
            // 22. DANA SYIRKAH TEMPORER
            ['account_number' => '2200', 'name' => 'DANA SYIRKAH TEMPORER', 'normal_balance' => 'CREDIT', 'parent_number' => '2000'],
            ['account_number' => '2210', 'name' => 'Simpanan Mudharabah', 'normal_balance' => 'CREDIT', 'parent_number' => '2200'],
            ['account_number' => '2220', 'name' => 'Simpanan Berjangka (Deposito)', 'normal_balance' => 'CREDIT', 'parent_number' => '2200'],

            // 3. EKUITAS (CREDIT)
            ['account_number' => '3000', 'name' => 'EKUITAS', 'normal_balance' => 'CREDIT', 'parent_id' => null],
            ['account_number' => '3100', 'name' => 'MODAL ANGGOTA', 'normal_balance' => 'CREDIT', 'parent_number' => '3000'],
            ['account_number' => '3110', 'name' => 'Simpanan Pokok', 'normal_balance' => 'CREDIT', 'parent_number' => '3100'],
            ['account_number' => '3120', 'name' => 'Simpanan Wajib', 'normal_balance' => 'CREDIT', 'parent_number' => '3100'],
            ['account_number' => '3200', 'name' => 'CADANGAN & SHU', 'normal_balance' => 'CREDIT', 'parent_number' => '3000'],
            ['account_number' => '3210', 'name' => 'Cadangan Umum', 'normal_balance' => 'CREDIT', 'parent_number' => '3200'],
            ['account_number' => '3220', 'name' => 'Sisa Hasil Usaha (SHU) Ditahan', 'normal_balance' => 'CREDIT', 'parent_number' => '3200'],
            ['account_number' => '3230', 'name' => 'SHU Tahun Berjalan', 'normal_balance' => 'CREDIT', 'parent_number' => '3200'],

            // 4. PENDAPATAN (CREDIT)
            ['account_number' => '4000', 'name' => 'PENDAPATAN OPERASIONAL', 'normal_balance' => 'CREDIT', 'parent_id' => null],
            ['account_number' => '4100', 'name' => 'PENDAPATAN MARGIN & BAGI HASIL', 'normal_balance' => 'CREDIT', 'parent_number' => '4000'],
            ['account_number' => '4110', 'name' => 'Pendapatan Margin Murabahah', 'normal_balance' => 'CREDIT', 'parent_number' => '4100'],
            ['account_number' => '4120', 'name' => 'Pendapatan Bagi Hasil Mudharabah', 'normal_balance' => 'CREDIT', 'parent_number' => '4100'],
            ['account_number' => '4130', 'name' => 'Pendapatan Bagi Hasil Musyarakah', 'normal_balance' => 'CREDIT', 'parent_number' => '4100'],
            ['account_number' => '4200', 'name' => 'PENDAPATAN LAINNYA', 'normal_balance' => 'CREDIT', 'parent_number' => '4000'],
            ['account_number' => '4210', 'name' => 'Pendapatan Administrasi', 'normal_balance' => 'CREDIT', 'parent_number' => '4200'],

            // 5. BEBAN (DEBIT)
            ['account_number' => '5000', 'name' => 'BEBAN OPERASIONAL', 'normal_balance' => 'DEBIT', 'parent_id' => null],
            ['account_number' => '5100', 'name' => 'BEBAN BAGI HASIL', 'normal_balance' => 'DEBIT', 'parent_number' => '5000'],
            ['account_number' => '5110', 'name' => 'Bagi Hasil Simpanan Mudharabah', 'normal_balance' => 'DEBIT', 'parent_number' => '5100'],
            ['account_number' => '5120', 'name' => 'Bagi Hasil Deposito Mudharabah', 'normal_balance' => 'DEBIT', 'parent_number' => '5100'],
            ['account_number' => '5200', 'name' => 'BEBAN PEGAWAI', 'normal_balance' => 'DEBIT', 'parent_number' => '5000'],
            ['account_number' => '5210', 'name' => 'Beban Gaji', 'normal_balance' => 'DEBIT', 'parent_number' => '5200'],
            ['account_number' => '5220', 'name' => 'Beban Tunjangan & Bonus', 'normal_balance' => 'DEBIT', 'parent_number' => '5200'],
            ['account_number' => '5300', 'name' => 'BEBAN KANTOR & UMUM', 'normal_balance' => 'DEBIT', 'parent_number' => '5000'],
            ['account_number' => '5310', 'name' => 'Beban Listrik, Air & Telepon', 'normal_balance' => 'DEBIT', 'parent_number' => '5300'],
            ['account_number' => '5320', 'name' => 'Beban ATK & Cetakan', 'normal_balance' => 'DEBIT', 'parent_number' => '5300'],
            ['account_number' => '5330', 'name' => 'Beban Sewa Gedung', 'normal_balance' => 'DEBIT', 'parent_number' => '5300'],
            ['account_number' => '5340', 'name' => 'Beban Pemeliharaan', 'normal_balance' => 'DEBIT', 'parent_number' => '5300'],
        ];

        // Process insertion while keeping track of IDs for parent mapping
        $insertedAccounts = [];

        foreach ($accounts as $acc) {
            $parent_id = null;
            if (isset($acc['parent_number'])) {
                if (isset($insertedAccounts[$acc['parent_number']])) {
                    $parent_id = $insertedAccounts[$acc['parent_number']]->id;
                }
            }

            $glAccount = GlAccount::firstOrCreate(
                ['tenant_id' => $tenant_id, 'account_number' => $acc['account_number']],
                [
                    'name' => $acc['name'],
                    'normal_balance' => $acc['normal_balance'],
                    'parent_id' => $parent_id
                ]
            );

            $insertedAccounts[$acc['account_number']] = $glAccount;
        }
    }
}
