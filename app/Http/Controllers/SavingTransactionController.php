<?php

namespace App\Http\Controllers;

use App\Models\SavingTransaction;
use App\Models\SavingsAccount;
use App\Models\JournalHeader;
use App\Models\JournalLine;
use App\Models\GlAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class SavingTransactionController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('branch_operational', only: ['store']),
        ];
    }

    public function index(Request $request)
    {
        $type = $request->query('type');
        
        $query = SavingTransaction::where('tenant_id', auth()->user()->tenant_id)
            ->with(['savingsAccount.customer', 'savingsAccount.product', 'journalHeader'])
            ->latest()
            ->limit(100); // limit for UI performance
            
        if ($type) {
            $query->where('transaction_type', $type);
        }
            
        $transactions = $query->get();
            
        return Inertia::render('SavingTransactions/Index', [
            'transactions' => $transactions,
            'transactionType' => $type,
            'savingsAccounts' => [] // Kept for backward compatibility
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'savings_account_id' => 'required|exists:savings_accounts,id',
            'transaction_type' => 'required|in:DEPOSIT,WITHDRAWAL,TRANSFER',
            'amount' => 'required|numeric|min:1',
            'description' => 'nullable|string',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $branchId = auth()->user()->branch_id; 

        $savingsAccount = SavingsAccount::where('id', $validated['savings_account_id'])
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        if (in_array($validated['transaction_type'], ['WITHDRAWAL', 'TRANSFER'])) {
            if ($savingsAccount->balance < $validated['amount']) {
                return redirect()->back()->withErrors(['message' => 'Saldo tabungan tidak mencukupi.']);
            }
        }

        DB::beginTransaction();
        try {
            $transaction = SavingTransaction::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId, // Set branch_id from user
                'savings_account_id' => $savingsAccount->id,
                'journal_header_id' => null,
                'transaction_type' => $validated['transaction_type'],
                'amount' => $validated['amount'],
                'description' => $validated['description'] ?? ($validated['transaction_type'] === 'DEPOSIT' ? 'Setoran Tunai' : 'Tarik Tunai'),
                'status' => 'PENDING'
            ]);

            \App\Models\Approval::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'approvable_type' => \App\Models\SavingTransaction::class,
                'approvable_id' => $transaction->id,
                'action' => 'APPROVE_TRANSACTION',
                'old_data' => null,
                'new_data' => ['transaction_type' => $validated['transaction_type'], 'amount' => $validated['amount']],
                'status' => 'PENDING',
                'created_by' => auth()->id(),
            ]);

            DB::commit();
            
            return redirect()->back()->with('success', 'Transaksi berhasil disimpan dan menunggu Otorisasi (PENDING).');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Transaksi gagal diproses: ' . $e->getMessage()]);
        }
    }
}
