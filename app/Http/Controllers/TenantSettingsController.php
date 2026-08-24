<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Tenant;

class TenantSettingsController extends Controller
{
    public function edit()
    {
        $tenant = Tenant::find(auth()->user()->tenant_id);
        $gl_accounts = \App\Models\GlAccount::where('tenant_id', auth()->user()->tenant_id)->get();

        return Inertia::render('Tenant/Settings', [
            'tenant' => $tenant,
            'gl_accounts' => $gl_accounts
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'settings.company_address' => 'nullable|string',
            'settings.manager_name' => 'nullable|string|max:255',
            'settings.logo_url' => 'nullable|string',
            
            // Approval settings
            'settings.approval_cif_create' => 'nullable|boolean',
            'settings.approval_cif_update' => 'nullable|boolean',
            'settings.approval_open_account' => 'nullable|boolean',
            'settings.approval_deposit' => 'nullable|boolean',
            'settings.limit_deposit' => 'nullable|numeric|min:0',
            'settings.approval_withdrawal' => 'nullable|boolean',
            'settings.limit_withdrawal' => 'nullable|numeric|min:0',
            
            // Core Banking Settings
            'settings.cash_gl_account_id' => 'nullable|exists:gl_accounts,id',
            'settings.rak_gl_account_id' => 'nullable|exists:gl_accounts,id',
            'settings.principal_saving_gl_account_id' => 'nullable|exists:gl_accounts,id',
            'settings.mandatory_saving_gl_account_id' => 'nullable|exists:gl_accounts,id',
            'settings.kop_surat_url' => 'nullable|string',
        ]);

        $tenant = Tenant::find(auth()->user()->tenant_id);
        
        $currentSettings = $tenant->settings ?? [];
        $newSettings = array_merge($currentSettings, $validated['settings'] ?? []);

        $tenant->update([
            'name' => $validated['name'],
            'settings' => $newSettings
        ]);

        return redirect()->back()->with('success', 'Pengaturan koperasi berhasil diperbarui.');
    }
}
