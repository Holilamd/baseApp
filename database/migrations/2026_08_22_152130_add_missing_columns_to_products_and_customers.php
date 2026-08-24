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
        Schema::table('products', function (Blueprint $table) {
            $table->string('code')->after('tenant_id')->nullable();
            $table->enum('type', ['FUNDING', 'LENDING', 'SERVICE'])->after('name')->default('FUNDING');
        });

        Schema::table('customers', function (Blueprint $table) {
            $table->enum('identity_type', ['KTP', 'SIM', 'PASPOR'])->after('full_name')->default('KTP');
            $table->string('phone_number')->after('identity_number')->nullable();
            $table->string('mother_maiden_name')->after('phone_number')->nullable();
            $table->text('address')->after('mother_maiden_name')->nullable();
            $table->enum('status', ['ACTIVE', 'BLOCKED', 'CLOSED'])->after('address')->default('ACTIVE');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products_and_customers', function (Blueprint $table) {
            //
        });
    }
};
