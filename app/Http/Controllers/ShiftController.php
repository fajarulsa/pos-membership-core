<?php

namespace App\Http\Controllers;

use App\Models\CashierShift;
use App\Models\CashMutation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class ShiftController extends Controller
{
    // Buka Shift Baru
    public function openShift(Request $request)
    {
        $request->validate([
            'starting_cash' => 'required|numeric|min:0',
        ]);

        // Cek jika kasir masih punya shift aktif
        $activeShift = CashierShift::where('user_id', Auth::id())
            ->where('status', 'open')
            ->first();

        if ($activeShift) {
            return redirect()->back()->with('error', 'Anda masih memiliki shift yang belum ditutup.');
        }

        CashierShift::create([
            'user_id' => Auth::id(),
            'starting_cash' => $request->starting_cash,
            'status' => 'open',
            'opened_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Shift berhasil dibuka!');
    }

    // Catat Pengeluaran / Pemasukan Kasir (Petty Cash)
    public function storeMutation(Request $request)
    {
        $request->validate([
            'type' => 'required|in:in,out',
            'amount' => 'required|numeric|min:1',
            'notes' => 'required|string|max:255',
        ]);

        $activeShift = CashierShift::where('user_id', Auth::id())
            ->where('status', 'open')
            ->firstOrFail();

        CashMutation::create([
            'cashier_shift_id' => $activeShift->id,
            'type' => $request->type,
            'amount' => $request->amount,
            'notes' => $request->notes,
        ]);

        return redirect()->back()->with('success', 'Mutasi kas berhasil dicatat!');
    }

    // Tutup Shift (Blind Count & Deteksi Minus/Plus)
    public function closeShift(Request $request)
    {
        $request->validate([
            'ending_cash_actual' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $activeShift = CashierShift::where('user_id', Auth::id())
            ->where('status', 'open')
            ->firstOrFail();

        DB::transaction(function () use ($activeShift, $request) {
            // 1. Hitung total transaksi tunai pada shift ini
            $totalSalesCash = $activeShift->transactions()
                // ->where('payment_method', 'cash')
                ->sum('total_amount');

            // 2. Hitung total mutasi kas (pemasukan & pengeluaran)
            $totalCashIn = $activeShift->mutations()->where('type', 'in')->sum('amount');
            $totalCashOut = $activeShift->mutations()->where('type', 'out')->sum('amount');

            // 3. Saldo Ekspektasi Sistem
            $expected = $activeShift->starting_cash + $totalSalesCash + $totalCashIn - $totalCashOut;

            // 4. Hitung Selisih (Fisik - Ekspektasi)
            $actual = $request->ending_cash_actual;
            $difference = $actual - $expected;

            // 5. Update data shift
            $activeShift->update([
                'ending_cash_expected' => $expected,
                'ending_cash_actual' => $actual,
                'difference' => $difference,
                'status' => 'closed',
                'notes' => $request->notes,
                'closed_at' => now(),
            ]);
        });

        return redirect()->back()->with('success', 'Shift berhasil ditutup!');
    }
}