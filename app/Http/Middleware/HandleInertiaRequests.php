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
            $menus = \App\Models\Menu::whereHas('roles', function($query) use ($roles) {
                $query->whereIn('roles.id', $roles->pluck('id'));
            })
            ->whereNull('parent_id')
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

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $user,
                'permissions' => $permissions,
                'menus' => $menus,
            ],
            'tenant' => $tenant,
        ];
    }
}
