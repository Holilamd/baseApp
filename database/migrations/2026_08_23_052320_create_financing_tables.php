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
        Schema::create('financings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            
            $table->string('financing_number')->unique();
            $table->decimal('amount', 15, 2)->comment('Plafon Pinjaman');
            $table->integer('duration_months')->comment('Tenor dalam bulan');
            $table->decimal('margin_rate', 5, 2)->comment('% Margin / Bagi Hasil per tahun');
            $table->decimal('total_margin', 15, 2)->comment('Total margin selama tenor');
            $table->decimal('total_payment', 15, 2)->comment('Pokok + Total Margin');
            
            $table->enum('status', ['PENDING', 'APPROVED', 'ACTIVE', 'PAID_OFF', 'REJECTED'])->default('PENDING');
            $table->timestamp('disbursed_at')->nullable();
            
            $table->text('notes')->nullable();
            
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });

        Schema::create('financing_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('financing_id')->constrained()->onDelete('cascade');
            
            $table->integer('installment_number');
            $table->date('due_date');
            
            $table->decimal('principal_amount', 15, 2)->comment('Porsi Pokok');
            $table->decimal('margin_amount', 15, 2)->comment('Porsi Margin');
            $table->decimal('total_amount', 15, 2)->comment('Total cicilan bulan ini');
            
            $table->boolean('is_paid')->default(false);
            $table->timestamp('paid_date')->nullable();
            
            $table->timestamps();
        });

        Schema::create('financing_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('financing_id')->constrained()->onDelete('cascade');
            
            $table->decimal('amount_paid', 15, 2);
            $table->decimal('principal_paid', 15, 2);
            $table->decimal('margin_paid', 15, 2);
            $table->decimal('penalty_paid', 15, 2)->default(0);
            
            $table->timestamp('payment_date');
            
            $table->foreignId('journal_header_id')->nullable()->constrained('journal_headers')->onDelete('set null');
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financing_payments');
        Schema::dropIfExists('financing_schedules');
        Schema::dropIfExists('financings');
    }
};
