<?php

namespace App\Http\Controllers;

use App\Models\Menu;
use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class MenuController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('permission:menus.view', only: ['index']),
            new Middleware('permission:menus.create', only: ['store']),
            new Middleware('permission:menus.edit', only: ['update']),
            new Middleware('permission:menus.delete', only: ['destroy']),
        ];
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $menus = Menu::with(['parent', 'permissions'])
            ->orderBy('order', 'asc')
            ->get();

        $parentMenus = Menu::whereNull('parent_id')->orderBy('order', 'asc')->get();
        $permissions = Permission::orderBy('slug')->get();
        $roles = Role::orderBy('name')->get();

        return Inertia::render('Menus/Index', [
            'menus' => $menus,
            'parentMenus' => $parentMenus,
            'permissions' => $permissions,
            'roles' => $roles,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:menus,id'],
            'order' => ['required', 'integer', 'min:0'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $menu = Menu::create([
            'name' => $validated['name'],
            'url' => $validated['url'],
            'icon' => $validated['icon'],
            'parent_id' => $validated['parent_id'],
            'order' => $validated['order'],
        ]);

        if (!empty($validated['permissions'])) {
            Permission::whereIn('id', $validated['permissions'])->update(['menu_id' => $menu->id]);
        }

        return redirect()->back()->with('success', 'Menu created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Menu $menu): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'url' => ['nullable', 'string', 'max:255'],
            'icon' => ['nullable', 'string', 'max:255'],
            'parent_id' => ['nullable', 'exists:menus,id'],
            'order' => ['required', 'integer', 'min:0'],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $menu->update([
            'name' => $validated['name'],
            'url' => $validated['url'],
            'icon' => $validated['icon'],
            'parent_id' => $validated['parent_id'],
            'order' => $validated['order'],
        ]);

        // Reset old associations
        Permission::where('menu_id', $menu->id)->update(['menu_id' => null]);

        // Sync new associations
        if (!empty($validated['permissions'])) {
            Permission::whereIn('id', $validated['permissions'])->update(['menu_id' => $menu->id]);
        }

        return redirect()->back()->with('success', 'Menu updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Menu $menu): RedirectResponse
    {
        $menu->delete();
        return redirect()->back()->with('success', 'Menu deleted successfully.');
    }
}
