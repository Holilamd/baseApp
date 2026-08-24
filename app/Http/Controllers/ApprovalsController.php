<?php

namespace App\Http\Controllers;

use App\Models\Approval;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\ProductGlMapping;
use App\Models\JournalHeader;
use App\Models\JournalLine;
use App\Models\FinancingSchedule;
use App\Models\Financing;
use App\Models\SavingTransaction;

class ApprovalsController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->query('type', 'customer');
        $tenantId = auth()->user()->tenant_id;
        
        $query = Approval::where('tenant_id', $tenantId)
            ->where('status', 'PENDING')
            ->with(['creator', 'approver', 'approvable']);
            
        if ($type === 'customer') {
            $query->whereIn('approvable_type', [\App\Models\Customer::class]);
        } elseif ($type === 'savings_account') {
            $query->whereIn('approvable_type', [\App\Models\SavingsAccount::class]);
        } elseif ($type === 'saving_transaction') {
            $query->whereIn('approvable_type', [\App\Models\SavingTransaction::class]);
        } elseif ($type === 'financing') {
            $query->whereIn('approvable_type', [\App\Models\Financing::class]);
        }
            
        $approvals = $query->latest()->get();

        return Inertia::render('Approvals/MakerChecker', [
            'approvals' => $approvals,
            'type' => $type
        ]);
    }

    public function process(Request $request, Approval $approval)
    {
        if ($approval->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        if ($approval->created_by === auth()->id() && config('app.env') !== 'local') {
            return redirect()->back()->withErrors(['message' => 'Anda tidak dapat menyetujui request yang Anda buat sendiri (Maker tidak bisa menjadi Checker).']);
        }

        $validated = $request->validate([
            'action' => 'required|in:APPROVE,REJECT',
            'notes' => 'nullable|string'
        ]);

        DB::beginTransaction();
        try {
            if ($validated['action'] === 'APPROVE') {
                $approval->status = 'APPROVED';
                
                if ($approval->action === 'UPDATE' && $approval->approvable) {
                    $approval->approvable->update($approval->new_data);
                } elseif ($approval->action === 'CREATE') {
                    $modelClass = $approval->approvable_type;
                    $newData = $approval->new_data;

                    if ($modelClass === \App\Models\SavingsAccount::class) {
                        $branch = \App\Models\Branch::find($newData['branch_id']);
                        $product = \App\Models\Product::find($newData['product_id']);
                        if ($branch && $product) {
                            $count = \App\Models\SavingsAccount::where('tenant_id', $newData['tenant_id'])
                                ->where('branch_id', $branch->id)
                                ->where('product_id', $product->id)
                                ->count();
                            $sequence = str_pad($count + 1, 5, '0', STR_PAD_LEFT);
                            $newData['account_number'] = $branch->code . $product->code . $sequence;
                        }
                    }

                    if ($modelClass === \App\Models\Customer::class) {
                        if (array_key_exists('pokok_balance', $newData)) {
                            $newData['principal_saving'] = $newData['pokok_balance'];
                            unset($newData['pokok_balance']);
                        }
                        if (array_key_exists('wajib_balance', $newData)) {
                            $newData['mandatory_saving'] = $newData['wajib_balance'];
                            unset($newData['wajib_balance']);
                        }
                    }

                    $newRecord = $modelClass::create($newData);
                    $approval->approvable_id = $newRecord->id;

                    if ($modelClass === \App\Models\Customer::class) {
                        $settings = auth()->user()->tenant->settings ?? [];
                        $totalSaving = ($newData['principal_saving'] ?? 0) + ($newData['mandatory_saving'] ?? 0);
                        if ($totalSaving > 0) {
                            $cashGlId = $settings['cash_gl_account_id'] ?? null;
                            $pokokGlId = $settings['principal_saving_gl_account_id'] ?? null;
                            $wajibGlId = $settings['mandatory_saving_gl_account_id'] ?? null;

                            if (!$cashGlId) throw new \Exception('Akun Kas Utama belum dikonfigurasi di Pengaturan Koperasi.');
                            
                            $journal = JournalHeader::create([
                                'tenant_id' => $approval->tenant_id,
                                'branch_id' => $newData['branch_id'],
                                'journal_number' => 'JRN-MEMB-' . date('Ymd') . '-' . rand(1000, 9999),
                                'date' => now(),
                                'reference' => 'CIF-' . $newData['cif_number'],
                                'description' => 'Setoran Simpanan Pokok/Wajib Awal Anggota: ' . $newData['full_name'],
                            ]);

                            // Debit Kas
                            JournalLine::create(['tenant_id' => $approval->tenant_id, 'journal_header_id' => $journal->id, 'gl_account_id' => $cashGlId, 'debit' => $totalSaving, 'credit' => 0, 'description' => 'Kas Masuk Simpanan Anggota']);

                            // Credit Simpanan Pokok
                            if (($newData['principal_saving'] ?? 0) > 0) {
                                if (!$pokokGlId) throw new \Exception('Akun Simpanan Pokok belum dikonfigurasi di Pengaturan Koperasi.');
                                JournalLine::create(['tenant_id' => $approval->tenant_id, 'journal_header_id' => $journal->id, 'gl_account_id' => $pokokGlId, 'debit' => 0, 'credit' => $newData['principal_saving'], 'description' => 'Simpanan Pokok Anggota']);
                            }

                            // Credit Simpanan Wajib
                            if (($newData['mandatory_saving'] ?? 0) > 0) {
                                if (!$wajibGlId) throw new \Exception('Akun Simpanan Wajib belum dikonfigurasi di Pengaturan Koperasi.');
                                JournalLine::create(['tenant_id' => $approval->tenant_id, 'journal_header_id' => $journal->id, 'gl_account_id' => $wajibGlId, 'debit' => 0, 'credit' => $newData['mandatory_saving'], 'description' => 'Simpanan Wajib Anggota']);
                            }
                        }
                    }
                } elseif ($approval->action === 'APPROVE_TRANSACTION') {
                    $transaction = $approval->approvable;
                    if ($transaction && $transaction->status === 'PENDING') {
                        $this->processSavingTransaction($transaction);
                    }
                } elseif ($approval->action === 'APPROVE_FINANCING_DISBURSEMENT') {
                    $financing = $approval->approvable;
                    if ($financing && $financing->status === 'PENDING') {
                        $this->processFinancingDisbursement($financing);
                    }
                }
            } else {
                $approval->status = 'REJECTED';
                if ($approval->action === 'APPROVE_TRANSACTION' && $approval->approvable) {
                    $approval->approvable->update(['status' => 'REJECTED']);
                } elseif ($approval->action === 'APPROVE_FINANCING_DISBURSEMENT' && $approval->approvable) {
                    $approval->approvable->update(['status' => 'REJECTED']);
                }
            }

            $approval->approved_by = auth()->id();
            $approval->notes = $validated['notes'] ?? null;
            $approval->save();

            DB::commit();
            return redirect()->back()->with('success', 'Request berhasil diproses.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Gagal memproses request: ' . $e->getMessage()]);
        }
    }

    private function processSavingTransaction(SavingTransaction $transaction)
    {
        $savingsAccount = $transaction->savingsAccount;
        $tenantId = $transaction->tenant_id;
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        $cashGlId = $settings['cash_gl_account_id'] ?? null;
        $rakGlId = $settings['rak_gl_account_id'] ?? null;

        if (!$cashGlId) throw new \Exception('Akun Kas Utama belum di-set di Pengaturan Tenant.');

        $trigger = $transaction->transaction_type === 'DEPOSIT' ? 'CASH_DEPOSIT' : 'CASH_WITHDRAWAL';
        $mapping = ProductGlMapping::where('product_id', $savingsAccount->product_id)
            ->where('transaction_trigger', $trigger)
            ->first();

        if (!$mapping) throw new \Exception('Pemetaan GL untuk transaksi ini belum diatur di Produk.');

        $tabunganGlId = $mapping->gl_account_id;

        // Cek Transaksi Lintas Cabang (RAK)
        $tellerBranchId = $transaction->branch_id;
        $accountBranchId = $savingsAccount->branch_id;
        $isCrossBranch = $tellerBranchId !== $accountBranchId;

        if ($isCrossBranch && !$rakGlId) {
            throw new \Exception('Akun RAK belum di-set di Pengaturan Tenant untuk transaksi lintas cabang.');
        }

        if ($transaction->transaction_type === 'WITHDRAWAL' && $savingsAccount->balance < $transaction->amount) {
            throw new \Exception('Saldo tabungan tidak mencukupi untuk ditarik.');
        }

        if ($isCrossBranch) {
            // Jurnal di Cabang Teller
            $journalTeller = JournalHeader::create([
                'tenant_id' => $tenantId, 'branch_id' => $tellerBranchId,
                'journal_number' => 'JRN-TLR-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(), 'reference' => 'TRX-SAV-' . $transaction->id,
                'description' => ($trigger === 'CASH_DEPOSIT' ? 'Setoran Lintas Cabang Rek: ' : 'Tarikan Lintas Cabang Rek: ') . $savingsAccount->account_number
            ]);

            // Jurnal di Cabang Rekening
            $journalAccount = JournalHeader::create([
                'tenant_id' => $tenantId, 'branch_id' => $accountBranchId,
                'journal_number' => 'JRN-ACT-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(), 'reference' => 'TRX-SAV-' . $transaction->id,
                'description' => ($trigger === 'CASH_DEPOSIT' ? 'Terima Setoran via RAK Rek: ' : 'Tarikan via RAK Rek: ') . $savingsAccount->account_number
            ]);

            if ($trigger === 'CASH_DEPOSIT') {
                // Teller: Debit Kas, Credit RAK
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalTeller->id, 'gl_account_id' => $cashGlId, 'debit' => $transaction->amount, 'credit' => 0, 'description' => 'Kas Bertambah']);
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalTeller->id, 'gl_account_id' => $rakGlId, 'debit' => 0, 'credit' => $transaction->amount, 'description' => 'Hutang RAK ke Cabang Tujuan']);
                // Account: Debit RAK, Credit Tabungan
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalAccount->id, 'gl_account_id' => $rakGlId, 'debit' => $transaction->amount, 'credit' => 0, 'description' => 'Piutang RAK dari Cabang Teller']);
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalAccount->id, 'gl_account_id' => $tabunganGlId, 'debit' => 0, 'credit' => $transaction->amount, 'description' => 'Tabungan Bertambah']);
                $savingsAccount->increment('balance', $transaction->amount);
            } else {
                // Teller: Debit RAK, Credit Kas
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalTeller->id, 'gl_account_id' => $rakGlId, 'debit' => $transaction->amount, 'credit' => 0, 'description' => 'Piutang RAK ke Cabang Asal']);
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalTeller->id, 'gl_account_id' => $cashGlId, 'debit' => 0, 'credit' => $transaction->amount, 'description' => 'Kas Berkurang']);
                // Account: Debit Tabungan, Credit RAK
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalAccount->id, 'gl_account_id' => $tabunganGlId, 'debit' => $transaction->amount, 'credit' => 0, 'description' => 'Tabungan Berkurang']);
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalAccount->id, 'gl_account_id' => $rakGlId, 'debit' => 0, 'credit' => $transaction->amount, 'description' => 'Hutang RAK ke Cabang Teller']);
                $savingsAccount->decrement('balance', $transaction->amount);
            }
            $transaction->update([
                'status' => 'APPROVED',
                'journal_header_id' => $journalTeller->id,
                'balance_after' => $savingsAccount->balance
            ]);
        } else {
            // Jurnal Normal
            $journalHeader = JournalHeader::create([
                'tenant_id' => $tenantId, 'branch_id' => $tellerBranchId,
                'journal_number' => 'JRN-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(), 'reference' => 'TRX-SAV-' . $transaction->id,
                'description' => ($trigger === 'CASH_DEPOSIT' ? 'Setoran Tabungan Rek: ' : 'Tarikan Tabungan Rek: ') . $savingsAccount->account_number
            ]);

            if ($trigger === 'CASH_DEPOSIT') {
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $cashGlId, 'debit' => $transaction->amount, 'credit' => 0, 'description' => 'Kas Bertambah']);
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $tabunganGlId, 'debit' => 0, 'credit' => $transaction->amount, 'description' => 'Tabungan Bertambah']);
                $savingsAccount->increment('balance', $transaction->amount);
            } else {
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $tabunganGlId, 'debit' => $transaction->amount, 'credit' => 0, 'description' => 'Tabungan Berkurang']);
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $cashGlId, 'debit' => 0, 'credit' => $transaction->amount, 'description' => 'Kas Berkurang']);
                $savingsAccount->decrement('balance', $transaction->amount);
            }
            $transaction->update([
                'status' => 'APPROVED',
                'journal_header_id' => $journalHeader->id,
                'balance_after' => $savingsAccount->balance
            ]);
        }
    }

    private function processFinancingDisbursement(Financing $financing)
    {
        $tenantId = $financing->tenant_id;
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        
        $rakGlId = $settings['rak_gl_account_id'] ?? null;
        $savingsAccount = $financing->savingsAccount;
        if (!$savingsAccount) throw new \Exception('Rekening simpanan untuk pencairan belum diatur pada kontrak ini.');

        // Get GL Mappings for Lending
        $mappingDisb = ProductGlMapping::where('product_id', $financing->product_id)
            ->where('transaction_trigger', 'DISBURSEMENT')
            ->first();
        $mappingDefMargin = ProductGlMapping::where('product_id', $financing->product_id)
            ->where('transaction_trigger', 'DEFERRED_MARGIN')
            ->first();

        if (!$mappingDisb || !$mappingDefMargin) {
            throw new \Exception('Pemetaan GL (DISBURSEMENT atau DEFERRED_MARGIN) untuk produk pembiayaan ini belum diatur.');
        }

        $piutangGlId = $mappingDisb->gl_account_id;
        $deferredMarginGlId = $mappingDefMargin->gl_account_id;

        // Get GL Mapping for Savings (to credit customer savings account)
        $mappingSaving = ProductGlMapping::where('product_id', $savingsAccount->product_id)
            ->where('transaction_trigger', 'CASH_DEPOSIT')
            ->first();

        if (!$mappingSaving) {
            throw new \Exception('Pemetaan GL (CASH_DEPOSIT) untuk produk simpanan tujuan belum diatur.');
        }

        $tabunganGlId = $mappingSaving->gl_account_id;

        // Check if Cross-Branch (RAK)
        $financingBranchId = $financing->branch_id;
        $savingsBranchId = $savingsAccount->branch_id;
        $isCrossBranch = $financingBranchId !== $savingsBranchId;

        if ($isCrossBranch && !$rakGlId) {
            throw new \Exception('Akun RAK belum di-set di Pengaturan Tenant untuk pencairan lintas cabang.');
        }

        if ($isCrossBranch) {
            // Journal at Financing Branch
            $journalFinancing = JournalHeader::create([
                'tenant_id' => $tenantId, 
                'branch_id' => $financingBranchId,
                'journal_number' => 'JRN-DISB-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(), 
                'reference' => 'PFN-' . $financing->id,
                'description' => 'Pencairan Pembiayaan No: ' . $financing->financing_number . ' ke Rek Simpanan Lintas Cabang'
            ]);

            // Debit Piutang (Full Price)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalFinancing->id, 'gl_account_id' => $piutangGlId, 'debit' => $financing->total_payment, 'credit' => 0, 'description' => 'Piutang Pembiayaan Bertambah']);
            // Credit Margin Ditangguhkan
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalFinancing->id, 'gl_account_id' => $deferredMarginGlId, 'debit' => 0, 'credit' => $financing->total_margin, 'description' => 'Margin Murabahah Ditangguhkan']);
            // Credit RAK (Plafond/Principal)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalFinancing->id, 'gl_account_id' => $rakGlId, 'debit' => 0, 'credit' => $financing->amount, 'description' => 'RAK Cabang Tujuan Pencairan']);

            // Journal at Savings Branch
            $journalSaving = JournalHeader::create([
                'tenant_id' => $tenantId, 
                'branch_id' => $savingsBranchId,
                'journal_number' => 'JRN-DISBSAV-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(), 
                'reference' => 'PFN-' . $financing->id,
                'description' => 'Terima Pencairan Pembiayaan via RAK No: ' . $financing->financing_number
            ]);

            // Debit RAK (Plafond)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalSaving->id, 'gl_account_id' => $rakGlId, 'debit' => $financing->amount, 'credit' => 0, 'description' => 'RAK Cabang Asal Pembiayaan']);
            // Credit Simpanan Nasabah (Plafond)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalSaving->id, 'gl_account_id' => $tabunganGlId, 'debit' => 0, 'credit' => $financing->amount, 'description' => 'Tabungan Nasabah Bertambah']);
        } else {
            // Normal Single-Branch Journal
            $journalHeader = JournalHeader::create([
                'tenant_id' => $tenantId, 
                'branch_id' => $financingBranchId,
                'journal_number' => 'JRN-DISB-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(), 
                'reference' => 'PFN-' . $financing->id,
                'description' => 'Pencairan Pembiayaan No: ' . $financing->financing_number
            ]);

            // Debit Piutang (Full Price)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $piutangGlId, 'debit' => $financing->total_payment, 'credit' => 0, 'description' => 'Piutang Pembiayaan Bertambah']);
            // Credit Simpanan Nasabah (Plafond/Principal)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $tabunganGlId, 'debit' => 0, 'credit' => $financing->amount, 'description' => 'Tabungan Nasabah Bertambah']);
            // Credit Margin Ditangguhkan
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $deferredMarginGlId, 'debit' => 0, 'credit' => $financing->total_margin, 'description' => 'Margin Murabahah Ditangguhkan']);
        }

        // Increment Savings Balance
        $savingsAccount->increment('balance', $financing->amount);

        // Create Saving Transaction for statement tracking
        SavingTransaction::create([
            'tenant_id' => $tenantId,
            'branch_id' => $savingsBranchId,
            'savings_account_id' => $savingsAccount->id,
            'transaction_number' => 'TXS-DISB-' . time() . rand(100, 999),
            'transaction_type' => 'DEPOSIT',
            'amount' => $financing->amount,
            'balance_after' => $savingsAccount->balance,
            'description' => 'Pencairan Pembiayaan No: ' . $financing->financing_number,
            'status' => 'APPROVED',
            'journal_header_id' => $isCrossBranch ? $journalSaving->id : $journalHeader->id,
            'created_by' => auth()->id(),
        ]);

        // Generate Jadwal Angsuran (Flat)
        $pokokPerBulan = $financing->amount / $financing->duration_months;
        $marginPerBulan = $financing->total_margin / $financing->duration_months;
        $angsuranPerBulan = $pokokPerBulan + $marginPerBulan;

        for ($i = 1; $i <= $financing->duration_months; $i++) {
            FinancingSchedule::create([
                'financing_id' => $financing->id,
                'installment_number' => $i,
                'due_date' => now()->addMonths($i),
                'principal_amount' => $pokokPerBulan,
                'margin_amount' => $marginPerBulan,
                'total_amount' => $angsuranPerBulan,
                'is_paid' => false
            ]);
        }

        $financing->update([
            'status' => 'ACTIVE',
            'disbursed_at' => now(),
        ]);
    }
}
