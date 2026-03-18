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
        Schema::create('sanitary_campaigns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exploitation_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('status')->default('in_progress');
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('total_animals');
            $table->integer('sampled_animals')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sanitary_campaigns');
    }
};
