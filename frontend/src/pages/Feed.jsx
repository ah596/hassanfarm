import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button, Card, Input, SectionHeader, Table } from '../components/ui';

const initial = { animalId: '', feedType: '', quantity: '', unit: 'kg', pricePerUnit: '', date: '', notes: '' };

export default function Feed() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initial);

  const load = async () => {
    const res = await api.get('/feed');
    setRows(res.data.feed);
  };

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    await api.post('/feed', form);
    setForm(initial);
    load();
  };

  const remove = async id => {
    if (!window.confirm('Delete this feed record?')) return;
    await api.delete(`/feed/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Feed Management" subtitle="Track grain, hay, grass, and other feed costs." />
      <Card>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={submit}>
          <Input label="Animal ID (optional)" value={form.animalId} onChange={e => setForm({ ...form, animalId: e.target.value })} />
          <Input label="Feed Type" value={form.feedType} onChange={e => setForm({ ...form, feedType: e.target.value })} required />
          <Input label="Quantity" type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
          <Input label="Unit" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} required />
          <Input label="Price / Unit" type="number" min="0" value={form.pricePerUnit} onChange={e => setForm({ ...form, pricePerUnit: e.target.value })} required />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          <Input className="md:col-span-3" label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="md:col-span-3">
            <Button type="submit">Save feed record</Button>
          </div>
        </form>
      </Card>
      <Table
        columns={[
          { key: 'feedId', label: 'Feed ID' },
          { key: 'animalId', label: 'Animal' },
          { key: 'feedType', label: 'Feed Type' },
          { key: 'quantity', label: 'Quantity' },
          { key: 'totalCost', label: 'Total Cost', render: row => `Rs. ${Number(row.totalCost || 0).toLocaleString()}` },
          { key: 'date', label: 'Date' },
          { key: 'actions', label: 'Actions', render: row => <Button variant="danger" onClick={() => remove(row.id)}>Delete</Button> }
        ]}
        rows={rows}
      />
    </div>
  );
}
