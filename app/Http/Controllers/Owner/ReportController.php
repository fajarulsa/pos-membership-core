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
    
    public function export(Request $request)
    {
        $startDate = $request->input('start_date', now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', now()->toDateString());

        $transactions = Transaction::with(['customer', 'shift.user'])
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->latest()
            ->get();

        // Ganti extension kembali ke .csv
        $filename = "Laporan_Penjualan_{$startDate}_sd_{$endDate}.csv";

        $headers = [
            "Content-type"        => "text/csv; charset=UTF-8",
            "Content-Disposition" => "attachment; filename={$filename}",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function () use ($transactions) {
            $file = fopen('php://output', 'w');
            
            // BOM UTF-8 agar Excel dapat membaca karakter Rupiah/aksara dengan rapi
            fputs($file, "\xEF\xBB\xBF");

            // Header Kolom
            fputcsv($file, ['ID Transaksi', 'Tanggal & Waktu', 'Kasir', 'Pelanggan', 'Total Belanja']);

            foreach ($transactions as $tx) {
                fputcsv($file, [
                    '#TX-' . $tx->id,
                    $tx->created_at->format('Y-m-d H:i:s'),
                    $tx->shift->user->name ?? 'Kasir',
                    $tx->customer->name ?? 'Guest',
                    $tx->total_amount,
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}