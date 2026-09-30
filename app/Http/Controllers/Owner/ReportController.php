<?php

namespace App\Http\Controllers\Owner;

use App\Http\Controllers\Controller;
use App\Models\CashierShift;
use App\Models\Transaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        // 1. Data Transaksi berdasarkan Filter Tanggal
        $transactions = Transaction::with(['customer', 'shift.user'])
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->latest()
            ->get();

        // 2. Summary Statistics
        $totalRevenue = $transactions->sum('total_amount');
        $totalTransactions = $transactions->count();

        // 3. Rekap Audit Shift Kasir (Log Selisih Kas)
        $shifts = CashierShift::with('user')
            ->whereDate('opened_at', '>=', $startDate)
            ->whereDate('opened_at', '<=', $endDate)
            ->latest()
            ->get();

        return Inertia::render('owner/reports/index', [
            'transactions' => $transactions,
            'shifts' => $shifts,
            'summary' => [
                'total_revenue' => $totalRevenue,
                'total_transactions' => $totalTransactions,
            ],
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
        ]);
    }
}