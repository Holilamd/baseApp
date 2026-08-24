<?php

namespace App\Http\Controllers;

use App\Models\JournalHeader;
use Inertia\Inertia;

class JournalController extends Controller
{
    public function index()
    {
        $journals = JournalHeader::where('tenant_id', auth()->user()->tenant_id)
            ->with(['lines.glAccount', 'branch'])
            ->latest()
            ->get();

        return Inertia::render('Journals/Index', [
            'journals' => $journals
        ]);
    }

    public function create()
    {
        $tenantId = auth()->user()->tenant_id;
        $branches = \App\Models\Branch::where('tenant_id', $tenantId)->get();
        $glAccounts = \App\Models\GlAccount::where('tenant_id', $tenantId)->where('status', 'ACTIVE')->get();

        return Inertia::render('Journals/Create', [
            'branches' => $branches,
            'glAccounts' => $glAccounts
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'date' => 'required|date',
            'description' => 'required|string',
            'lines' => 'required|array|min:2',
            'lines.*.gl_account_id' => 'required|exists:gl_accounts,id',
            'lines.*.debit' => 'required|numeric|min:0',
            'lines.*.credit' => 'required|numeric|min:0',
            'lines.*.description' => 'nullable|string',
        ]);

        $totalDebit = collect($validated['lines'])->sum('debit');
        $totalCredit = collect($validated['lines'])->sum('credit');

        if (abs($totalDebit - $totalCredit) > 0.01) {
            return redirect()->back()->withErrors(['message' => 'Jurnal tidak balance. Total Debit: ' . $totalDebit . ', Total Credit: ' . $totalCredit]);
        }

        $tenantId = auth()->user()->tenant_id;

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $journalHeader = JournalHeader::create([
                'tenant_id' => $tenantId,
                'branch_id' => $validated['branch_id'],
                'journal_number' => 'JRN-MNL-' . date('Ymd') . '-' . rand(1000, 9999),
                'date' => $validated['date'],
                'description' => $validated['description'],
                'reference' => 'MANUAL-' . time()
            ]);

            foreach ($validated['lines'] as $line) {
                \App\Models\JournalLine::create([
                    'tenant_id' => $tenantId,
                    'journal_header_id' => $journalHeader->id,
                    'gl_account_id' => $line['gl_account_id'],
                    'debit' => $line['debit'],
                    'credit' => $line['credit'],
                    'description' => $line['description'] ?? $validated['description']
                ]);
            }

            \Illuminate\Support\Facades\DB::commit();
            return redirect()->route('journals.index')->with('success', 'Jurnal Manual berhasil disimpan.');
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Gagal menyimpan jurnal: ' . $e->getMessage()]);
        }
    }
}
