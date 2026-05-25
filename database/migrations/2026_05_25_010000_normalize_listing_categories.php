<?php

use App\Support\ListingCategory;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('listings')
            ->select(['id', 'category'])
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $normalized = ListingCategory::normalize($row->category);

                    if ($normalized !== $row->category) {
                        DB::table('listings')
                            ->where('id', $row->id)
                            ->update(['category' => $normalized]);
                    }
                }
            });

        DB::table('listing_requests')
            ->select(['id', 'category'])
            ->orderBy('id')
            ->chunkById(100, function ($rows) {
                foreach ($rows as $row) {
                    $normalized = ListingCategory::normalize($row->category);

                    if ($normalized !== $row->category) {
                        DB::table('listing_requests')
                            ->where('id', $row->id)
                            ->update(['category' => $normalized]);
                    }
                }
            });
    }

    public function down(): void
    {
        // Intentionally irreversible: original free-text values are lost after normalization.
    }
};
