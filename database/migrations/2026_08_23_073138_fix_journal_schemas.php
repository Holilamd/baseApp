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
        Schema::table('journal_headers', function (Blueprint $table) {
            // Rename columns
            $table->renameColumn('transaction_no', 'journal_number');
            $table->renameColumn('transaction_date', 'date');
            
            // Add reference column
            if (!Schema::hasColumn('journal_headers', 'reference')) {
                $table->string('reference')->nullable()->after('description');
            }
            
            // Make total_amount nullable if exists
            $table->decimal('total_amount', 19, 4)->nullable()->change();
        });

        Schema::table('journal_lines', function (Blueprint $table) {
            // Add tenant_id
            if (!Schema::hasColumn('journal_lines', 'tenant_id')) {
                $table->foreignId('tenant_id')->nullable()->constrained('tenants')->onDelete('cascade')->after('id');
            }
            
            // Add description
            if (!Schema::hasColumn('journal_lines', 'description')) {
                $table->string('description')->nullable()->after('credit');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('journal_headers', function (Blueprint $table) {
            $table->renameColumn('journal_number', 'transaction_no');
            $table->renameColumn('date', 'transaction_date');
            if (Schema::hasColumn('journal_headers', 'reference')) {
                $table->dropColumn('reference');
            }
            $table->decimal('total_amount', 19, 4)->nullable(false)->change();
        });

        Schema::table('journal_lines', function (Blueprint $table) {
            if (Schema::hasColumn('journal_lines', 'tenant_id')) {
                $table->dropForeign(['tenant_id']);
                $table->dropColumn('tenant_id');
            }
            if (Schema::hasColumn('journal_lines', 'description')) {
                $table->dropColumn('description');
            }
        });
    }
};
