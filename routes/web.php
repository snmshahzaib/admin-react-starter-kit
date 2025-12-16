<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'admin.role'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard')->can('dashboard.view');

    // Roles routes - admin has full access
    Route::get('roles', [App\Http\Controllers\RoleController::class, 'index'])->name('roles.index')->can('roles.view');
    Route::get('roles/create', [App\Http\Controllers\RoleController::class, 'create'])->name('roles.create')->can('roles.create');
    Route::post('roles', [App\Http\Controllers\RoleController::class, 'store'])->name('roles.store')->can('roles.create');
    Route::get('roles/{role}', [App\Http\Controllers\RoleController::class, 'show'])->name('roles.show')->can('roles.view');
    Route::get('roles/{role}/edit', [App\Http\Controllers\RoleController::class, 'edit'])->name('roles.edit')->can('roles.edit');
    Route::put('roles/{role}', [App\Http\Controllers\RoleController::class, 'update'])->name('roles.update')->can('roles.edit');
    Route::delete('roles/{role}', [App\Http\Controllers\RoleController::class, 'destroy'])->name('roles.destroy')->can('roles.delete');
    Route::get('roles-data', [App\Http\Controllers\RoleController::class, 'data'])->name('roles.data')->can('roles.view');

    // Permissions routes - admin has full access
    Route::get('permissions', [App\Http\Controllers\PermissionController::class, 'index'])->name('permissions.index')->can('permissions.view');
    Route::get('permissions/create', [App\Http\Controllers\PermissionController::class, 'create'])->name('permissions.create')->can('permissions.create');
    Route::post('permissions', [App\Http\Controllers\PermissionController::class, 'store'])->name('permissions.store')->can('permissions.create');
    Route::get('permissions/{permission}', [App\Http\Controllers\PermissionController::class, 'show'])->name('permissions.show')->can('permissions.view');

    // Users routes - admin has full access
    Route::get('users', [App\Http\Controllers\UserController::class, 'index'])->name('users.index')->can('users.view');
    Route::get('users/create', [App\Http\Controllers\UserController::class, 'create'])->name('users.create')->can('users.create');
    Route::post('users', [App\Http\Controllers\UserController::class, 'store'])->name('users.store')->can('users.create');
    Route::get('users/{user}', [App\Http\Controllers\UserController::class, 'show'])->name('users.show')->can('users.view');
    Route::get('users/{user}/edit', [App\Http\Controllers\UserController::class, 'edit'])->name('users.edit')->can('users.edit');
    Route::put('users/{user}', [App\Http\Controllers\UserController::class, 'update'])->name('users.update')->can('users.edit');
    Route::delete('users/{user}', [App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy')->can('users.delete');
    Route::get('users-data', [App\Http\Controllers\UserController::class, 'data'])->name('users.data')->can('users.view');
    Route::get('permissions/{permission}/edit', [App\Http\Controllers\PermissionController::class, 'edit'])->name('permissions.edit')->can('permissions.edit');
    Route::put('permissions/{permission}', [App\Http\Controllers\PermissionController::class, 'update'])->name('permissions.update')->can('permissions.edit');
    Route::delete('permissions/{permission}', [App\Http\Controllers\PermissionController::class, 'destroy'])->name('permissions.destroy')->can('permissions.delete');
    Route::get('permissions-data', [App\Http\Controllers\PermissionController::class, 'data'])->name('permissions.data')->can('permissions.view');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
