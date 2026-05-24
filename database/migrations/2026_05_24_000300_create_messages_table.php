<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('conv_id');
            $table->foreign('conv_id')->references('id')->on('conversations');
            $table->foreignUuid('sender_id')->constrained('users');
            $table->enum('type', ['text', 'image', 'troc_proposal']);
            $table->text('text')->nullable();
            $table->string('image_url')->nullable();
            $table->foreignUuid('offered_listing_id')->nullable()->constrained('listings');
            $table->string('offered_listing_title')->nullable();
            $table->string('offered_listing_photo')->nullable();
            $table->bigInteger('cash_amount')->nullable();
            $table->enum('proposal_status', ['pending', 'accepted', 'refused'])->nullable();
            $table->text('refusal_reason')->nullable();
            $table->boolean('is_read')->default(false);
            $table->timestamps();

            $table->index(['conv_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
