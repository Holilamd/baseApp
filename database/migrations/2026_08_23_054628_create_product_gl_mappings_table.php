<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_gl_mappings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id');
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('transaction_trigger');
            $table->foreignId('gl_account_id');
            $table->enum('position', ['DEBIT', 'CREDIT']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_gl_mappings');
    }
};
