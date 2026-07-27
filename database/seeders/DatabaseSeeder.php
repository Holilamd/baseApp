<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Menu;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Tenant
        $tenant = Tenant::create([
            'id' => 1,
            'name' => 'MainApp',
            'domain' => 'localhost',
            'status' => 'active',
        ]);

        // Disable global scope for tenant-scoped operations in seeder if needed,
        // but since we session/auth mock is not set, BelongsToTenant defaults to 1.

        // 2. Create Menus
        $menus = [
            ['name' => 'Dashboard', 'url' => '/dashboard', 'icon' => 'LayoutDashboard', 'order' => 1],
            ['name' => 'User Management', 'url' => '/users', 'icon' => 'Users', 'order' => 2],
            ['name' => 'Role Management', 'url' => '/roles', 'icon' => 'Shield', 'order' => 3],
            ['name' => 'Menu Management', 'url' => '/menus', 'icon' => 'Menu', 'order' => 4],
            ['name' => 'Tenant Settings', 'url' => '/tenant/settings', 'icon' => 'Settings', 'order' => 5],
            ['name' => 'Chat Room', 'url' => '/chat', 'icon' => 'MessageSquare', 'order' => 6],
            ['name' => 'Reports', 'url' => '/reports', 'icon' => 'FileText', 'order' => 7],
        ];

        $menuModels = [];
        foreach ($menus as $m) {
            $menuModels[] = Menu::create($m);
        }

        $getMenuId = function($name) use ($menuModels) {
            foreach ($menuModels as $m) {
                if ($m->name === $name) {
                    return $m->id;
                }
            }
            return null;
        };

        // 3. Create Permissions
        $permissions = [
            ['name' => 'View Users', 'slug' => 'users.view', 'menu_id' => $getMenuId('User Management')],
            ['name' => 'Create Users', 'slug' => 'users.create', 'menu_id' => $getMenuId('User Management')],
            ['name' => 'Edit Users', 'slug' => 'users.edit', 'menu_id' => $getMenuId('User Management')],
            ['name' => 'Delete Users', 'slug' => 'users.delete', 'menu_id' => $getMenuId('User Management')],
            
            ['name' => 'View Roles', 'slug' => 'roles.view', 'menu_id' => $getMenuId('Role Management')],
            ['name' => 'Create Roles', 'slug' => 'roles.create', 'menu_id' => $getMenuId('Role Management')],
            ['name' => 'Edit Roles', 'slug' => 'roles.edit', 'menu_id' => $getMenuId('Role Management')],
            ['name' => 'Delete Roles', 'slug' => 'roles.delete', 'menu_id' => $getMenuId('Role Management')],

            ['name' => 'View Menus', 'slug' => 'menus.view', 'menu_id' => $getMenuId('Menu Management')],
            ['name' => 'Create Menus', 'slug' => 'menus.create', 'menu_id' => $getMenuId('Menu Management')],
            ['name' => 'Edit Menus', 'slug' => 'menus.edit', 'menu_id' => $getMenuId('Menu Management')],
            ['name' => 'Delete Menus', 'slug' => 'menus.delete', 'menu_id' => $getMenuId('Menu Management')],

            ['name' => 'Manage Tenant Settings', 'slug' => 'tenant.settings', 'menu_id' => $getMenuId('Tenant Settings')],
        ];

        $permissionModels = [];
        foreach ($permissions as $p) {
            $permissionModels[] = Permission::create($p);
        }

        // 4. Create Admin Role for Default Tenant
        $adminRole = Role::create([
            'tenant_id' => $tenant->id,
            'name' => 'Super Admin',
        ]);

        // 5. Assign all permissions to Admin Role
        foreach ($permissionModels as $pm) {
            $adminRole->permissions()->attach($pm->id);
        }

        // 6. Assign all menus to Admin Role
        foreach ($menuModels as $mm) {
            $adminRole->menus()->attach($mm->id);
        }

        // 7. Create Admin User
        $adminUser = User::create([
            'tenant_id' => $tenant->id,
            'name' => 'Administrator',
            'email' => 'admin@hadiri.com',
            'password' => Hash::make('password'),
        ]);

        // 8. Assign Admin Role to Admin User
        $adminUser->roles()->attach($adminRole->id);

        // 9. Generate 50 test roles
        for ($i = 1; $i <= 50; $i++) {
            $testRole = Role::create([
                'tenant_id' => $tenant->id,
                'name' => 'Role Test ' . sprintf('%02d', $i),
            ]);
            // Attach a random permission
            $randomPerm = $permissionModels[array_rand($permissionModels)];
            $testRole->permissions()->attach($randomPerm->id);
        }

        // 10. Generate 100 test users
        for ($i = 1; $i <= 100; $i++) {
            $testUser = User::create([
                'tenant_id' => $tenant->id,
                'name' => 'User Test ' . sprintf('%03d', $i),
                'email' => 'user.test' . sprintf('%03d', $i) . '@hadiri.com',
                'password' => Hash::make('password'),
            ]);
            // Attach Super Admin role to some, or a random test role
            $testUser->roles()->attach($adminRole->id);
        }
    }
}
