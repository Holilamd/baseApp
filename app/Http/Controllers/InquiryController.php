<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SavingsAccount;
use App\Models\SavingTransaction;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class InquiryController extends Controller
{
    public function savings()
    {
        return Inertia::render('Inquiries/Savings');
    }

    public function getSavingsHistory(Request $request, $id)
    {
        $account = SavingsAccount::with(['customer', 'product'])
            ->where('tenant_id', auth()->user()->tenant_id)
            ->findOrFail($id);

        if (auth()->user()->branch_id && $account->branch_id !== auth()->user()->branch_id) {
            abort(403);
        }

        $query = SavingTransaction::where('savings_account_id', $account->id)
            ->where('status', 'APPROVED');

        if ($request->filled('start_date')) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        if ($request->filled('end_date')) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $transactions = $query->latest()->get();

        return response()->json([
            'account' => $account,
            'transactions' => $transactions
        ]);
    }

    public function printStatement(Request $request, $id)
    {
        $account = SavingsAccount::with(['customer', 'product'])
            ->where('tenant_id', auth()->user()->tenant_id)
            ->findOrFail($id);

        if (auth()->user()->branch_id && $account->branch_id !== auth()->user()->branch_id) {
            abort(403);
        }

        $startDate = $request->query('start_date', Carbon::now()->subMonths(1)->format('Y-m-d'));
        $endDate = $request->query('end_date', Carbon::now()->format('Y-m-d'));

        // Query transactions in range
        $transactions = SavingTransaction::where('savings_account_id', $account->id)
            ->where('status', 'APPROVED')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->latest()
            ->get();

        // Calculate Saldo Awal by looking at the last transaction before start_date
        $lastTxBeforeStart = SavingTransaction::where('savings_account_id', $account->id)
            ->where('status', 'APPROVED')
            ->whereDate('created_at', '<', $startDate)
            ->latest('id')
            ->first();

        $saldoAwal = $lastTxBeforeStart ? $lastTxBeforeStart->balance_after : 0;

        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];

        $pdf = Pdf::loadView('pdf.mutasi-tabungan', [
            'account' => $account,
            'transactions' => $transactions,
            'saldo_awal' => $saldoAwal,
            'start_date' => Carbon::parse($startDate)->format('d/m/Y'),
            'end_date' => Carbon::parse($endDate)->format('d/m/Y'),
            'tenant_name' => $tenant->name,
            'tenant_address' => $settings['company_address'] ?? '',
            'kop_surat_url' => $settings['kop_surat_url'] ?? null,
        ]);

        return $pdf->download('Mutasi-' . $account->account_number . '.pdf');
    }
}
