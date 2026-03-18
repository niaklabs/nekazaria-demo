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
        Schema::create('birth_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sub_exploitation_id')->constrained()->cascadeOnDelete();
            $table->foreignId('mother_id')->constrained('animals')->cascadeOnDelete();
            $table->foreignId('father_id')->nullable()->constrained('animals')->nullOnDelete();
            $table->string('birth_type');
            $table->integer('calf_count');
            $table->string('status')->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->string('reference_code')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('birth_registrations');
    }
};
