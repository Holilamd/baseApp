<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $permissions = [];
        $menus = [];

        if ($user) {
            $roles = $user->roles()->with('permissions', 'menus')->get();
            $permissions = $roles->flatMap->permissions->pluck('slug')->unique()->values()->all();
            
            // Fetch top-level menus authorized for user's roles with their submenus
            $menus = \App\Models\Menu::whereNull('parent_id')
                ->where(function ($query) use ($roles) {
                    $query->whereHas('roles', function ($q) use ($roles) {
                        $q->whereIn('roles.id', $roles->pluck('id'));
                    })
                    ->orWhereHas('children.roles', function ($q) use ($roles) {
                        $q->whereIn('roles.id', $roles->pluck('id'));
                    });
                })
                ->with(['children' => function($query) use ($roles) {
                    $query->whereHas('roles', function($q) use ($roles) {
                        $q->whereIn('roles.id', $roles->pluck('id'));
                    })->orderBy('order', 'asc');
                }])
                ->orderBy('order', 'asc')
                ->get();
        }

        $tenantId = session('tenant_id') ?? ($user ? $user->tenant_id : 1);
        $tenant = \App\Models\Tenant::find($tenantId);
        
        $pendingApprovals = [];
        if ($request->user()) {
            $user = $request->user();
            $query = \App\Models\Approval::where('tenant_id', $user->tenant_id)
                ->where('status', 'PENDING');
                
            if ($user->branch_id) {
                $query->where('branch_id', $user->branch_id);
            }
            
            $approvals = $query->get();
            $pendingApprovals = [
                'customer' => $approvals->where('approvable_type', \App\Models\Customer::class)->count(),
                'savings' => $approvals->where('approvable_type', \App\Models\SavingsAccount::class)->count(),
                'cash_deposit' => $approvals->filter(fn($a) => $a->approvable_type === \App\Models\SavingTransaction::class && ($a->new_data['transaction_type'] ?? '') === 'DEPOSIT')->count(),
                'cash_withdrawal' => $approvals->filter(fn($a) => $a->approvable_type === \App\Models\SavingTransaction::class && ($a->new_data['transaction_type'] ?? '') === 'WITHDRAWAL')->count(),
                'transfer' => $approvals->filter(fn($a) => $a->approvable_type === \App\Models\SavingTransaction::class && ($a->new_data['transaction_type'] ?? '') === 'TRANSFER')->count(),
                'total' => $approvals->count()
            ];
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $permissions,
                'menus' => $menus,
                'pending_approvals' => $pendingApprovals,
            ],
            'tenant' => $tenant,
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
        ];
    }
}
