import { useEffect, useState } from 'react';
import api from '../lib/api';
import { Button, Card, Input, SectionHeader, Table, Textarea } from '../components/ui';

const initial = { animalId: '', medicineName: '', medicineType: '', quantity: '', cost: '', date: '', veterinaryDoctor: '', description: '' };

export default function Medicine() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(initial);

  const load = async () => {
    const res = await api.get('/medicine');
    setRows(res.data.medicine);
  };

  useEffect(() => { load(); }, []);

  const submit = async e => {
    e.preventDefault();
    await api.post('/medicine', form);
    setForm(initial);
    load();
  };

  const remove = async id => {
    if (!window.confirm('Delete this medicine record?')) return;
    await api.delete(`/medicine/${id}`);
    load();
  };

  return (
    <div className="space-y-6">
      <SectionHeader title="Medicine / Veterinary" subtitle="Track vaccinations, injections, and treatments." />
      <Card>
        <form className="grid gap-4 md:grid-cols-3" onSubmit={submit}>
          <Input label="Animal ID (optional)" value={form.animalId} onChange={e => setForm({ ...form, animalId: e.target.value })} />
          <Input label="Medicine Name" value={form.medicineName} onChange={e => setForm({ ...form, medicineName: e.target.value })} required />
          <Input label="Medicine Type" value={form.medicineType} onChange={e => setForm({ ...form, medicineType: e.target.value })} required />
          <Input label="Quantity" type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
          <Input label="Cost" type="number" min="0" value={form.cost} onChange={e => setForm({ ...form, cost: e.target.value })} required />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
          <Input label="Veterinary Doctor" value={form.veterinaryDoctor} onChange={e => setForm({ ...form, veterinaryDoctor: e.target.value })} />
          <div className="md:col-span-2">
            <Textarea label="Description" rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="md:col-span-3">
            <Button type="submit">Save medicine record</Button>
          </div>
        </form>
      </Card>
      <Table
        columns={[
          { key: 'medicineId', label: 'Medicine ID' },
          { key: 'animalId', label: 'Animal' },
          { key: 'medicineName', label: 'Name' },
          { key: 'medicineType', label: 'Type' },
          { key: 'cost', label: 'Cost', render: row => `Rs. ${Number(row.cost || 0).toLocaleString()}` },
          { key: 'date', label: 'Date' },
          { key: 'actions', label: 'Actions', render: row => <Button variant="danger" onClick={() => remove(row.id)}>Delete</Button> }
        ]}
        rows={rows}
      />
    </div>
  );
}
