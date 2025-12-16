<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register Spatie Permission middleware
        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'admin.role' => \App\Http\Middleware\AdminRoleMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function ($response, \Throwable $exception, \Illuminate\Http\Request $request) {
            // Handle CSRF token mismatch (419) for Inertia requests
            if ($exception instanceof \Illuminate\Session\TokenMismatchException ||
                ($response instanceof \Illuminate\Http\Response && $response->status() === 419)) {

                if ($request->hasHeader('X-Inertia')) {
                    // For Inertia requests, redirect back with flash message
                    return back()->with([
                        'flash' => [
                            'type' => 'error',
                            'message' => 'Your session has expired. Please try logging in again.',
                        ],
                    ]);
                }

                // For regular requests, redirect to login
                return redirect()->route('login');
            }

            return $response;
        });
    })->create();
