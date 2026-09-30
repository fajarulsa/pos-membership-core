import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  qr_code_token: string;
  total_points: number;
}

interface Props {
  customers: Customer[];
}

export default function CustomersIndex({ customers }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [totalPoints, setTotalPoints] = useState('0');

  const openCreateModal = () => {
    setEditingCustomer(null);
    setName('');
    setPhone('');
    setTotalPoints('0');
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setPhone(customer.phone || '');
    setTotalPoints(customer.total_points.toString());
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingCustomer) {
      router.put(`/owner/customers/${editingCustomer.id}`, {
        name,
        phone: phone || null,
        total_points: Number(totalPoints),
      }, {
        onSuccess: () => setIsModalOpen(false),
      });
    } else {
      router.post('/owner/customers', {
        name,
        phone: phone || null,
      }, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <Head title="Kelola Member - Owner" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex justify-between items-center bg-white p-5 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manajemen Member Pelanggan</h1>
            <p className="text-xs text-slate-500">Daftarkan pelanggan, kelola data diri, dan pantau akumulasi poin loyalty.</p>
          </div>
          <Button onClick={openCreateModal}>+ Registrasi Member Baru</Button>
        </div>

        {/* TABEL MEMBER */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-lg">Daftar Member Terdaftar ({customers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-600">
                    <th className="p-3">Nama Member</th>
                    <th className="p-3">No. WhatsApp / HP</th>
                    <th className="p-3">QR Token</th>
                    <th className="p-3">Poin Loyalty</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-6 text-slate-500">
                        Belum ada member terdaftar.
                      </td>
                    </tr>
                  ) : (
                    customers.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-semibold text-slate-800">{c.name}</td>
                        <td className="p-3 text-slate-600">{c.phone || '-'}</td>
                        <td className="p-3 font-mono text-xs text-slate-400">{c.qr_code_token.substring(0, 8)}...</td>
                        <td className="p-3">
                          <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                            {c.total_points} Pts
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button size="sm" variant="outline" onClick={() => openEditModal(c)}>
                            Edit
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
            <DialogTitle>{editingCustomer ? 'Edit Data Member' : 'Daftarkan Member Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Nama Lengkap:</label>
              <Input
                type="text"
                placeholder="Misal: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">No. WhatsApp / Telepon (Opsional):</label>
              <Input
                type="text"
                placeholder="Misal: 081234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            {editingCustomer && (
              <div>
                <label className="text-xs font-semibold text-slate-600">Jumlah Poin:</label>
                <Input
                  type="number"
                  value={totalPoints}
                  onChange={(e) => setTotalPoints(e.target.value)}
                  required
                />
              </div>
            )}
            <DialogFooter>
              <Button type="submit" className="w-full">
                {editingCustomer ? 'Simpan Perubahan' : 'Daftarkan Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}