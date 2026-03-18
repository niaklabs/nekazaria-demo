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
        Schema::create('campaign_animals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sanitary_campaign_id')->constrained()->cascadeOnDelete();
            $table->foreignId('animal_id')->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->string('immobilization_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('campaign_animals');
    }
};
