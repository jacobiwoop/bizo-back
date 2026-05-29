<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->foreignUuid('location_id')->nullable()->after('neighborhood')->constrained('locations')->nullOnDelete();
            $table->foreignUuid('place_id')->nullable()->after('location_id')->constrained('places')->nullOnDelete();
            $table->decimal('exact_lat', 10, 8)->nullable()->after('place_id');
            $table->decimal('exact_lng', 11, 8)->nullable()->after('exact_lat');
            $table->decimal('display_lat', 10, 8)->nullable()->after('exact_lng');
            $table->decimal('display_lng', 11, 8)->nullable()->after('display_lat');
            $table->enum('location_accuracy', ['exact', 'district', 'city'])->default('district')->after('display_lng');

            $table->index(['location_id', 'status']);
            $table->index(['place_id', 'status']);
            $table->index(['display_lat', 'display_lng']);
        });
    }

    public function down(): void
    {
        Schema::table('listings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('location_id');
            $table->dropConstrainedForeignId('place_id');
            $table->dropColumn([
                'exact_lat',
                'exact_lng',
                'display_lat',
                'display_lng',
                'location_accuracy',
            ]);
        });
    }
};
