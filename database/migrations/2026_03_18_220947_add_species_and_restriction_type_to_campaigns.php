<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sanitary_campaigns', function (Blueprint $table) {
            $table->string('species')->default('bovine')->after('name');
        });

        Schema::table('campaign_animals', function (Blueprint $table) {
            $table->string('restriction_type')->nullable()->after('immobilization_reason');
        });
    }

    public function down(): void
    {
        Schema::table('sanitary_campaigns', function (Blueprint $table) {
            $table->dropColumn('species');
        });

        Schema::table('campaign_animals', function (Blueprint $table) {
            $table->dropColumn('restriction_type');
        });
    }
};
