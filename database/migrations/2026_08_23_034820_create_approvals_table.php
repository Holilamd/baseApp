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
        Schema::create('approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->onDelete('cascade');
            $table->foreignId('branch_id')->nullable()->constrained()->onDelete('cascade');
            $table->morphs('approvable'); // Type and ID (e.g. App\Models\Customer, id 1)
            $table->string('action'); // CREATE, UPDATE, DELETE
            $table->json('old_data')->nullable(); // Original state
            $table->json('new_data'); // Proposed state
            $table->enum('status', ['PENDING', 'APPROVED', 'REJECTED'])->default('PENDING');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete(); // Maker
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete(); // Checker
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('approvals');
    }
};
