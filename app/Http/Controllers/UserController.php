<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;

class UserController extends Controller implements HasMiddleware
{
    /**
     * Get the middleware that should be assigned to the controller.
     */
    public static function middleware(): array
    {
        return [
            new Middleware('permission:users.view', only: ['index']),
            new Middleware('permission:users.create', only: ['store']),
            new Middleware('permission:users.edit', only: ['update']),
            new Middleware('permission:users.delete', only: ['destroy']),
        ];
    }
    public function index(Request $request): Response
    {
        $search = $request->input('search', '');
        $sortBy = $request->input('sort_by', 'id');
        $sortDir = $request->input('sort_dir', 'desc');

        $user = auth()->user();

        $users = User::query()
            ->with('roles')
            ->when($user->branch_id, function ($query) use ($user) {
                $query->where('branch_id', $user->branch_id);
            })
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->orderBy($sortBy, $sortDir)
            ->paginate(10)
            ->withQueryString();

        // Get all roles available for role assignment in this tenant
        $roles = Role::orderBy('name')->get();
        $branches = \App\Models\Branch::where('tenant_id', $user->tenant_id)->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'roles' => $roles,
            'branches' => $branches,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255', 
                // Unique email validation, scoped to the current tenant if users are tenant-isolated
                Rule::unique('users')->where('tenant_id', session('tenant_id', 1))
            ],
            'password' => ['required', 'string', 'min:8'],
            'roles' => ['required', 'array'],
            'roles.*' => ['exists:roles,id'],
            'branch_id' => ['nullable', 'exists:branches,id']
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'branch_id' => auth()->user()->branch_id ?? $validated['branch_id'] ?? null,
            'tenant_id' => auth()->user()->tenant_id,
        ]);

        $user->roles()->sync($validated['roles']);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 
                'string', 
                'email', 
                'max:255', 
                Rule::unique('users')->ignore($user->id)->where('tenant_id', session('tenant_id', 1))
            ],
            'password' => ['nullable', 'string', 'min:8'],
            'roles' => ['required', 'array'],
            'roles.*' => ['exists:roles,id'],
            'branch_id' => ['nullable', 'exists:branches,id']
        ]);

        $updateData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        // Only super admin can change branch_id
        if (!auth()->user()->branch_id && array_key_exists('branch_id', $validated)) {
            $updateData['branch_id'] = $validated['branch_id'];
        }

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);
        $user->roles()->sync($validated['roles']);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if (auth()->id() === $user->id) {
            return redirect()->back()->withErrors(['error' => 'You cannot delete your own user account.']);
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }
}
