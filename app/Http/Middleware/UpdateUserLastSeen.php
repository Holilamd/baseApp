<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UpdateUserLastSeen
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $user = Auth::user();
            
            // Only update last_seen_at if it's null or more than 1 minute ago to save DB write operations
            if (!$user->last_seen_at || $user->last_seen_at->diffInMinutes(now()) >= 1) {
                // Update without triggering event listeners
                $user->timestamps = false;
                $user->last_seen_at = now();
                $user->save();
            }
        }

        return $next($request);
    }
}
