<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->foreignUuid('listing_id')->constrained('listings');
            $table->foreignUuid('seller_id')->constrained('users');
            $table->foreignUuid('buyer_id')->constrained('users');
            $table->enum('type', ['VENTE', 'TROC', 'TROC_CASH']);
            $table->bigInteger('final_price')->nullable();
            $table->boolean('seller_reviewed')->default(false);
            $table->boolean('buyer_reviewed')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
