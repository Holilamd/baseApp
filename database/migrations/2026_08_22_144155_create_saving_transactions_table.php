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
        Schema::create('saving_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('savings_account_id')->constrained()->onDelete('cascade');
            $table->foreignId('journal_header_id')->nullable()->constrained()->onDelete('set null');
            $table->enum('transaction_type', ['DEPOSIT', 'WITHDRAWAL']);
            $table->decimal('amount', 19, 4);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saving_transactions');
    }
};
