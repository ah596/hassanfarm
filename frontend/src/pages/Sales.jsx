import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button, Card, Input, SectionHeader, Table, Textarea } from '../components/ui';

const initial = { animalId: '', saleDate: '', salePrice: '', buyerName: '', buyerContact: '', saleWeight: '', pricePerKg: '', notes: '' };

export default function Sales() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initial);

  const load = async () => {
    const res = await api.get('/sales');
    setRows(res.data.sales);
  };

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    await api.post('/sales', form);
    setForm(initial);
    load();
  };

  const remove = async id => {
    if (!window.confirm('Delete this sale record?')) return;
    await api.delete(`/sales/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Sales" subtitle="Mark animals as sold and calculate profit immediately." />
      <Card>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={submit}>
          <Input label="Animal ID" value={form.animalId} onChange={e => setForm({ ...form, animalId: e.target.value })} required />
          <Input label="Sale Date" type="date" value={form.saleDate} onChange={e => setForm({ ...form, saleDate: e.target.value })} required />
          <Input label="Sale Price" type="number" min="0" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} required />
          <Input label="Buyer Name" value={form.buyerName} onChange={e => setForm({ ...form, buyerName: e.target.value })} required />
          <Input label="Buyer Contact" value={form.buyerContact} onChange={e => setForm({ ...form, buyerContact: e.target.value })} />
          <Input label="Sale Weight" type="number" min="0" value={form.saleWeight} onChange={e => setForm({ ...form, saleWeight: e.target.value })} />
          <Input label="Price per KG" type="number" min="0" value={form.pricePerKg} onChange={e => setForm({ ...form, pricePerKg: e.target.value })} />
          <div className="md:col-span-2">
            <Textarea label="Notes" rows="3" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <Button type="submit">Save sale</Button>
          </div>
        </form>
      </Card>
      <Table
        columns={[
          { key: 'saleId', label: 'Sale ID' },
          { key: 'animalId', label: 'Animal' },
          { key: 'saleDate', label: 'Sale Date' },
          { key: 'salePrice', label: 'Sale Price', render: row => `Rs. ${Number(row.salePrice || 0).toLocaleString()}` },
          { key: 'buyerName', label: 'Buyer' },
          { key: 'actions', label: 'Actions', render: row => <Button variant="danger" onClick={() => remove(row.id)}>Delete</Button> }
        ]}
        rows={rows}
      />
    </div>
  );
}
