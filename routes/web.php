<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ShiftController;
use App\Http\Middleware\RoleMiddleware;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::middleware(['auth', 'verified'])->group(function () {
    
// --- ROUTE KHUSUS KASIR & OWNER (POS TRANSACTION & SHIFT) ---
    Route::middleware([RoleMiddleware::class . ':cashier,owner'])->group(function () {
        Route::get('/pos', [TransactionController::class, 'index'])->name('pos.index');
        Route::post('/pos/checkout', [TransactionController::class, 'store'])->name('pos.checkout');

        Route::post('/shift/open', [ShiftController::class, 'openShift'])->name('shift.open');
        Route::post('/shift/mutation', [ShiftController::class, 'storeMutation'])->name('shift.mutation');
        Route::post('/shift/close', [ShiftController::class, 'closeShift'])->name('shift.close');
    });

    // --- ROUTE KHUSUS OWNER (BACKOFFICE / MANAGEMENT) ---
    Route::middleware([RoleMiddleware::class . ':owner'])->prefix('owner')->name('owner.')->group(function () {
        // Nanti diisi: CRUD Produk, Laporan Penjualan, Rekap Audit Shift Kasir, dll.
        Route::get('/dashboard', function () {
            return Inertia::render('owner/dashboard');
        })->name('dashboard');
    });

});

require __DIR__.'/settings.php';
