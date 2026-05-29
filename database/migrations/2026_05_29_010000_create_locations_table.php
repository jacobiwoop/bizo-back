<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('locations', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('name', 120);
            $table->string('slug', 140);
            $table->enum('type', ['country', 'city', 'district']);
            $table->foreignUuid('parent_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('country_code', 5);
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->enum('source', ['osm', 'mapbox', 'user', 'admin', 'import'])->default('admin');
            $table->string('external_id')->nullable();
            $table->decimal('confidence', 5, 2)->nullable();
            $table->boolean('is_verified')->default(false);
            $table->timestamps();

            $table->unique(['type', 'parent_id', 'country_code', 'slug'], 'locations_hierarchy_unique');
            $table->index(['country_code', 'type', 'is_verified']);
            $table->index(['parent_id', 'type']);
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('locations');
    }
};
