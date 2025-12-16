<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminRoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Check if user is authenticated
        if (! Auth::check()) {
            return redirect()->route('login')->with('error', 'Please log in to access this page.');
        }

        // Check if user has admin role
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if (! $user->hasRole('admin')) {
            // Logout the user
            Auth::logout();

            // Invalidate the session
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            // Redirect to login with error message
            return redirect()->route('login')->with('error', 'User does not exist or does not have the required permissions.');
        }

        return $next($request);
    }
}
