<?php

namespace App\Http\Controllers;

use App\Models\SavingsAccount;
use App\Models\Branch;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SavingsAccountController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        
        $savings = SavingsAccount::where('tenant_id', $user->tenant_id)
            ->with(['branch', 'customer', 'product'])
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
        // $customers is now fetched via AsyncSelect, so we don't load it here.
        $products = Product::where('tenant_id', $user->tenant_id)->where('type', 'FUNDING')->get();

        return Inertia::render('Savings/Index', [
            'savings' => $savings,
            'branches' => $branches,
            'customers' => [], // Fetched via AsyncSelect
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'customer_id' => 'required|exists:customers,id',
            'product_id' => 'required|exists:products,id',
            'status' => 'required|in:ACTIVE,DORMANT,BLOCKED,CLOSED',
        ]);

        $tenantId = auth()->user()->tenant_id;
        $branch = Branch::where('id', $validated['branch_id'])->where('tenant_id', $tenantId)->firstOrFail();
        $product = Product::where('id', $validated['product_id'])->where('tenant_id', $tenantId)->firstOrFail();

        // Count existing accounts in this branch for this product to generate sequence
        $count = SavingsAccount::where('tenant_id', $tenantId)
            ->where('branch_id', $branch->id)
            ->where('product_id', $product->id)
            ->count();
        $sequence = str_pad($count + 1, 5, '0', STR_PAD_LEFT);

        $validated['account_number'] = $branch->code . $product->code . $sequence;
        $validated['tenant_id'] = $tenantId;
        $validated['balance'] = 0;

        $settings = auth()->user()->tenant->settings ?? [];
        $requireApproval = $settings['approval_open_account'] ?? false;

        if ($requireApproval) {
            \App\Models\Approval::create([
                'tenant_id' => $tenantId,
                'branch_id' => $branch->id,
                'approvable_type' => \App\Models\SavingsAccount::class,
                'approvable_id' => 0, // 0 for creation since ID doesn't exist yet
                'action' => 'CREATE',
                'old_data' => null,
                'new_data' => $validated,
                'status' => 'PENDING',
                'created_by' => auth()->id(),
            ]);

            return redirect()->back()->with('success', 'Permintaan pembukaan rekening telah dikirim untuk disetujui Manajer.');
        }

        SavingsAccount::create($validated);

        return redirect()->back()->with('success', 'Rekening tabungan berhasil dibuka.');
    }

    public function update(Request $request, SavingsAccount $saving)
    {
        if ($saving->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'customer_id' => 'required|exists:customers,id',
            'product_id' => 'required|exists:products,id',
            'status' => 'required|in:ACTIVE,DORMANT,BLOCKED,CLOSED',
        ]);

        $saving->update($validated);

        return redirect()->back()->with('success', 'Data rekening tabungan berhasil diperbarui.');
    }

    public function destroy(SavingsAccount $saving)
    {
        if ($saving->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $saving->delete();

        return redirect()->back()->with('success', 'Rekening tabungan berhasil dihapus.');
    }
}
