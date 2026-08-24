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
        Schema::create('gl_accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('gl_accounts')->onDelete('cascade');
            $table->string('account_number');
            $table->string('name');
            $table->enum('normal_balance', ['DEBIT', 'CREDIT']);
            $table->timestamps();
            
            $table->unique(['tenant_id', 'account_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gl_accounts');
    }
};
