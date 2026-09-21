<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\TransactionController;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

Route::get('/pos', [TransactionController::class, 'index'])->name('pos.index');
Route::post('/pos/checkout', [TransactionController::class, 'checkout'])->name('pos.checkout');

require __DIR__.'/settings.php';
