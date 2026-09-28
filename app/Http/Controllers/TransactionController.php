<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionDetail;
use App\Models\CashierShift;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

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

        // Ambil shift aktif kasir
        $activeShift = CashierShift::where('user_id', Auth::id())
            ->where('status', 'open')
            ->first();

        if (!$activeShift) {
            return redirect()->back()->with('error', 'Silakan buka shift terlebih dahulu sebelum melakukan transaksi!');
        }

        return DB::transaction(function () use ($request, $activeShift) {
            $totalAmount = 0;
            $itemsToInsert = [];

            foreach ($request->items as $item) {
            $product = Product::findOrFail($item['product_id']);

            if ($product->stock < $item['qty']) {
                throw new \Exception("Stok produk {$product->name} tidak mencukupi.");
            }

            $product->decrement('stock', $item['qty']);
            $subtotal = $product->price * $item['qty'];
            $totalAmount += $subtotal;

            $itemsToInsert[] = [
                'product_id' => $product->id,
                'quantity' => $item['qty'],
                'price' => $product->price,
                'subtotal' => $subtotal,
            ];
        }

            // Hitung poin: 1 poin per kelipatan Rp 10.000
            $pointsEarned = floor($totalAmount / 10000);

            // Simpan Transaksi
            $transaction = Transaction::create([
                'customer_id' => $request->customer_id,
                'cashier_shift_id' => $activeShift->id, // Tambahkan shift ID
                'invoice_number' => 'TRX-' . strtoupper(Str::random(8)),
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

    public function index()
    {
        // Cari shift aktif kasir yang sedang login
        $activeShift = CashierShift::with('mutations')
            ->where('user_id', Auth::id())
            ->where('status', 'open')
            ->first();

        return Inertia::render('pos/index', [
            'products' => Product::where('stock', '>', 0)->get(),
            'customers' => Customer::all(),
            'activeShift' => $activeShift, // Pass data shift ke React
        ]);
    }
    
    public function checkout(Request $request)
    {
        // Memanggil logika transaksi store yang sudah teruji sebelumnya
        $this->store($request);

        return redirect()->back()->with('success', 'Transaksi berhasil diproses!');
    }
}