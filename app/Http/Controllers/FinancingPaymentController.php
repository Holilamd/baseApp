<?php

namespace App\Http\Controllers;

use App\Models\Financing;
use App\Models\FinancingPayment;
use App\Models\FinancingSchedule;
use App\Models\ProductGlMapping;
use App\Models\JournalHeader;
use App\Models\JournalLine;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class FinancingPaymentController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('branch_operational', only: ['store', 'earlyPayoff']),
        ];
    }

    public function index(Request $request)
    {
        $financings = Financing::where('tenant_id', auth()->user()->tenant_id)
            ->where('status', 'ACTIVE')
            ->with(['customer', 'product', 'schedules'])
            ->latest()
            ->get();

        return Inertia::render('FinancingPayments/Index', [
            'financings' => $financings,
        ]);
    }

    /**
     * Bayar angsuran reguler (per jadwal).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'financing_id' => 'required|exists:financings,id',
            'schedule_id' => 'required|exists:financing_schedules,id',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $branchId = auth()->user()->branch_id;
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        $cashGlId = $settings['cash_gl_account_id'] ?? null;

        if (!$cashGlId) {
            return redirect()->back()->withErrors(['message' => 'Akun Kas Utama belum diatur di Pengaturan Tenant.']);
        }

        $financing = Financing::where('id', $validated['financing_id'])
            ->where('tenant_id', $tenantId)
            ->where('status', 'ACTIVE')
            ->firstOrFail();

        $schedule = FinancingSchedule::where('id', $validated['schedule_id'])
            ->where('financing_id', $financing->id)
            ->where('is_paid', false)
            ->firstOrFail();

        // Get GL Mappings
        $principalMapping = ProductGlMapping::where('product_id', $financing->product_id)
            ->where('transaction_trigger', 'INSTALLMENT_PRINCIPAL')->first();
        $marginMapping = ProductGlMapping::where('product_id', $financing->product_id)
            ->where('transaction_trigger', 'INSTALLMENT_MARGIN')->first();
        $deferredMarginMapping = ProductGlMapping::where('product_id', $financing->product_id)
            ->where('transaction_trigger', 'DEFERRED_MARGIN')->first();

        if (!$principalMapping || !$marginMapping || !$deferredMarginMapping) {
            return redirect()->back()->withErrors(['message' => 'Pemetaan GL untuk angsuran produk ini belum diatur.']);
        }

        DB::beginTransaction();
        try {
            // Auto-Journal
            $journalHeader = JournalHeader::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'journal_number' => 'JRN-ANG-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(),
                'reference' => 'PAY-' . $financing->financing_number . '-' . $schedule->installment_number,
                'description' => 'Pembayaran Angsuran Ke-' . $schedule->installment_number . ' No: ' . $financing->financing_number,
            ]);

            // Debit Kas (Total Angsuran)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $cashGlId, 'debit' => $schedule->total_amount, 'credit' => 0, 'description' => 'Kas Masuk Angsuran']);
            // Debit Margin Murabahah Ditangguhkan (Porsi Margin)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $deferredMarginMapping->gl_account_id, 'debit' => $schedule->margin_amount, 'credit' => 0, 'description' => 'Margin Ditangguhkan Direalisasi']);

            // Credit Piutang Pembiayaan (Total Angsuran)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $principalMapping->gl_account_id, 'debit' => 0, 'credit' => $schedule->total_amount, 'description' => 'Piutang Pembiayaan Berkurang']);
            // Credit Pendapatan Margin Murabahah (Porsi Margin)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $marginMapping->gl_account_id, 'debit' => 0, 'credit' => $schedule->margin_amount, 'description' => 'Pendapatan Margin Diakui']);

            // Record Payment
            $payment = FinancingPayment::create([
                'financing_id' => $financing->id,
                'payment_date' => now(),
                'amount_paid' => $schedule->total_amount,
                'principal_paid' => $schedule->principal_amount,
                'margin_paid' => $schedule->margin_amount,
                'penalty_paid' => 0,
                'journal_header_id' => $journalHeader->id,
                'created_by' => auth()->id(),
            ]);

            // Mark schedule as paid
            $schedule->update([
                'is_paid' => true,
                'paid_date' => now(),
            ]);

            // Check if all schedules are paid -> set financing to PAID_OFF
            $unpaidCount = FinancingSchedule::where('financing_id', $financing->id)
                ->where('is_paid', false)->count();
            if ($unpaidCount === 0) {
                $financing->update(['status' => 'PAID_OFF']);
            }

            DB::commit();
            return redirect()->back()->with('success', 'Pembayaran angsuran ke-' . $schedule->installment_number . ' berhasil.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Gagal memproses pembayaran: ' . $e->getMessage()]);
        }
    }

    /**
     * Pelunasan dipercepat (Early Payoff) dengan Muqasah (diskon margin).
     */
    public function earlyPayoff(Request $request)
    {
        $validated = $request->validate([
            'financing_id' => 'required|exists:financings,id',
            'muqasah_amount' => 'nullable|numeric|min:0',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $branchId = auth()->user()->branch_id;
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];
        $cashGlId = $settings['cash_gl_account_id'] ?? null;

        if (!$cashGlId) {
            return redirect()->back()->withErrors(['message' => 'Akun Kas Utama belum diatur di Pengaturan Tenant.']);
        }

        $financing = Financing::where('id', $validated['financing_id'])
            ->where('tenant_id', $tenantId)
            ->where('status', 'ACTIVE')
            ->firstOrFail();

        $principalMapping = ProductGlMapping::where('product_id', $financing->product_id)
            ->where('transaction_trigger', 'INSTALLMENT_PRINCIPAL')->first();
        $marginMapping = ProductGlMapping::where('product_id', $financing->product_id)
            ->where('transaction_trigger', 'INSTALLMENT_MARGIN')->first();
        $deferredMarginMapping = ProductGlMapping::where('product_id', $financing->product_id)
            ->where('transaction_trigger', 'DEFERRED_MARGIN')->first();

        if (!$principalMapping || !$marginMapping || !$deferredMarginMapping) {
            return redirect()->back()->withErrors(['message' => 'Pemetaan GL belum diatur.']);
        }

        // Calculate remaining
        $unpaidSchedules = FinancingSchedule::where('financing_id', $financing->id)
            ->where('is_paid', false)->get();

        $remainingPrincipal = $unpaidSchedules->sum('principal_amount');
        $remainingMargin = $unpaidSchedules->sum('margin_amount');
        $muqasah = min($validated['muqasah_amount'] ?? 0, $remainingMargin); // Can't discount more than remaining margin
        $totalToPay = $remainingPrincipal + $remainingMargin - $muqasah;

        DB::beginTransaction();
        try {
            $journalHeader = JournalHeader::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'journal_number' => 'JRN-PAYOFF-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(),
                'reference' => 'PAYOFF-' . $financing->financing_number,
                'description' => 'Pelunasan Dipercepat No: ' . $financing->financing_number . ($muqasah > 0 ? ' (Muqasah: Rp' . number_format($muqasah, 0) . ')' : ''),
            ]);

            // Debit Kas (Total yang dibayar nasabah)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $cashGlId, 'debit' => $totalToPay, 'credit' => 0, 'description' => 'Kas Masuk Pelunasan']);
            // Debit Margin Murabahah Ditangguhkan (Total Margin yang tersisa)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $deferredMarginMapping->gl_account_id, 'debit' => $remainingMargin, 'credit' => 0, 'description' => 'Margin Ditangguhkan Dieliminasi']);

            // Credit Piutang Murabahah (Total Piutang tersisa)
            JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $principalMapping->gl_account_id, 'debit' => 0, 'credit' => $remainingPrincipal + $remainingMargin, 'description' => 'Piutang Pembiayaan Lunas']);
            
            // Credit Pendapatan Margin (Net Margin yang diakui setelah dikurangi Muqasah)
            $netMargin = $remainingMargin - $muqasah;
            if ($netMargin > 0) {
                JournalLine::create(['tenant_id' => $tenantId, 'journal_header_id' => $journalHeader->id, 'gl_account_id' => $marginMapping->gl_account_id, 'debit' => 0, 'credit' => $netMargin, 'description' => 'Pendapatan Margin Diakui (Nett)']);
            }

            // Record Payment
            $payment = FinancingPayment::create([
                'financing_id' => $financing->id,
                'payment_date' => now(),
                'amount_paid' => $totalToPay,
                'principal_paid' => $remainingPrincipal,
                'margin_paid' => $netMargin,
                'penalty_paid' => 0,
                'journal_header_id' => $journalHeader->id,
                'created_by' => auth()->id(),
            ]);

            // Mark all remaining schedules as paid
            FinancingSchedule::where('financing_id', $financing->id)
                ->where('is_paid', false)
                ->update(['is_paid' => true, 'paid_date' => now()]);

            $financing->update(['status' => 'PAID_OFF']);

            DB::commit();
            return redirect()->back()->with('success', 'Pelunasan dipercepat berhasil! Status pembiayaan: LUNAS.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Gagal memproses pelunasan: ' . $e->getMessage()]);
        }
    }

    /**
     * Cetak Struk/Bukti Pembayaran PDF
     */
    public function printReceipt(FinancingPayment $payment)
    {
        $payment->load(['financing.customer', 'financing.product', 'financing.schedules']);

        if ($payment->financing->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];

        $remainingPrincipal = FinancingSchedule::where('financing_id', $payment->financing_id)
            ->where('is_paid', false)->sum('principal_amount');

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.bukti-pembayaran', [
            'payment' => $payment,
            'type' => $payment->financing->status === 'PAID_OFF' ? 'PAYOFF' : 'INSTALLMENT',
            'remaining_principal' => $remainingPrincipal,
            'financing_status' => $payment->financing->status,
            'muqasah' => 0,
            'tenant_name' => $tenant->name,
            'tenant_address' => $settings['company_address'] ?? '',
            'kop_surat_url' => $settings['kop_surat_url'] ?? null,
            'teller_name' => auth()->user()->name,
        ]);

        return $pdf->download('Bukti-' . $payment->financing->financing_number . '-' . $payment->id . '.pdf');
    }
}
