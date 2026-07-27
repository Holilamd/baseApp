<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Menus table (Dynamic navigation, global or customizable)
        Schema::create('menus', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('url')->nullable();
            $table->string('icon')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('menus')->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Permissions table (Global system-wide actions)
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->nullable()->constrained('menus')->onDelete('set null');
            $table->string('name');
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // Roles table (Scoped per tenant)
        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->default(1)->constrained()->onDelete('cascade');
            $table->string('name');
            $table->timestamps();
            
            $table->unique(['tenant_id', 'name']);
        });

        // User Has Roles mapping table
        Schema::create('user_has_roles', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->primary(['user_id', 'role_id']);
        });

        // Role Has Permissions mapping table
        Schema::create('role_has_permissions', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->foreignId('permission_id')->constrained()->onDelete('cascade');
            $table->primary(['role_id', 'permission_id']);
        });

        // Role Has Menus mapping table
        Schema::create('role_has_menus', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->onDelete('cascade');
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->primary(['role_id', 'menu_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('role_has_menus');
        Schema::dropIfExists('role_has_permissions');
        Schema::dropIfExists('user_has_roles');
        Schema::dropIfExists('menus');
        Schema::dropIfExists('roles');
        Schema::dropIfExists('permissions');
    }
};
