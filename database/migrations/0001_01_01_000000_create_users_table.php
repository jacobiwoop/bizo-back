<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('(UUID())'));
            $table->string('email')->unique();
            $table->string('password');
            $table->string('display_name');
            $table->string('username')->unique()->nullable();
            $table->text('bio')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('country_code', 5)->nullable();
            $table->float('rating')->default(0);
            $table->integer('review_count')->default(0);
            $table->integer('total_sales')->default(0);
            $table->string('fcm_token')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_profile_public')->default(true);
            $table->boolean('has_seen_onboarding')->default(false);
            $table->float('response_rate')->nullable();
            $table->integer('avg_response_time')->nullable();
            $table->json('blocked_users')->nullable();
            $table->json('saved_searches')->nullable();
            $table->boolean('notif_messages')->default(true);
            $table->boolean('notif_troc')->default(true);
            $table->boolean('notif_rappels')->default(true);
            $table->boolean('notif_favoris')->default(true);
            $table->timestamp('last_seen_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignUuid('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
