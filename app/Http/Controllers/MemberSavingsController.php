<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Customer;
use App\Models\JournalHeader;
use App\Models\JournalLine;
use Illuminate\Support\Facades\DB;

class MemberSavingsController extends Controller
{
    public function index()
    {
        $tenantId = auth()->user()->tenant_id;
        
        // Load customers in tenant
        $customers = Customer::where('tenant_id', $tenantId)
            ->where('status', 'ACTIVE')
            ->latest()
            ->get();

        return Inertia::render('MemberSavings/Index', [
            'customers' => $customers
        ]);
    }

    public function deposit(Request $request)
    {
        $validated = $request->validate([
            'customer_id' => 'required|exists:customers,id',
            'type' => 'required|in:PRINCIPAL,MANDATORY',
            'amount' => 'required|numeric|min:1000',
            'description' => 'nullable|string|max:255',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $tenant = auth()->user()->tenant;
        $settings = $tenant->settings ?? [];

        $cashGlId = $settings['cash_gl_account_id'] ?? null;
        $pokokGlId = $settings['principal_saving_gl_account_id'] ?? null;
        $wajibGlId = $settings['mandatory_saving_gl_account_id'] ?? null;

        if (!$cashGlId) {
            return redirect()->back()->withErrors(['message' => 'Akun Kas Utama belum dikonfigurasi di Pengaturan Koperasi.']);
        }

        $customer = Customer::where('id', $validated['customer_id'])
            ->where('tenant_id', $tenantId)
            ->firstOrFail();

        $branchId = auth()->user()->branch_id ?? $customer->branch_id;

        DB::beginTransaction();
        try {
            // Determine credit GL and description
            if ($validated['type'] === 'PRINCIPAL') {
                if (!$pokokGlId) throw new \Exception('Akun Simpanan Pokok belum dikonfigurasi di Pengaturan Koperasi.');
                $creditGlId = $pokokGlId;
                $savingTypeLabel = 'Simpanan Pokok';
                $customer->increment('principal_saving', $validated['amount']);
            } else {
                if (!$wajibGlId) throw new \Exception('Akun Simpanan Wajib belum dikonfigurasi di Pengaturan Koperasi.');
                $creditGlId = $wajibGlId;
                $savingTypeLabel = 'Simpanan Wajib';
                $customer->increment('mandatory_saving', $validated['amount']);
            }

            // Create Journal Entry
            $journal = JournalHeader::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branchId,
                'journal_number' => 'JRN-MEMBSAV-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => now(),
                'reference' => 'CIF-' . $customer->cif_number,
                'description' => 'Setoran ' . $savingTypeLabel . ' Anggota: ' . $customer->full_name . ($validated['description'] ? ' (' . $validated['description'] . ')' : ''),
            ]);

            // Debit Kas
            JournalLine::create([
                'tenant_id' => $tenantId,
                'journal_header_id' => $journal->id,
                'gl_account_id' => $cashGlId,
                'debit' => $validated['amount'],
                'credit' => 0,
                'description' => 'Kas Masuk Setoran ' . $savingTypeLabel
            ]);

            // Credit Equity Account
            JournalLine::create([
                'tenant_id' => $tenantId,
                'journal_header_id' => $journal->id,
                'gl_account_id' => $creditGlId,
                'debit' => 0,
                'credit' => $validated['amount'],
                'description' => 'Setoran ' . $savingTypeLabel . ' bertambah'
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Setoran ' . $savingTypeLabel . ' sebesar Rp' . number_format($validated['amount'], 0) . ' berhasil diproses.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Gagal memproses setoran: ' . $e->getMessage()]);
        }
    }

    public function getHistory($customerId)
    {
        $tenantId = auth()->user()->tenant_id;
        $customer = Customer::where('id', $customerId)->where('tenant_id', $tenantId)->firstOrFail();

        $history = JournalHeader::where('tenant_id', $tenantId)
            ->where('reference', 'CIF-' . $customer->cif_number)
            ->with(['lines' => function($q) {
                $q->where('credit', '>', 0);
            }, 'lines.glAccount'])
            ->latest('id')
            ->get()
            ->map(function($journal) {
                return [
                    'date' => $journal->date ? $journal->date->format('Y-m-d H:i') : '-',
                    'journal_number' => $journal->journal_number,
                    'description' => $journal->description,
                    'details' => $journal->lines->map(function($line) {
                        return [
                            'account_name' => $line->glAccount->name,
                            'amount' => (float)$line->credit
                        ];
                    })
                ];
            });

        return response()->json($history);
    }
}
