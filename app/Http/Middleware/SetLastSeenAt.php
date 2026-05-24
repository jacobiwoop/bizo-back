<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLastSeenAt
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($user = $request->user()) {
            $fiveMinutesAgo = now()->subMinutes(5);

            if (!$user->last_seen_at || $user->last_seen_at->lt($fiveMinutesAgo)) {
                $user->updateQuietly(['last_seen_at' => now()]);
            }
        }

        return $next($request);
    }
}
