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
        Schema::create('saving_daily_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('savings_account_id')->constrained()->onDelete('cascade');
            $table->date('date');
            $table->decimal('balance', 19, 4)->default(0);
            $table->decimal('total_debit', 19, 4)->default(0);
            $table->decimal('total_credit', 19, 4)->default(0);
            $table->timestamps();

            $table->unique(['tenant_id', 'savings_account_id', 'date'], 'saving_daily_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('saving_daily_balances');
    }
};
