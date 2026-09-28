import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  stock: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  qr_code_token: string;
  total_points: number;
}

interface CartItem extends Product {
  qty: number;
}

interface ActiveShift {
  id: number;
  starting_cash: number;
  status: string;
  opened_at: string;
}

interface Props {
  products: Product[];
  customers: Customer[];
  activeShift: ActiveShift | null;
}

export default function PosIndex({ products, customers, activeShift }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // State untuk Dialog Shift & Petty Cash
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(!activeShift);
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);
  const [isPettyCashModalOpen, setIsPettyCashModalOpen] = useState(false);

  // Form Inputs
  const [startingCashInput, setStartingCashInput] = useState('');
  const [endingCashInput, setEndingCashInput] = useState('');
  const [pettyType, setPettyType] = useState<'in' | 'out'>('out');
  const [pettyAmount, setPettyAmount] = useState('');
  const [pettyNotes, setPettyNotes] = useState('');

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  const addToCart = (product: Product) => {
    if (!activeShift) return alert('Silakan Buka Shift terlebih dahulu!');
    if (product.stock <= 0) return alert('Stok produk habis!');

    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      if (existing.qty >= product.stock) return alert('Kuantitas melebihi stok!');
      setCart(
        cart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const estimatedPoints = Math.floor(totalAmount / 10000);

  // --- HANDLER CHECKOUT ---
  const handleCheckout = () => {
    if (!activeShift) return alert('Shift aktif tidak ditemukan!');
    if (cart.length === 0) return alert('Keranjang masih kosong!');

    router.post(
      '/pos/checkout',
      {
        customer_id: selectedCustomerId,
        items: cart.map((item) => ({
          product_id: item.id,
          qty: item.qty,
        })),
      },
      {
        onSuccess: () => {
          alert('Transaksi Kasir Berhasil Diproses!');
          setCart([]);
          setSelectedCustomerId(null);
        },
        onError: () => alert('Gagal memproses transaksi.'),
      }
    );
  };

  // --- HANDLER OPEN SHIFT ---
  const handleOpenShift = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(
      '/shift/open',
      { starting_cash: Number(startingCashInput) },
      {
        onSuccess: () => {
          setIsShiftModalOpen(false);
          setStartingCashInput('');
        },
      }
    );
  };

  // --- HANDLER PETTY CASH ---
  const handleStoreMutation = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(
      '/shift/mutation',
      {
        type: pettyType,
        amount: Number(pettyAmount),
        notes: pettyNotes,
      },
      {
        onSuccess: () => {
          alert('Mutasi Kas Berhasil Dicatat!');
          setIsPettyCashModalOpen(false);
          setPettyAmount('');
          setPettyNotes('');
        },
      }
    );
  };

  // --- HANDLER CLOSE SHIFT ---
  const handleCloseShift = (e: React.FormEvent) => {
    e.preventDefault();
    router.post(
      '/shift/close',
      { ending_cash_actual: Number(endingCashInput) },
      {
        onSuccess: () => {
          alert('Shift Berhasil Ditutup!');
          setIsCloseShiftModalOpen(false);
          setEndingCashInput('');
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Head title="Kasir POS - Kodepagihari" />

      {/* HEADER UTAMA */}
      <div className="max-w-7xl mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-2 rounded-lg font-bold text-lg">☕</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Kodepagihari POS</h1>
            <p className="text-xs text-slate-500">Sistem Kasir & QR Membership Core</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeShift ? (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 py-1">
                🟢 Shift Active (Modal: Rp {Number(activeShift.starting_cash).toLocaleString('id-ID')})
              </Badge>
              <Button size="sm" variant="outline" onClick={() => setIsPettyCashModalOpen(true)}>
                💸 Mutasi Kas
              </Button>
              <Button size="sm" variant="destructive" onClick={() => setIsCloseShiftModalOpen(true)}>
                🔒 Tutup Shift
              </Button>
            </div>
          ) : (
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsShiftModalOpen(true)}>
              🔑 Buka Shift Baru
            </Button>
          )}

          <Input
            type="text"
            placeholder="🔍 Cari produk / SKU..."
            className="w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* KATALOG PRODUK */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:border-primary hover:shadow-md transition-all bg-white flex flex-col justify-between"
                onClick={() => addToCart(product)}
              >
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-base font-semibold text-slate-800">{product.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{product.sku || 'No SKU'}</p>
                </CardHeader>
                <CardContent className="p-4 pt-0 flex justify-between items-center mt-4">
                  <span className="font-bold text-sm text-primary">
                    Rp {Number(product.price).toLocaleString('id-ID')}
                  </span>
                  <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'} className="text-xs">
                    Stok: {product.stock}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* KERANJANG */}
        <div className="space-y-4">
          <Card className="bg-white shadow-sm border-2 border-slate-200">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Keranjang Belanja</span>
                <Badge variant="outline">Active Transaction</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground font-medium">Pelanggan / Membership:</p>
                  <select
                    className="text-xs border rounded p-1 bg-white"
                    value={selectedCustomerId || ''}
                    onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)}
                  >
                    <option value="">-- Guest / Non-Member --</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedCustomer ? (
                  <div className="flex justify-between items-center pt-1">
                    <div>
                      <p className="font-bold text-slate-800">{selectedCustomer.name}</p>
                      <p className="text-xs text-slate-500">{selectedCustomer.phone}</p>
                    </div>
                    <Badge className="bg-amber-500 text-white font-semibold">
                      ⭐ {selectedCustomer.total_points} Poin
                    </Badge>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic pt-1">Pelanggan Umum (Tanpa Poin Loyalty)</p>
                )}
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto pr-1 border-b pb-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Pilih produk di katalog sebelah kiri untuk menambahkan item
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1 pr-2">
                        <p className="font-semibold text-slate-800">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Rp {Number(item.price).toLocaleString('id-ID')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateQty(item.id, -1)}>
                          -
                        </Button>
                        <span className="font-medium text-xs w-4 text-center">{item.qty}</span>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateQty(item.id, 1)}>
                          +
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Estimasi Poin Masuk:</span>
                  <span className="font-bold text-amber-600">+{estimatedPoints} Poin</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-slate-900">
                  <span>Total Bayar:</span>
                  <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>

                <Button
                  className="w-full mt-4 h-12 text-base font-bold"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || !activeShift}
                >
                  Proses Bayar & Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* MODAL OPEN SHIFT */}
      <Dialog open={isShiftModalOpen} onOpenChange={setIsShiftModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔑 Buka Shift Kasir Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleOpenShift} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Saldo Modal Awal (Cash Drawer):</label>
              <Input
                type="number"
                placeholder="Misal: 200000"
                value={startingCashInput}
                onChange={(e) => setStartingCashInput(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Buka Shift Sekarang</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL MUTASI KAS (PETTY CASH) */}
      <Dialog open={isPettyCashModalOpen} onOpenChange={setIsPettyCashModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>💸 Catat Mutasi Kas (Petty Cash)</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleStoreMutation} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Jenis Mutasi:</label>
              <select
                className="w-full border rounded p-2 text-sm mt-1"
                value={pettyType}
                onChange={(e) => setPettyType(e.target.value as 'in' | 'out')}
              >
                <option value="out">Pengeluaran Kas (Beli Es, Galon, dll)</option>
                <option value="in">Pemasukan Kas Tambahan</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Nominal (Rp):</label>
              <Input
                type="number"
                placeholder="Misal: 15000"
                value={pettyAmount}
                onChange={(e) => setPettyAmount(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Keterangan / Keperluan:</label>
              <Input
                type="text"
                placeholder="Misal: Beli es batu 2 bungkus"
                value={pettyNotes}
                onChange={(e) => setPettyNotes(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">Simpan Mutasi Kas</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL CLOSE SHIFT */}
      <Dialog open={isCloseShiftModalOpen} onOpenChange={setIsCloseShiftModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>🔒 Rekap Closing & Tutup Shift</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCloseShift} className="space-y-4 pt-2">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
              Hitung dan masukkan total uang fisik tunai yang ada di dalam laci kasir saat ini (Blind Count).
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Total Uang Fisik Kasir (Rp):</label>
              <Input
                type="number"
                placeholder="Masukkan nominal uang di laci"
                value={endingCashInput}
                onChange={(e) => setEndingCashInput(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" variant="destructive" className="w-full">Tutup Shift & Rekap Selisih</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}