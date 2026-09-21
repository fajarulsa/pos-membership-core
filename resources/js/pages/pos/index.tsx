import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

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

interface Props {
  products: Product[];
  customers: Customer[];
}

export default function PosIndex({ products, customers }: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
//   const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(customers[0]?.id || null);
const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  // Filter produk dari input pencarian
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  );

  // Customer aktif
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Tambah produk ke keranjang
  const addToCart = (product: Product) => {
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

  // Adjust quantity (+ / -)
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

  // Hitung Total Belanja & Estimasi Poin (+1 poin per Rp 10.000)
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const estimatedPoints = Math.floor(totalAmount / 10000);

  // Proses Checkout
  const handleCheckout = () => {
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
        onError: (err) => {
          console.error(err);
          alert('Gagal memproses transaksi.');
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

        <Input
          type="text"
          placeholder="🔍 Cari produk / SKU..."
          className="w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* MAIN LAYOUT (SPLIT SCREEN) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        
        {/* KOLOM KIRI: KATALOG PRODUK (2/3 LEBAR) */}
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

        {/* KOLOM KANAN: KERANJANG & MEMBER (1/3 LEBAR) */}
        <div className="space-y-4">
          <Card className="bg-white shadow-sm border-2 border-slate-200">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>Keranjang Belanja</span>
                <Badge variant="outline">Active Transaction</Badge>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              
              {/* WIDGET PELANGGAN / MEMBER */}
              {/* <div className="p-3 bg-slate-50 rounded-lg border text-sm space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Pelanggan / Membership:</p>
                {selectedCustomer ? (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{selectedCustomer.name}</p>
                      <p className="text-xs text-slate-500">{selectedCustomer.phone}</p>
                    </div>
                    <Badge className="bg-amber-500 text-white font-semibold">
                      ⭐ {selectedCustomer.total_points} Poin
                    </Badge>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Guest / Non-Member</p>
                )}
              </div> */}
                <div className="p-3 bg-slate-50 rounded-lg border text-sm space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground font-medium">Pelanggan / Membership:</p>
                    {/* Dropdown pilih customer (Sementara sebelum fitur scan QR dibuat) */}
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

              {/* LIST ITEM BELANJA */}
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
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQty(item.id, -1)}
                        >
                          -
                        </Button>
                        <span className="font-medium text-xs w-4 text-center">{item.qty}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 w-7 p-0"
                          onClick={() => updateQty(item.id, 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* RINGKASAN TOTAL & POIN */}
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
                  disabled={cart.length === 0}
                >
                  Proses Bayar & Simpan
                </Button>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}