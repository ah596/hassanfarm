import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { Button, Card, Input, LoadingState, SectionHeader, StatCard, Table, Textarea } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;
const currentMonth = () => new Date().toISOString().slice(0, 7);
const dateToday = () => new Date().toISOString().slice(0, 10);
const shiftMonth = (month, delta) => {
  const [year, monthIndex] = month.split('-').map(Number);
  return new Date(Date.UTC(year, monthIndex - 1 + delta, 1)).toISOString().slice(0, 7);
};

export default function DairySupplier() {
  const { supplierId } = useParams();
  const navigate = useNavigate();
  const [month, setMonth] = useState(currentMonth());
  const [data, setData] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [date, setDate] = useState(dateToday());
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('');
  const [saving, setSaving] = useState(false); const [newEntry, setNewEntry] = useState(false);
  const [editEntry, setEditEntry] = useState(null);

  const load = async () => {
    try { setData((await api.get(`/dairy/suppliers/${supplierId}?month=${month}`)).data); }
    catch (err) { toast.error(err.response?.data?.message || err.message); }
  };
  useEffect(() => { load(); }, [supplierId, month]);

  const resetForm = () => { setEditEntry(null); setNewEntry(false); setDate(dateToday()); setQuantity(''); setNotes(''); };
  const saveEntry = async event => {
    event?.preventDefault(); if (!date.startsWith(month)) return toast.error('Choose a date from the selected month.'); if (editEntry === 'new-entry' && monthly.calendar.some(row => row.id && row.date === date)) return toast.error('A milk record already exists for this date.'); setSaving(true);
    try {
      await api.post(`/dairy/suppliers/${supplierId}/entries`, { date, quantityKg: quantity, notes });
      toast.success(editEntry ? 'Milk entry updated' : 'Milk entry saved');
      resetForm(); await load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Could not save milk entry', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' });
    } finally { setSaving(false); }
  };
  const editKey = row => row.id || `new-${row.date}`;
  const addEntry = () => { setNewEntry(true); setEditEntry('new-entry'); setDate(month === currentMonth() ? dateToday() : `${month}-01`); setQuantity(''); setNotes(''); };
  const startEdit = row => { setDate(row.date); setQuantity(String(row.quantityKg || '')); setNotes(row.notes || ''); setEditEntry(editKey(row)); };
  const remove = async id => {
    const answer = await Swal.fire({ title: 'Delete milk entry?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00' });
    if (!answer.isConfirmed) return;
    try { await api.delete(`/dairy/suppliers/${supplierId}/entries/${id}`); toast.success('Milk entry deleted'); if (editEntry === id) resetForm(); await load(); }
    catch (err) { toast.error(err.response?.data?.message || err.message); }
  };
  const savePayment = async event => {
    event.preventDefault();
    try { await api.post(`/dairy/suppliers/${supplierId}/payments`, { month, amountPaid: payment, paymentDate: dateToday() }); toast.success('Payment saved'); setPayment(''); await load(); }
    catch (err) { toast.error(err.response?.data?.message || err.message); }
  };

  if (!data) return <LoadingState label="Loading supplier..." />;
  const { supplier, monthly } = data;
  const titleMonth = new Date(`${month}-01T00:00:00`).toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const columns = [
    { key: 'date', label: 'Date', render: row => editKey(row) === editEntry ? <input className="dairy-table-editing w-32 rounded-lg border border-[#a8d8a8] bg-white px-2 py-2 text-sm" type="date" value={date} onChange={e => setDate(e.target.value)} /> : row.date },
    { key: 'milk', label: 'Milk (Kg)', render: row => editKey(row) === editEntry ? <input className="w-24 rounded-lg border border-[#a8d8a8] bg-white px-2 py-2 text-sm" type="number" min="0" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} /> : row.status === 'Received' ? `${row.quantityKg} Kg` : '—' },
    { key: 'amount', label: 'Amount', render: row => row.status === 'Received' ? money(row.amount) : '—' },
    { key: 'status', label: 'Status', render: row => <span className={row.status === 'Received' ? 'font-semibold text-green-700' : row.status === 'Naga' ? 'font-semibold text-red-700' : 'font-semibold text-amber-700'}>{row.status}</span> },
    { key: 'actions', label: 'Actions', render: row => editKey(row) === editEntry ? <div className="flex gap-2 whitespace-nowrap"><Button onClick={() => saveEntry()}>{row.id ? 'Update' : 'Save'}</Button><Button variant="secondary" onClick={resetForm}>Cancel</Button></div> : <Button variant="secondary" onClick={() => startEdit(row)}>Edit</Button> }
  ];
  const inlineEdit = row => <form className="grid gap-3 sm:grid-cols-2" onSubmit={saveEntry}><div className="sm:col-span-2 text-base font-bold">Edit milk entry — {row.date}</div><Input label="Milk quantity (Kg)" type="number" min="0" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} required /><div className="rounded-xl bg-white p-3 text-sm">Rate: <b>{money(supplier.ratePerKg)} / Kg</b><br />Updated amount: <b>{money((Number(quantity) || 0) * Number(supplier.ratePerKg || 0))}</b></div><Textarea label="Notes" rows="2" value={notes} onChange={e => setNotes(e.target.value)} className="sm:col-span-2" /><div className="flex flex-col gap-2 sm:col-span-2 sm:flex-row"><Button className="w-full sm:w-auto" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update entry'}</Button><Button className="w-full sm:w-auto" type="button" variant="secondary" onClick={resetForm}>Cancel</Button></div></form>;

  return <div className="space-y-5 sm:space-y-6">
    <SectionHeader title={`${supplier.name} – ${titleMonth}`} subtitle={`Current rate: ${money(supplier.ratePerKg)} / Kg`} action={<Button className="w-full sm:w-auto" variant="secondary" onClick={() => navigate('/dairy')}>Back to suppliers</Button>} />
    <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3"><Button variant="secondary" onClick={() => setMonth(shiftMonth(month, -1))}>← Previous</Button><div className="rounded-xl bg-white px-4 py-2 text-sm font-semibold sm:px-5">{titleMonth}</div><Button variant="secondary" onClick={() => setMonth(shiftMonth(month, 1))}>Next →</Button></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6"><StatCard title="Total milk" value={`${monthly.totalMilk.toLocaleString()} Kg`} /><StatCard title="Total amount" value={money(monthly.totalAmount)} /><StatCard title="Received days" value={monthly.receivedDays} /><StatCard title="Naga days" value={monthly.nagaDays} /><StatCard title="Average / day" value={`${monthly.averageMilk.toFixed(2)} Kg`} /><StatCard title="Balance" value={money(monthly.payment.balance)} /></div>
    <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-3"><div className="flex items-center justify-between gap-3"><div className="text-lg font-bold">Daily milk record</div><Button className="h-10 w-10 !px-0 text-xl" onClick={addEntry} disabled={newEntry} aria-label="Add milk record">+</Button></div><Table rows={[...monthly.calendar, ...(newEntry ? [{ id: 'new-entry', date, status: 'New' }] : [])]} columns={columns} emptyMessage="No dates in this collection period." /></div>
      <div className="dairy-side-actions space-y-6">
        <Card><form className="grid gap-4" onSubmit={saveEntry}><div className="text-lg font-bold">{editEntry ? 'Edit milk entry' : 'Quick add milk'}</div><Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} disabled={Boolean(editEntry)} required /><Input label="Milk quantity (Kg)" type="number" min="0" step="0.01" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="e.g. 1.25" required /><div className="rounded-xl bg-[#f0faf0] p-3 text-sm">Rate: <b>{money(supplier.ratePerKg)} / Kg</b><br />Daily amount: <b>{money((Number(quantity) || 0) * Number(supplier.ratePerKg || 0))}</b></div><Textarea label="Notes" rows="2" value={notes} onChange={e => setNotes(e.target.value)} /><div className="flex flex-col gap-2 sm:flex-row"><Button className="w-full sm:w-auto" type="submit" disabled={saving}>{saving ? 'Saving...' : editEntry ? 'Update entry' : 'Save milk'}</Button>{editEntry ? <Button className="w-full sm:w-auto" type="button" variant="secondary" onClick={resetForm}>Cancel</Button> : null}</div></form></Card>
        <Card><form className="grid gap-3" onSubmit={savePayment}><div className="text-lg font-bold">Monthly payment</div><div className="text-sm text-[#3a8a3a]">Payable: {money(monthly.payment.totalPayable)} · Paid: {money(monthly.payment.amountPaid)} · {monthly.payment.status}</div><Input label="Amount paid (Rs.)" type="number" min="0" value={payment} onChange={e => setPayment(e.target.value)} required /><Button type="submit">Save payment</Button></form></Card>
      </div>
    </div>
  </div>;
}
