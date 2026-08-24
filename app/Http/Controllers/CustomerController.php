<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Branch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\JournalHeader;
use App\Models\JournalLine;

class CustomerController extends Controller
{
    public function index()
    {
        $user = auth()->user();

        $customers = Customer::where('tenant_id', $user->tenant_id)
            ->with('branch')
            ->when($user->branch_id, function ($q) use ($user) {
                $q->where('branch_id', $user->branch_id);
            })
            ->latest()
            ->get();
            
        $branches = Branch::where('tenant_id', $user->tenant_id)
            ->when($user->branch_id, function ($q) use ($user) {
                $q->where('id', $user->branch_id);
            })
            ->get();

        return Inertia::render('Customers/Index', [
            'customers' => $customers,
            'branches' => $branches
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'cif_number' => 'required|string|max:50|unique:customers,cif_number',
            'full_name' => 'required|string|max:255',
            'identity_type' => 'required|in:KTP,SIM,PASPOR',
            'identity_number' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->identity_type === 'KTP') {
                        if (!preg_match('/^[0-9]{16}$/', $value)) {
                            $fail('Nomor KTP harus berupa 16 digit angka.');
                        }
                    }
                },
            ],
            'address' => 'nullable|string',
            'phone_number' => 'nullable|string|max:50',
            'mother_maiden_name' => 'required|string|max:255',
            'status' => 'required|in:ACTIVE,BLOCKED,CLOSED',
            'principal_saving' => 'nullable|numeric|min:0',
            'mandatory_saving' => 'nullable|numeric|min:0',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;
        $validated['principal_saving'] = $validated['principal_saving'] ?? 0;
        $validated['mandatory_saving'] = $validated['mandatory_saving'] ?? 0;

        $settings = auth()->user()->tenant->settings ?? [];
        $requireApproval = $settings['approval_cif_create'] ?? false;

        if ($requireApproval) {
            \App\Models\Approval::create([
                'tenant_id' => $validated['tenant_id'],
                'branch_id' => $validated['branch_id'],
                'approvable_type' => \App\Models\Customer::class,
                'approvable_id' => 0,
                'action' => 'CREATE',
                'old_data' => null,
                'new_data' => $validated,
                'status' => 'PENDING',
                'created_by' => auth()->id(),
            ]);

            return redirect()->back()->with('success', 'Permintaan pendaftaran nasabah baru telah dikirim untuk disetujui Manajer.');
        }

        DB::beginTransaction();
        try {
            $customer = Customer::create($validated);

            $cashGlId = $settings['cash_gl_account_id'] ?? null;
            $pokokGlId = $settings['principal_saving_gl_account_id'] ?? null;
            $wajibGlId = $settings['mandatory_saving_gl_account_id'] ?? null;

            $totalSaving = $customer->principal_saving + $customer->mandatory_saving;

            if ($totalSaving > 0) {
                if (!$cashGlId) throw new \Exception('Akun Kas Utama belum dikonfigurasi di Pengaturan Koperasi.');
                
                // Create Journal
                $journal = JournalHeader::create([
                    'tenant_id' => $customer->tenant_id,
                    'branch_id' => $customer->branch_id,
                    'journal_number' => 'JRN-MEMB-' . date('Ymd') . '-' . rand(1000, 9999),
                    'date' => now(),
                    'reference' => 'CIF-' . $customer->cif_number,
                    'description' => 'Setoran Simpanan Pokok/Wajib Awal Anggota: ' . $customer->full_name,
                ]);

                // Debit Kas
                JournalLine::create(['tenant_id' => $customer->tenant_id, 'journal_header_id' => $journal->id, 'gl_account_id' => $cashGlId, 'debit' => $totalSaving, 'credit' => 0, 'description' => 'Kas Masuk Simpanan Anggota']);

                // Credit Simpanan Pokok
                if ($customer->principal_saving > 0) {
                    if (!$pokokGlId) throw new \Exception('Akun Simpanan Pokok belum dikonfigurasi di Pengaturan Koperasi.');
                    JournalLine::create(['tenant_id' => $customer->tenant_id, 'journal_header_id' => $journal->id, 'gl_account_id' => $pokokGlId, 'debit' => 0, 'credit' => $customer->principal_saving, 'description' => 'Simpanan Pokok Anggota']);
                }

                // Credit Simpanan Wajib
                if ($customer->mandatory_saving > 0) {
                    if (!$wajibGlId) throw new \Exception('Akun Simpanan Wajib belum dikonfigurasi di Pengaturan Koperasi.');
                    JournalLine::create(['tenant_id' => $customer->tenant_id, 'journal_header_id' => $journal->id, 'gl_account_id' => $wajibGlId, 'debit' => 0, 'credit' => $customer->mandatory_saving, 'description' => 'Simpanan Wajib Anggota']);
                }
            }

            DB::commit();
            return redirect()->back()->with('success', 'Nasabah (CIF) berhasil didaftarkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => 'Gagal mendaftarkan nasabah: ' . $e->getMessage()]);
        }
    }

    public function update(Request $request, Customer $customer)
    {
        if ($customer->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'cif_number' => 'required|string|max:50|unique:customers,cif_number,' . $customer->id,
            'full_name' => 'required|string|max:255',
            'identity_type' => 'required|in:KTP,SIM,PASPOR',
            'identity_number' => [
                'required',
                'string',
                'max:50',
                function ($attribute, $value, $fail) use ($request) {
                    if ($request->identity_type === 'KTP') {
                        if (!preg_match('/^[0-9]{16}$/', $value)) {
                            $fail('Nomor KTP harus berupa 16 digit angka.');
                        }
                    }
                },
            ],
            'address' => 'nullable|string',
            'phone_number' => 'nullable|string|max:50',
            'mother_maiden_name' => 'required|string|max:255',
            'status' => 'required|in:ACTIVE,BLOCKED,CLOSED',
        ]);

        $settings = auth()->user()->tenant->settings ?? [];
        $requireApproval = $settings['approval_cif_update'] ?? false;

        if ($requireApproval) {
            \App\Models\Approval::create([
                'tenant_id' => auth()->user()->tenant_id,
                'branch_id' => $customer->branch_id,
                'approvable_type' => get_class($customer),
                'approvable_id' => $customer->id,
                'action' => 'UPDATE',
                'old_data' => $customer->toArray(),
                'new_data' => $validated,
                'status' => 'PENDING',
                'created_by' => auth()->id(),
            ]);

            return redirect()->back()->with('success', 'Permintaan perubahan data nasabah telah dikirim untuk disetujui Manajer.');
        }

        $customer->update($validated);

        return redirect()->back()->with('success', 'Data nasabah (CIF) berhasil diperbarui.');
    }

    public function destroy(Customer $customer)
    {
        if ($customer->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $customer->delete();

        return redirect()->back()->with('success', 'Nasabah berhasil dihapus.');
    }

    public function details(Request $request, Customer $customer)
    {
        if ($customer->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $customer->load(['savingsAccounts.product', 'branch']);

        return response()->json($customer);
    }
}
