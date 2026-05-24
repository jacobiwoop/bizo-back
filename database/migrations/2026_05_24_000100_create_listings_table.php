<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->foreignUuid('owner_id')->constrained('users')->cascadeOnDelete();
            $table->string('title', 80);
            $table->string('title_search', 80);
            $table->text('description');
            $table->enum('type', ['VENTE', 'TROC', 'TROC_CASH']);
            $table->bigInteger('price')->nullable();
            $table->bigInteger('cash_complement')->nullable();
            $table->string('exchange_for')->nullable();
            $table->string('category');
            $table->enum('condition', ['neuf', 'excellent', 'bon', 'correct']);
            $table->enum('delivery_mode', ['main_propre', 'livraison', 'les_deux']);
            $table->json('photos')->nullable();
            $table->string('country', 5);
            $table->string('city');
            $table->string('neighborhood')->nullable();
            $table->json('tags')->nullable();
            $table->integer('view_count')->default(0);
            $table->integer('favorite_count')->default(0);
            $table->enum('status', ['active', 'sold', 'expired', 'draft', 'deleted'])->default('active');
            $table->boolean('is_boosted')->default(false);
            $table->timestamp('boosted_until')->nullable();
            $table->json('price_history')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['status', 'is_boosted', 'created_at']);
            $table->index(['owner_id', 'status']);
            $table->index(['category', 'status']);
            $table->index('title_search');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
