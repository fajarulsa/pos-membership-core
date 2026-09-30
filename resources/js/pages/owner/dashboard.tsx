import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingBag, DollarSign, ArrowRight } from 'lucide-react';

interface Transaction {
  id: number;
  total_amount: number;
  created_at: string;
  customer?: { name: string } | null;
}

interface Props {
  totalProducts: number;
  todayTransactionsCount: number;
  todayRevenue: number;
  recentTransactions: Transaction[];
}

export default function OwnerDashboard({
  totalProducts,
  todayTransactionsCount,
  todayRevenue,
  recentTransactions,
}: Props) {
  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Head title="Owner Dashboard - Backoffice" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Owner Dashboard</h1>
            <p className="text-xs text-slate-500">Ringkasan performa penjualan dan inventaris kedai hari ini.</p>
          </div>
          <Link href="/owner/products">
            <Button className="flex items-center gap-2">
              <Package className="w-4 h-4" /> Kelola Produk
            </Button>
          </Link>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Omset Hari Ini</CardTitle>
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                Rp {Number(todayRevenue).toLocaleString('id-ID')}
              </div>
              <p className="text-xs text-slate-500 mt-1">Total akumulasi penjualan tunai</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Transaksi Hari Ini</CardTitle>
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{todayTransactionsCount} Transaksi</div>
              <p className="text-xs text-slate-500 mt-1">Struk berhasil diproses kasir</p>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Menu / Produk</CardTitle>
              <Package className="w-5 h-5 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{totalProducts} Item</div>
              <p className="text-xs text-slate-500 mt-1">Produk terdaftar di katalog</p>
            </CardContent>
          </Card>
        </div>

        {/* TRANSAKSI TERAKHIR */}
        <Card className="bg-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Transaksi Terbaru Hari Ini</CardTitle>
            <Link href="/pos">
              <Button variant="ghost" size="sm" className="text-xs flex items-center gap-1">
                Buka Aplikasi POS <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-3">ID Transaksi</th>
                    <th className="p-3">Pelanggan</th>
                    <th className="p-3">Waktu</th>
                    <th className="p-3 text-right">Total Belanja</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center p-6 text-slate-500">
                        Belum ada transaksi hari ini.
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((tx) => (
                      <tr key={tx.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-800">#TX-{tx.id}</td>
                        <td className="p-3">
                          {tx.customer ? (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                              {tx.customer.name}
                            </Badge>
                          ) : (
                            <span className="text-slate-400 italic">Guest</span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500">
                          {new Date(tx.created_at).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-600">
                          Rp {Number(tx.total_amount).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}