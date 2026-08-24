<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class RoleController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('permission:roles.view', only: ['index']),
            new Middleware('permission:roles.create', only: ['store']),
            new Middleware('permission:roles.edit', only: ['update']),
            new Middleware('permission:roles.delete', only: ['destroy']),
        ];
    }
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        $roles = Role::with(['permissions', 'menus'])
            ->orderBy('name')
            ->get();

        $permissions = Permission::orderBy('slug')->get();
        $menus = \App\Models\Menu::orderBy('order')->get();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'menus' => $menus,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,id'],
            'menus' => ['nullable', 'array'],
            'menus.*' => ['exists:menus,id'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
        ]);

        $role->permissions()->sync($validated['permissions'] ?? []);
        $role->menus()->sync($validated['menus'] ?? []);

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Role $role): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,id'],
            'menus' => ['nullable', 'array'],
            'menus.*' => ['exists:menus,id'],
        ]);

        $role->update([
            'name' => $validated['name'],
        ]);

        $role->permissions()->sync($validated['permissions'] ?? []);
        $role->menus()->sync($validated['menus'] ?? []);

        return redirect()->back()->with('success', 'Role updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Role $role): RedirectResponse
    {
        // Prevent deleting default administrative roles if needed, or allow it
        if ($role->name === 'Super Admin') {
            return redirect()->back()->withErrors(['error' => 'You cannot delete the Super Admin role.']);
        }

        $role->delete();
        return redirect()->back()->with('success', 'Role deleted successfully.');
    }
}
