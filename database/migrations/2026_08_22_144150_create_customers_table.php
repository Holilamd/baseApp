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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->string('cif_number');
            $table->string('full_name');
            $table->string('identity_number')->nullable();
            $table->decimal('principal_saving', 19, 4)->default(0);
            $table->decimal('mandatory_saving', 19, 4)->default(0);
            $table->json('custom_fields')->nullable();
            $table->timestamps();
            
            $table->unique(['tenant_id', 'cif_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};
