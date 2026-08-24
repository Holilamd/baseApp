<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Menu;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Find Simpanan parent menu
        $parent = Menu::where('name', 'Simpanan')->first();
        if ($parent) {
            $menu = Menu::create([
                'name' => 'Simpanan Anggota',
                'url' => '/member-savings',
                'icon' => 'Landmark',
                'parent_id' => $parent->id,
                'order' => 3
            ]);

            // Attach to all existing Roles
            $roles = Role::all();
            foreach ($roles as $role) {
                $role->menus()->attach($menu->id);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $menu = Menu::where('url', '/member-savings')->first();
        if ($menu) {
            $menu->roles()->detach();
            $menu->delete();
        }
    }
};
