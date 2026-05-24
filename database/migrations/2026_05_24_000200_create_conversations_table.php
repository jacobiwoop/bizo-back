<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('conversations', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('listing_id')->constrained('listings');
            $table->string('listing_title');
            $table->string('listing_photo')->nullable();
            $table->foreignUuid('participant_1')->constrained('users');
            $table->foreignUuid('participant_2')->constrained('users');
            $table->text('last_message')->nullable();
            $table->timestamp('last_message_at')->nullable();
            $table->foreignUuid('last_sender_id')->nullable()->constrained('users');
            $table->integer('unread_p1')->default(0);
            $table->integer('unread_p2')->default(0);
            $table->timestamps();

            $table->index(['participant_1', 'last_message_at']);
            $table->index(['participant_2', 'last_message_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('conversations');
    }
};
