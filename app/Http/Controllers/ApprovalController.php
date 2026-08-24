<?php

namespace App\Http\Controllers;

use App\Models\SavingTransaction;
use App\Models\SavingsAccount;
use App\Models\JournalHeader;
use App\Models\JournalLine;
use App\Models\GlAccount;
use App\Models\SavingDailyBalance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $pendingTransactions = SavingTransaction::where('tenant_id', $user->tenant_id)
            ->where('status', 'PENDING')
            ->whereHas('savingsAccount.customer', function ($query) use ($user) {
                $query->when($user->branch_id, function ($q) use ($user) {
                    return $q->where('branch_id', $user->branch_id);
                });
            })
            ->with(['savingsAccount.customer', 'savingsAccount.product', 'journalHeader'])
            ->latest()
            ->get();

        return Inertia::render('Approvals/Index', [
            'pendingTransactions' => $pendingTransactions
        ]);
    }

    public function approve(Request $request, SavingTransaction $transaction)
    {
        $transaction->load('savingsAccount.customer');
        if (
            $transaction->tenant_id !== auth()->user()->tenant_id || 
            $transaction->status !== 'PENDING' ||
            (auth()->user()->branch_id && $transaction->savingsAccount->customer->branch_id !== auth()->user()->branch_id)
        ) {
            abort(403);
        }

        $tenantId = $transaction->tenant_id;
        $branchId = auth()->user()->branch_id;
        $savingsAccount = $transaction->savingsAccount;

        $kasAccount = GlAccount::where('tenant_id', $tenantId)->where('account_number', '1110')->first();
        $tabunganAccount = GlAccount::where('tenant_id', $tenantId)->where('account_number', '2110')->first();

        if (!$kasAccount || !$tabunganAccount) {
            return redirect()->back()->withErrors(['message' => 'Akun GL standar belum disetting di Master COA.']);
        }

        DB::beginTransaction();
        try {
            // Check balance again before approving
            if ($transaction->transaction_type === 'WITHDRAWAL') {
                if ($savingsAccount->balance < $transaction->amount) {
                    throw new \Exception('Saldo tabungan nasabah tidak mencukupi saat di-approve.');
                }
            }

            // 1. Buat Header Jurnal
            $journalHeader = JournalHeader::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'journal_number' => 'JRN-APP-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(),
                'description' => ($transaction->transaction_type === 'DEPOSIT' ? 'Setoran' : 'Tarikan') . ' Tabungan Rek: ' . $savingsAccount->account_number . ' (Approved)',
                'reference' => 'TRX-APP-' . time()
            ]);

            // 2. Buat Lines Jurnal & Update Saldo Tabungan
            $debitAmount = 0;
            $creditAmount = 0;

            if ($transaction->transaction_type === 'DEPOSIT') {
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $kasAccount->id, 'debit' => $transaction->amount, 'credit' => 0, 'description' => 'Setoran Kas Bertambah']);
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $tabunganAccount->id, 'debit' => 0, 'credit' => $transaction->amount, 'description' => 'Kewajiban Tabungan Nasabah Bertambah']);
                
                $savingsAccount->increment('balance', $transaction->amount);
                $creditAmount = $transaction->amount;
            } else {
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $tabunganAccount->id, 'debit' => $transaction->amount, 'credit' => 0, 'description' => 'Kewajiban Tabungan Nasabah Berkurang']);
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $kasAccount->id, 'debit' => 0, 'credit' => $transaction->amount, 'description' => 'Tarikan Kas Berkurang']);
                
                $savingsAccount->decrement('balance', $transaction->amount);
                $debitAmount = $transaction->amount;
            }

            // Update Transaction
            $transaction->update([
                'status' => 'APPROVED',
                'journal_header_id' => $journalHeader->id,
                'balance_after' => $savingsAccount->balance
            ]);

            // Record Daily Balance
            $today = now()->format('Y-m-d');
            $dailyBalance = SavingDailyBalance::firstOrNew([
                'tenant_id' => $tenantId,
                'savings_account_id' => $savingsAccount->id,
                'date' => $today
            ]);

            $dailyBalance->balance = $savingsAccount->balance;
            $dailyBalance->total_debit += $debitAmount;
            $dailyBalance->total_credit += $creditAmount;
            $dailyBalance->save();

            DB::commit();
            return redirect()->back()->with('success', 'Transaksi berhasil di-Approve dan Jurnal terbentuk.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Gagal meng-Approve: ' . $e->getMessage()]);
        }
    }

    public function reject(Request $request, SavingTransaction $transaction)
    {
        $transaction->load('savingsAccount.customer');
        if (
            $transaction->tenant_id !== auth()->user()->tenant_id || 
            $transaction->status !== 'PENDING' ||
            (auth()->user()->branch_id && $transaction->savingsAccount->customer->branch_id !== auth()->user()->branch_id)
        ) {
            abort(403);
        }

        $transaction->update(['status' => 'REJECTED']);

        return redirect()->back()->with('success', 'Transaksi berhasil di-Reject.');
    }
}
