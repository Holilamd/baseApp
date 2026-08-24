<?php

namespace App\Http\Controllers;

use App\Models\GlAccount;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GlAccountController extends Controller
{
    public function index()
    {
        $accounts = GlAccount::where('tenant_id', auth()->user()->tenant_id)
            ->with('parent')
            ->orderBy('account_number')
            ->get();
            
        return Inertia::render('GlAccounts/Index', [
            'accounts' => $accounts
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'parent_id' => 'nullable|exists:gl_accounts,id',
            'account_number' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'normal_balance' => 'required|in:DEBIT,CREDIT',
        ]);

        $validated['tenant_id'] = auth()->user()->tenant_id;

        GlAccount::create($validated);

        return redirect()->back()->with('success', 'Bagan akun berhasil ditambahkan.');
    }

    public function update(Request $request, GlAccount $glAccount)
    {
        if ($glAccount->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $validated = $request->validate([
            'parent_id' => 'nullable|exists:gl_accounts,id',
            'account_number' => 'required|string|max:50',
            'name' => 'required|string|max:255',
            'normal_balance' => 'required|in:DEBIT,CREDIT',
        ]);

        $glAccount->update($validated);

        return redirect()->back()->with('success', 'Bagan akun berhasil diperbarui.');
    }

    public function destroy(GlAccount $glAccount)
    {
        if ($glAccount->tenant_id !== auth()->user()->tenant_id) {
            abort(403);
        }

        $glAccount->delete();

        return redirect()->back()->with('success', 'Bagan akun berhasil dihapus.');
    }
}
