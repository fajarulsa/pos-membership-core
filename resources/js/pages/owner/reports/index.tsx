import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: number;
  total_amount: number;
  created_at: string;
  customer?: { name: string } | null;
  shift?: { user?: { name: string } } | null;
}

interface CashierShift {
  id: number;
  user?: { name: string };
  starting_cash: number;
  ending_cash_expected: number;
  ending_cash_actual: number;
  difference: number;
  status: string;
  opened_at: string;
  closed_at: string | null;
}

interface Props {
  transactions: Transaction[];
  shifts: CashierShift[];
  summary: {
    total_revenue: number;
    total_transactions: number;
  };
  filters: {
    start_date: string;
    end_date: string;
  };
}

export default function ReportsIndex({ transactions, shifts, summary, filters }: Props) {
  const [startDate, setStartDate] = useState(filters.start_date);
  const [endDate, setEndDate] = useState(filters.end_date);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    router.get('/owner/reports', { start_date: startDate, end_date: endDate }, { preserveState: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Head title="Laporan & Analytics - Owner" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER & FILTER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-xl border shadow-sm gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Laporan Penjualan & Shift</h1>
            <p className="text-xs text-slate-500">Pantau omset, rekap transaksi, dan audit kasir.</p>
          </div>

          <form onSubmit={handleFilter} className="flex items-center gap-2">
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-auto text-xs"
            />
            <span className="text-xs text-slate-400">s/d</span>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-auto text-xs"
            />
            <Button type="submit" size="sm">
              Filter Data
            </Button>
          </form>
        </div>

        {/* METRICS SUMMARY */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Omset Periode Ini</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                Rp {Number(summary.total_revenue).toLocaleString('id-ID')}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Transaksi Selesai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">
                {summary.total_transactions} Transaksi
              </div>
            </CardContent>
          </Card>
        </div>

        {/* REKAP AUDIT SHIFT KASIR */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Audit Shift & Selisih Kasir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-3">Kasir</th>
                    <th className="p-3">Waktu Buka / Tutup</th>
                    <th className="p-3">Modal Awal</th>
                    <th className="p-3">Sistem (Expected)</th>
                    <th className="p-3">Fisik (Actual)</th>
                    <th className="p-3">Selisih Audit</th>
                  </tr>
                </thead>
                <tbody>
                  {shifts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center p-6 text-slate-500">
                        Tidak ada riwayat shift pada periode ini.
                      </td>
                    </tr>
                  ) : (
                    shifts.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-800">{s.user?.name || 'Kasir'}</td>
                        <td className="p-3 text-xs text-slate-500">
                          <div>Buka: {new Date(s.opened_at).toLocaleString('id-ID')}</div>
                          <div>Tutup: {s.closed_at ? new Date(s.closed_at).toLocaleString('id-ID') : 'Masih Buka'}</div>
                        </td>
                        <td className="p-3">Rp {Number(s.starting_cash).toLocaleString('id-ID')}</td>
                        <td className="p-3">Rp {Number(s.ending_cash_expected).toLocaleString('id-ID')}</td>
                        <td className="p-3 font-bold">Rp {Number(s.ending_cash_actual).toLocaleString('id-ID')}</td>
                        <td className="p-3">
                          {s.difference === 0 ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">PAS (Rp 0)</Badge>
                          ) : s.difference < 0 ? (
                            <Badge variant="destructive">
                              MINUS Rp {Math.abs(s.difference).toLocaleString('id-ID')}
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                              SURPLUS Rp {Number(s.difference).toLocaleString('id-ID')}
                            </Badge>
                          )}
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