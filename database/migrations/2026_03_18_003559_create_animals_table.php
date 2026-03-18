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
        Schema::create('animals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sub_exploitation_id')->constrained()->cascadeOnDelete();
            $table->string('crotal_code')->unique();
            $table->string('species');
            $table->string('breed');
            $table->string('sex');
            $table->string('name')->nullable();
            $table->date('birth_date');
            $table->foreignId('mother_id')->nullable()->constrained('animals')->nullOnDelete();
            $table->foreignId('father_id')->nullable()->constrained('animals')->nullOnDelete();
            $table->string('status')->default('active');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('animals');
    }
};
