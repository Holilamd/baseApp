<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Tenant;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\GlAccount;
use App\Models\JournalHeader;
use App\Models\JournalLine;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberSavingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_savings_flow(): void
    {
        // 1. Create Tenant
        $tenant = Tenant::create([
            'name' => 'Koperasi Syariah Test',
            'domain' => 'test.bmt.com',
        ]);

        // 2. Create Branch
        $branch = Branch::create([
            'tenant_id' => $tenant->id,
            'code' => '001',
            'name' => 'Cabang Test',
        ]);

        // 3. Create GL Accounts
        $cashGl = GlAccount::create([
            'tenant_id' => $tenant->id,
            'account_number' => '1110',
            'name' => 'Kas Teller Utama',
            'type' => 'ASSET',
        ]);

        $pokokGl = GlAccount::create([
            'tenant_id' => $tenant->id,
            'account_number' => '3110',
            'name' => 'Simpanan Pokok Anggota',
            'type' => 'EQUITY',
        ]);

        $wajibGl = GlAccount::create([
            'tenant_id' => $tenant->id,
            'account_number' => '3120',
            'name' => 'Simpanan Wajib Anggota',
            'type' => 'EQUITY',
        ]);

        // 4. Update Tenant Settings
        $tenant->update([
            'settings' => [
                'cash_gl_account_id' => $cashGl->id,
                'principal_saving_gl_account_id' => $pokokGl->id,
                'mandatory_saving_gl_account_id' => $wajibGl->id,
                'approval_cif_create' => false, // No approval for simplicity
            ]
        ]);

        // 5. Create User
        $user = User::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $branch->id,
            'name' => 'Test Teller',
            'email' => 'teller@test.com',
            'password' => bcrypt('password'),
        ]);

        // 6. Test Store Customer with initial savings
        $response = $this->actingAs($user)->post(route('customers.store'), [
            'branch_id' => $branch->id,
            'cif_number' => '12345678',
            'full_name' => 'Anggota Test',
            'identity_type' => 'KTP',
            'identity_number' => '1234567890123456',
            'address' => 'Jl. Test No. 12',
            'phone_number' => '08123456789',
            'mother_maiden_name' => 'Ibu Kandung',
            'status' => 'ACTIVE',
            'principal_saving' => 100000,
            'mandatory_saving' => 50000,
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        // 7. Verify Customer was created with correct balances
        $customer = Customer::where('cif_number', '12345678')->first();
        $this->assertNotNull($customer);
        $this->assertEquals(100000, $customer->principal_saving);
        $this->assertEquals(50000, $customer->mandatory_saving);

        // 8. Verify Journal Entry was created
        $journal = JournalHeader::where('reference', 'CIF-12345678')->first();
        $this->assertNotNull($journal);
        $this->assertEquals('Setoran Simpanan Pokok/Wajib Awal Anggota: Anggota Test', $journal->description);

        $lines = JournalLine::where('journal_header_id', $journal->id)->get();
        $this->assertCount(3, $lines);

        // Kas Teller Debit 150.000
        $cashLine = $lines->where('gl_account_id', $cashGl->id)->first();
        $this->assertEquals(150000, $cashLine->debit);
        $this->assertEquals(0, $cashLine->credit);

        // Simpanan Pokok Credit 100.000
        $pokokLine = $lines->where('gl_account_id', $pokokGl->id)->first();
        $this->assertEquals(0, $pokokLine->debit);
        $this->assertEquals(100000, $pokokLine->credit);

        // Simpanan Wajib Credit 50.000
        $wajibLine = $lines->where('gl_account_id', $wajibGl->id)->first();
        $this->assertEquals(0, $wajibLine->debit);
        $this->assertEquals(50000, $wajibLine->credit);

        // 9. Test Deposit Simpanan Wajib (monthly payment)
        $response2 = $this->actingAs($user)->post(route('member-savings.deposit'), [
            'customer_id' => $customer->id,
            'type' => 'MANDATORY',
            'amount' => 50000,
            'description' => 'Setoran bulan Agustus',
        ]);

        $response2->assertSessionHasNoErrors();
        $response2->assertRedirect();

        // 10. Verify Customer updated balance
        $customer->refresh();
        $this->assertEquals(100000, $customer->principal_saving);
        $this->assertEquals(100000, $customer->mandatory_saving);

        // 11. Verify New Journal Entry
        $newJournal = JournalHeader::where('journal_number', 'like', 'JRN-MEMBSAV-%')->first();
        $this->assertNotNull($newJournal);
        $this->assertEquals('Setoran Simpanan Wajib Anggota: Anggota Test (Setoran bulan Agustus)', $newJournal->description);

        $newLines = JournalLine::where('journal_header_id', $newJournal->id)->get();
        $this->assertCount(2, $newLines);

        // Kas Teller Debit 50.000
        $newCashLine = $newLines->where('gl_account_id', $cashGl->id)->first();
        $this->assertEquals(50000, $newCashLine->debit);

        // Simpanan Wajib Credit 50.000
        $newWajibLine = $newLines->where('gl_account_id', $wajibGl->id)->first();
        $this->assertEquals(50000, $newWajibLine->credit);
    }
}
