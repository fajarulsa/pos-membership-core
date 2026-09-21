<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransactionController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'customer_id' => 'nullable|exists:customers,id',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.qty' => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            $totalAmount = 0;
            $itemsToInsert = [];

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item['product_id']);
                $subtotal = $product->price * $item['qty'];
                $totalAmount += $subtotal;

                // Potong stok
                $product->decrement('stock', $item['qty']);

                $itemsToInsert[] = [
                    'product_id' => $product->id,
                    'qty' => $item['qty'],
                    'subtotal' => $subtotal,
                ];
            }

            // Hitung poin: 1 poin per kelipatan Rp 10.000
            $pointsEarned = floor($totalAmount / 10000);

            // Simpan Transaksi
            $transaction = Transaction::create([
                'customer_id' => $request->customer_id,
                'total_amount' => $totalAmount,
                'points_earned' => $pointsEarned,
                'status' => 'completed',
            ]);

            // Simpan Detail Transaksi
            foreach ($itemsToInsert as $detail) {
                $transaction->details()->create($detail);
            }

            // Tambahkan poin ke Customer jika ada
            if ($request->customer_id) {
                Customer::find($request->customer_id)->increment('total_points', $pointsEarned);
            }

            return response()->json([
                'message' => 'Transaksi berhasil diproses!',
                'data' => $transaction->load('details.product', 'customer'),
            ], 201);
        });
    }
}