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
  sku: string | null;
  price: number;
  stock: number;
}

interface Props {
  products: Product[];
}

export default function ProductIndex({ products }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  const openCreateModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setStock('');
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku || '');
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name,
      sku: sku || null,
      price: Number(price),
      stock: Number(stock),
    };

    if (editingProduct) {
      router.put(`/owner/products/${editingProduct.id}`, payload, {
        onSuccess: () => setIsModalOpen(false),
      });
    } else {
      router.post('/owner/products', payload, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      router.delete(`/owner/products/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Head title="Kelola Produk - Owner" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manajemen Menu & Produk</h1>
            <p className="text-xs text-slate-500">Kelola daftar menu, harga, dan ketersediaan stok kedai.</p>
          </div>
          <Button onClick={openCreateModal} className="bg-primary">
            + Tambah Produk Baru
          </Button>
        </div>

        {/* TABEL PRODUK */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Produk ({products.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-3">Nama Produk</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Harga</th>
                    <th className="p-3">Stok</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-6 text-slate-500">
                        Belum ada produk. Klik tombol tambah untuk memasukkan menu.
                      </td>
                    </tr>
                  ) : (
                    products.map((p) => (
                      <tr key={p.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-800">{p.name}</td>
                        <td className="p-3 text-slate-500">{p.sku || '-'}</td>
                        <td className="p-3 font-bold text-emerald-600">
                          Rp {Number(p.price).toLocaleString('id-ID')}
                        </td>
                        <td className="p-3">
                          <Badge variant={p.stock > 0 ? 'secondary' : 'destructive'}>
                            {p.stock} pcs
                          </Badge>
                        </td>
                        <td className="p-3 text-right space-x-2">
                          <Button size="sm" variant="outline" onClick={() => openEditModal(p)}>
                            Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                            Hapus
                          </Button>
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

      {/* MODAL FORM TAMBAH / EDIT */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Nama Produk / Menu:</label>
              <Input
                type="text"
                placeholder="Misal: Es Kopi Susu Aren"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">SKU / Kode Unik (Opsional):</label>
              <Input
                type="text"
                placeholder="Misal: KOP-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Harga Jual (Rp):</label>
              <Input
                type="number"
                placeholder="Misal: 18000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Stok Awal:</label>
              <Input
                type="number"
                placeholder="Misal: 50"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full">
                {editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}