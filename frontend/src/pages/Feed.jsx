import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button, Card, Input, SectionHeader, Table } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

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
    try {
      await api.post('/feed', form);
      toast.success('Feed record saved!');
      setForm(initial);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' });
    }
  };

  const remove = async id => {
    const result = await Swal.fire({ title: 'Delete Feed Record?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00', confirmButtonText: 'Yes, delete' });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/feed/${id}`);
      toast.success('Feed record deleted.');
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' });
    }
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
