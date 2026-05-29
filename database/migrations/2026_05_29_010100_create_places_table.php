<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('name', 160);
            $table->string('slug', 180);
            $table->string('category', 60);
            $table->foreignUuid('location_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->string('country_code', 5);
            $table->decimal('lat', 10, 8)->nullable();
            $table->decimal('lng', 11, 8)->nullable();
            $table->enum('source', ['osm', 'mapbox', 'user', 'admin', 'import'])->default('admin');
            $table->string('external_id')->nullable();
            $table->decimal('confidence', 5, 2)->nullable();
            $table->boolean('is_verified')->default(false);
            $table->json('tags')->nullable();
            $table->timestamps();

            $table->unique(['source', 'external_id'], 'places_source_external_unique');
            $table->index(['country_code', 'category', 'is_verified']);
            $table->index(['location_id', 'category']);
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};
