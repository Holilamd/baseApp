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
        Schema::table('saving_transactions', function (Blueprint $table) {
            $table->decimal('balance_after', 19, 4)->nullable()->after('amount')->comment('Saldo setelah transaksi dibukukan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('saving_transactions', function (Blueprint $table) {
            $table->dropColumn('balance_after');
        });
    }
};
