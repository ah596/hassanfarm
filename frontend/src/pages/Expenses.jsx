import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button, Card, Input, Select, SectionHeader, Table, Textarea } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const initial = { animalId: '', category: 'Feed', amount: '', date: '', description: '', receipt: '' };

export default function Expenses() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initial);

  const load = async () => {
    const res = await api.get('/expenses');
    setRows(res.data.expenses);
  };

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/expenses', form);
      toast.success('Expense saved!');
      setForm(initial);
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' });
    }
  };

  const remove = async id => {
    const result = await Swal.fire({ title: 'Delete Expense?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00', confirmButtonText: 'Yes, delete' });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted.');
      load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' });
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Expenses" subtitle="Link costs to an animal or keep them at farm level." />
      <Card>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={submit}>
          <Input label="Animal ID (optional)" value={form.animalId} onChange={e => setForm({ ...form, animalId: e.target.value })} />
          <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
            <option>Feed</option>
            <option>Medicine</option>
            <option>Veterinary</option>
            <option>Vaccination</option>
            <option>Transportation</option>
            <option>Labor</option>
            <option>Other</option>
          </Select>
          <Input label="Amount" type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          <Input label="Receipt URL" value={form.receipt} onChange={e => setForm({ ...form, receipt: e.target.value })} />
          <div className="md:col-span-3">
            <Textarea label="Description" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <Button type="submit">Save expense</Button>
          </div>
        </form>
      </Card>
      <Table
        columns={[
          { key: 'expenseId', label: 'Expense ID' },
          { key: 'animalId', label: 'Animal' },
          { key: 'category', label: 'Category' },
          { key: 'amount', label: 'Amount', render: row => `Rs. ${Number(row.amount || 0).toLocaleString()}` },
          { key: 'date', label: 'Date' },
          { key: 'actions', label: 'Actions', render: row => <Button variant="danger" onClick={() => remove(row.id)}>Delete</Button> }
        ]}
        rows={rows}
      />
    </div>
  );
}
