<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('users', \App\Http\Controllers\UserController::class);
    Route::resource('menus', \App\Http\Controllers\MenuController::class);
    Route::resource('roles', \App\Http\Controllers\RoleController::class);
    
    // Boilerplate placeholders
    Route::get('/tenant/settings', function () {
        return Inertia::render('Tenant/Settings');
    })->name('tenant.settings');

    Route::get('/chat', function () {
        return Inertia::render('Chat');
    })->name('chat');

    // Reports page
    Route::get('/reports', function () {
        return Inertia::render('Reports');
    })->name('reports');

    // Reusable Export Reports endpoints
    Route::get('/reports/export/pdf', [\App\Http\Controllers\ReportController::class, 'exportPdf'])->name('reports.pdf');
    Route::get('/reports/export/excel', [\App\Http\Controllers\ReportController::class, 'exportExcel'])->name('reports.excel');
    Route::get('/reports/export/word', [\App\Http\Controllers\ReportController::class, 'exportWord'])->name('reports.word');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
