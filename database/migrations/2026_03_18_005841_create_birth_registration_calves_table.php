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
        Schema::create('birth_registration_calves', function (Blueprint $table) {
            $table->id();
            $table->foreignId('birth_registration_id')->constrained()->cascadeOnDelete();
            $table->string('sex');
            $table->string('breed');
            $table->string('name')->nullable();
            $table->date('birth_date');
            $table->string('assigned_crotal')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('birth_registration_calves');
    }
};
