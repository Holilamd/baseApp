<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financing_restructures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id');
            $table->foreignId('branch_id');
            $table->foreignId('financing_id')->constrained()->cascadeOnDelete();
            
            $table->decimal('old_amount', 15, 2);
            $table->decimal('new_amount', 15, 2);
            
            $table->integer('old_duration_months');
            $table->integer('new_duration_months');
            
            $table->decimal('old_margin_rate', 5, 2);
            $table->decimal('new_margin_rate', 5, 2);
            
            $table->decimal('old_total_margin', 15, 2);
            $table->decimal('new_total_margin', 15, 2);
            
            $table->text('reason')->nullable();
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            
            $table->foreignId('created_by');
            $table->foreignId('approved_by')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('financing_restructures');
    }
};
