<?php

namespace Database\Seeders;

use App\Models\Tenant;
use App\Models\Permission;
use App\Models\Role;
use App\Models\Menu;
use App\Models\User;
use App\Models\Branch;
use App\Models\GlAccount;
use App\Models\Product;
use App\Models\Customer;
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
            'name' => 'BMT-CORE-SAAS',
            'domain' => 'localhost',
            'status' => 'active',
            'settings' => [
                'withdrawal_limit_teller' => 50000000,
                'require_approval' => true
            ]
        ]);

        // Disable global scope for tenant-scoped operations in seeder if needed,
        // but since we session/auth mock is not set, BelongsToTenant defaults to 1.

        // 2. Create Menus
        $menus = [
            ['name' => 'Dashboard', 'url' => '/dashboard', 'icon' => 'LayoutDashboard', 'order' => 1],
            
            // Front Office Group
            ['name' => 'Front Office', 'url' => null, 'icon' => 'Store', 'order' => 2, 'children' => [
                ['name' => 'Savings', 'url' => '/savings', 'icon' => 'Wallet', 'order' => 1],
                ['name' => 'Saving Transactions', 'url' => '/saving-transactions', 'icon' => 'ArrowRightLeft', 'order' => 2],
            ]],

            // Back Office Group
            ['name' => 'Back Office', 'url' => null, 'icon' => 'Briefcase', 'order' => 3, 'children' => [
                ['name' => 'Journals', 'url' => '/journals', 'icon' => 'BookMarked', 'order' => 1],
                ['name' => 'Approvals', 'url' => '/approvals', 'icon' => 'CheckCircle', 'order' => 2],
            ]],

            // Master Data Group
            ['name' => 'Master Data', 'url' => null, 'icon' => 'Database', 'order' => 4, 'children' => [
                ['name' => 'Branch Management', 'url' => '/branches', 'icon' => 'Building', 'order' => 1],
                ['name' => 'GL Accounts', 'url' => '/gl-accounts', 'icon' => 'BookOpen', 'order' => 2],
                ['name' => 'Products', 'url' => '/products', 'icon' => 'Package', 'order' => 3],
                ['name' => 'Customers', 'url' => '/customers', 'icon' => 'Users2', 'order' => 4],
            ]],

            // Settings Group
            ['name' => 'Settings', 'url' => null, 'icon' => 'Settings', 'order' => 5, 'children' => [
                ['name' => 'User Management', 'url' => '/users', 'icon' => 'Users', 'order' => 1],
                ['name' => 'Role Management', 'url' => '/roles', 'icon' => 'Shield', 'order' => 2],
                ['name' => 'Menu Management', 'url' => '/menus', 'icon' => 'Menu', 'order' => 3],
                ['name' => 'Tenant Settings', 'url' => '/tenant/settings', 'icon' => 'Settings2', 'order' => 4],
            ]],

            // Others
            ['name' => 'Chat Room', 'url' => '/chat', 'icon' => 'MessageSquare', 'order' => 6],
            ['name' => 'Reports', 'url' => '/reports', 'icon' => 'FileText', 'order' => 7],
        ];

        $menuModels = [];
        foreach ($menus as $m) {
            $children = $m['children'] ?? [];
            unset($m['children']);
            $parentMenu = Menu::create($m);
            $menuModels[] = $parentMenu;

            foreach ($children as $child) {
                $child['parent_id'] = $parentMenu->id;
                $childMenu = Menu::create($child);
                $menuModels[] = $childMenu;
            }
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
            // Dashboard
            ['name' => 'View Dashboard', 'slug' => 'dashboard.view', 'menu_id' => $getMenuId('Dashboard')],

            // Settings Group
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
            
            // Master Data Group
            ['name' => 'View Branches', 'slug' => 'branches.view', 'menu_id' => $getMenuId('Branch Management')],
            ['name' => 'Create Branches', 'slug' => 'branches.create', 'menu_id' => $getMenuId('Branch Management')],
            ['name' => 'Edit Branches', 'slug' => 'branches.edit', 'menu_id' => $getMenuId('Branch Management')],
            ['name' => 'Delete Branches', 'slug' => 'branches.delete', 'menu_id' => $getMenuId('Branch Management')],

            ['name' => 'View GL Accounts', 'slug' => 'gl-accounts.view', 'menu_id' => $getMenuId('GL Accounts')],
            ['name' => 'Create GL Accounts', 'slug' => 'gl-accounts.create', 'menu_id' => $getMenuId('GL Accounts')],
            ['name' => 'Edit GL Accounts', 'slug' => 'gl-accounts.edit', 'menu_id' => $getMenuId('GL Accounts')],
            ['name' => 'Delete GL Accounts', 'slug' => 'gl-accounts.delete', 'menu_id' => $getMenuId('GL Accounts')],

            ['name' => 'View Products', 'slug' => 'products.view', 'menu_id' => $getMenuId('Products')],
            ['name' => 'Create Products', 'slug' => 'products.create', 'menu_id' => $getMenuId('Products')],
            ['name' => 'Edit Products', 'slug' => 'products.edit', 'menu_id' => $getMenuId('Products')],
            ['name' => 'Delete Products', 'slug' => 'products.delete', 'menu_id' => $getMenuId('Products')],

            ['name' => 'View Customers', 'slug' => 'customers.view', 'menu_id' => $getMenuId('Customers')],
            ['name' => 'Create Customers', 'slug' => 'customers.create', 'menu_id' => $getMenuId('Customers')],
            ['name' => 'Edit Customers', 'slug' => 'customers.edit', 'menu_id' => $getMenuId('Customers')],
            ['name' => 'Delete Customers', 'slug' => 'customers.delete', 'menu_id' => $getMenuId('Customers')],

            // Front Office Group
            ['name' => 'View Savings', 'slug' => 'savings.view', 'menu_id' => $getMenuId('Savings')],
            ['name' => 'Create Savings', 'slug' => 'savings.create', 'menu_id' => $getMenuId('Savings')],
            ['name' => 'Edit Savings', 'slug' => 'savings.edit', 'menu_id' => $getMenuId('Savings')],
            ['name' => 'Delete Savings', 'slug' => 'savings.delete', 'menu_id' => $getMenuId('Savings')],

            ['name' => 'View Saving Transactions', 'slug' => 'saving-transactions.view', 'menu_id' => $getMenuId('Saving Transactions')],
            ['name' => 'Create Saving Transactions', 'slug' => 'saving-transactions.create', 'menu_id' => $getMenuId('Saving Transactions')],

            // Back Office Group
            ['name' => 'View Journals', 'slug' => 'journals.view', 'menu_id' => $getMenuId('Journals')],
            ['name' => 'Create Journals', 'slug' => 'journals.create', 'menu_id' => $getMenuId('Journals')],
            
            ['name' => 'View Approvals', 'slug' => 'approvals.view', 'menu_id' => $getMenuId('Approvals')],
            ['name' => 'Process Approvals', 'slug' => 'approvals.process', 'menu_id' => $getMenuId('Approvals')],

            // Others
            ['name' => 'View Chat Room', 'slug' => 'chat.view', 'menu_id' => $getMenuId('Chat Room')],
            ['name' => 'View Reports', 'slug' => 'reports.view', 'menu_id' => $getMenuId('Reports')],
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
            'email' => 'admin@bmt.com',
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
        for ($i = 1; $i <= 5; $i++) {
            $testUser = User::create([
                'tenant_id' => $tenant->id,
                'name' => 'User Test ' . sprintf('%03d', $i),
                'email' => 'user.test' . sprintf('%03d', $i) . '@hadiri.com',
                'password' => Hash::make('password'),
            ]);
            // Attach Super Admin role to some, or a random test role
            $testUser->roles()->attach($adminRole->id);
        }

        // 11. Create Phase 1 & 2 Master Data
        $branch = Branch::create([
            'tenant_id' => $tenant->id,
            'code' => '001',
            'name' => 'Kantor Pusat',
            'address' => 'Jl. Jenderal Sudirman No 1',
        ]);

        $this->call(GlAccountSeeder::class);

        $product = Product::create([
            'tenant_id' => $tenant->id,
            'code' => 'SW01',
            'name' => 'Tabungan Wadiah Ya Dlamanah',
            'type' => 'FUNDING',
            'status' => 'ACTIVE'
        ]);

        $customer = Customer::create([
            'tenant_id' => $tenant->id,
            'branch_id' => $branch->id,
            'cif_number' => 'CIF00001',
            'full_name' => 'Ahmad Fulan',
            'identity_type' => 'KTP',
            'identity_number' => '3201010101010001',
            'address' => 'Jl. Kebon Jeruk No. 20',
            'phone_number' => '081234567890',
            'mother_maiden_name' => 'Siti',
            'status' => 'ACTIVE',
            'principal_saving' => 0,
            'mandatory_saving' => 0
        ]);
    }
}
