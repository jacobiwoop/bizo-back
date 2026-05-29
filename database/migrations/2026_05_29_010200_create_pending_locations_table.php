<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pending_locations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('name', 160);
            $table->string('normalized_name', 180);
            $table->foreignUuid('parent_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('country_code', 5);
            $table->decimal('suggested_lat', 10, 8)->nullable();
            $table->decimal('suggested_lng', 11, 8)->nullable();
            $table->enum('source', ['osm', 'mapbox', 'user', 'admin', 'import'])->default('user');
            $table->unsignedInteger('usage_count')->default(1);
            $table->enum('status', ['pending', 'approved', 'rejected', 'merged'])->default('pending');
            $table->timestamps();

            $table->unique(['country_code', 'parent_id', 'normalized_name'], 'pending_locations_unique');
            $table->index(['country_code', 'status']);
            $table->index(['parent_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pending_locations');
    }
};
