<?php

namespace App\Http\Controllers;

use App\Models\Financing;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\Approval;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class FinancingController extends Controller implements HasMiddleware
{
    public static function middleware(): array
    {
        return [
            new Middleware('branch_operational', only: ['store']),
        ];
    }

    public function index(Request $request)
    {
        $financings = Financing::where('tenant_id', auth()->user()->tenant_id)
            ->with(['customer', 'product'])
            ->latest()
            ->get();
            
        $products = Product::where('tenant_id', auth()->user()->tenant_id)
            ->where('type', 'LENDING')
            ->where('status', 'ACTIVE')
            ->get();

        return Inertia::render('Financings/Index', [
            'financings' => $financings,
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'product_id' => 'required|exists:products,id',
            'savings_account_id' => 'required|exists:savings_accounts,id',
            'amount' => 'required|numeric|min:100000',
            'duration_months' => 'required|integer|min:1|max:120',
            'margin_rate' => 'required|numeric|min:0|max:100',
            'notes' => 'nullable|string',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $branchId = auth()->user()->branch_id; 

        $totalMargin = $validated['amount'] * ($validated['margin_rate'] / 100) * ($validated['duration_months'] / 12);
        $totalPayment = $validated['amount'] + $totalMargin;
        
        $financingNumber = 'PFN-' . $branchId . '-' . time() . rand(100, 999);

        DB::beginTransaction();
        try {
            $financing = Financing::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'customer_id' => $validated['customer_id'],
                'product_id' => $validated['product_id'],
                'savings_account_id' => $validated['savings_account_id'],
                'financing_number' => $financingNumber,
                'amount' => $validated['amount'],
                'duration_months' => $validated['duration_months'],
                'margin_rate' => $validated['margin_rate'],
                'total_margin' => $totalMargin,
                'total_payment' => $totalPayment,
                'status' => 'PENDING',
                'notes' => $validated['notes'],
                'created_by' => auth()->id(),
            ]);

            Approval::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'approvable_type' => Financing::class,
                'approvable_id' => $financing->id,
                'action' => 'APPROVE_FINANCING_DISBURSEMENT',
                'old_data' => null,
                'new_data' => [
                    'amount' => $validated['amount'],
                    'total_margin' => $totalMargin,
                    'duration_months' => $validated['duration_months'],
                    'savings_account_id' => $validated['savings_account_id']
                ],
                'status' => 'PENDING',
                'created_by' => auth()->id(),
            ]);

            DB::commit();
            
            return redirect()->back()->with('success', 'Pengajuan pembiayaan berhasil dibuat dan menunggu Otorisasi (PENDING).');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Gagal membuat pengajuan: ' . $e->getMessage()]);
        }
    }

    public function printAkad(Financing $financing)
    {
        if ($financing->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $financing->load(['customer', 'product', 'schedules']);
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdf.akad-pembiayaan', [
            'financing' => $financing,
            'tenant_name' => $tenant->name,
            'tenant_address' => $settings['company_address'] ?? '',
            'manager_name' => $settings['manager_name'] ?? 'Pimpinan',
            'kop_surat_url' => $settings['kop_surat_url'] ?? null,
        ]);

        return $pdf->download('Akad-' . $financing->financing_number . '.pdf');
    }
}
