<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_templates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id');
            $table->foreignId('product_id')->nullable()->constrained()->nullOnDelete();
            $table->string('type'); 
            $table->longText('content');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_templates');
    }
};
