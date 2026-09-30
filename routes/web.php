<?php
// support
use Illuminate\Support\Facades\Route;
use App\Http\Middleware\RoleMiddleware;
use Inertia\Inertia;

// controllers
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\ShiftController;
use App\Http\Controllers\Owner\ProductController;
use App\Http\Controllers\Owner\ReportController;

// models
use App\Models\Product;
use App\Models\Transaction;


Route::inertia('/', 'welcome')->name('home');

// Route::middleware(['auth', 'verified'])->group(function () {
//     Route::inertia('dashboard', 'dashboard')->name('dashboard');
// });

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
        Route::get('/dashboard', function () {
            return Inertia::render('owner/dashboard', [
                'totalProducts' => Product::count(),
                'todayTransactionsCount' => Transaction::whereDate('created_at', now())->count(),
                'todayRevenue' => Transaction::whereDate('created_at', now())->sum('total_amount'),
                'recentTransactions' => Transaction::with('customer')->latest()->take(5)->get(),
            ]);
        })->name('dashboard');

        // CRUD Produk
        Route::get('/products', [ProductController::class, 'index'])->name('products.index');
        Route::post('/products', [ProductController::class, 'store'])->name('products.store');
        Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

        // Laporan Penjualan & Rekap Shift (Sprint 3)
        Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
    });

});

require __DIR__.'/settings.php';
