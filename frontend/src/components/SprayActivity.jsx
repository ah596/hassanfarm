import { useMemo, useState } from 'react';
import api from '../lib/api';
import { Button, Card, Input, Select, StatCard, Table, Textarea } from './ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;
const ordinal = value => { const n = Number(value); if (!n) return ''; const suffix = n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'; return `${n}${suffix} Spray`; };
const defaultForm = applicationNumber => ({ applicationNumber, customApplication: '', date: '', receiptImage: '', productName: '', productAmount: '', labourCost: '', otherCost: '', products: [], notes: '' });

export default function SprayActivity({ seasonId, activities, summary, onSaved }) {
  const sprays = activities.filter(item => item.type === 'Spray / Pesticide');
  const nextNumber = () => ordinal(sprays.length + 1);
  const applicationOptions = Array.from({ length: Math.max(sprays.length + 3, 10) }, (_, index) => ordinal(index + 1));
  const [form, setForm] = useState(() => defaultForm(nextNumber()));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const update = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  const productRowsAmount = useMemo(() => form.products.reduce((total, item) => total + (Number(item.price) || 0), 0), [form.products]);
  const productAmount = (Number(form.productAmount) || 0) || productRowsAmount;
  const total = productAmount + (Number(form.labourCost) || 0) + (Number(form.otherCost) || 0);
  const reset = (number = nextNumber()) => { setEditingId(null); setForm(defaultForm(number)); };
  const updateProduct = (index, key, value) => setForm(current => ({ ...current, products: current.products.map((row, i) => i === index ? { ...row, [key]: value } : row) }));
  const addProduct = () => setForm(current => ({ ...current, products: [...current.products, { name: '', quantity: '', price: '' }] }));
  const removeProduct = index => setForm(current => ({ ...current, products: current.products.filter((_, i) => i !== index) }));
  const readReceipt = event => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) { toast.error('Please choose an image file.'); return; } if (file.size > 700000) { toast.error('Please use an image below 700 KB.'); return; } const reader = new FileReader(); reader.onload = () => setForm(current => ({ ...current, receiptImage: reader.result })); reader.readAsDataURL(file); };
  const save = async event => { event.preventDefault(); setSaving(true); try { const applicationNumber = form.applicationNumber === 'Custom' ? form.customApplication : form.applicationNumber; const payload = { type: 'Spray / Pesticide', date: form.date, title: form.productName || applicationNumber, quantity: 0, unit: '', totalCost: total, notes: form.notes, details: { applicationNumber, receiptImage: form.receiptImage, productName: form.productName, productAmount, labourCost: form.labourCost, otherCost: form.otherCost, products: form.products } }; const wasEditing = Boolean(editingId); if (editingId) await api.put(`/crops/${seasonId}/activities/${editingId}`, payload); else await api.post(`/crops/${seasonId}/activities`, payload); toast.success(editingId ? 'Spray updated' : 'Spray saved'); reset(ordinal(sprays.length + (wasEditing ? 1 : 2))); await onSaved(); } catch (err) { Swal.fire({ icon: 'error', title: 'Could not save spray', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' }); } finally { setSaving(false); } };
  const edit = row => { const detail = row.details || {}; const known = applicationOptions.includes(detail.applicationNumber); setForm({ applicationNumber: known ? detail.applicationNumber : 'Custom', customApplication: known ? '' : detail.applicationNumber || '', date: row.date || '', receiptImage: detail.receiptImage || '', productName: detail.productName || row.title || '', productAmount: String(detail.productAmount ?? ''), labourCost: String(detail.labourCost ?? ''), otherCost: String(detail.otherCost ?? ''), products: Array.isArray(detail.products) ? detail.products : [], notes: row.notes || '' }); setEditingId(row.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async id => { const answer = await Swal.fire({ title: 'Delete spray record?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00' }); if (!answer.isConfirmed) return; try { await api.delete(`/crops/${seasonId}/activities/${id}`); toast.success('Spray deleted'); await onSaved(); } catch (err) { toast.error(err.response?.data?.message || err.message); } };
  const showDetails = row => Swal.fire({ title: row.details?.applicationNumber || 'Spray details', html: `<div style="text-align:left"><p><b>Product amount:</b> ${money(row.details?.productAmount)}</p><p><b>Labour charges:</b> ${money(row.details?.labourCost)}</p><p><b>Other charges:</b> ${money(row.details?.otherCost)}</p><p><b>Total:</b> ${money(row.totalCost)}</p><p><b>Notes:</b> ${row.notes || '—'}</p></div>`, confirmButtonColor: '#001e00' });
  const showBill = image => Swal.fire({ title: 'Spray image', imageUrl: image, imageAlt: 'Spray bill or image', confirmButtonColor: '#001e00' });
  return <div className="space-y-6">
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><StatCard title="Total spray expense" value={money(summary?.totalCost)} /><StatCard title="Spray applications" value={summary?.applications || 0} /></div>
    <div className="grid gap-6 xl:grid-cols-[1fr_1.65fr]">
      <Card><form className="grid gap-4" onSubmit={save}>
        <div className="text-lg font-bold text-[#001e00]">{editingId ? 'Edit spray' : 'Add spray'}</div>
        <Select label="Spray / Application Number *" value={form.applicationNumber} onChange={update('applicationNumber')}>{applicationOptions.map(option => <option key={option}>{option}</option>)}<option>Custom</option></Select>
        {form.applicationNumber === 'Custom' ? <Input label="Custom spray number" value={form.customApplication} onChange={update('customApplication')} required /> : null}
        <Input label="Date" type="date" value={form.date} onChange={update('date')} required />
        <div><div className="mb-1.5 text-sm font-medium text-[#001e00]">Upload picture (optional)</div><input type="file" accept="image/*" capture="environment" onChange={readReceipt} className="block w-full text-sm text-[#3a8a3a]" />{form.receiptImage ? <img src={form.receiptImage} alt="Spray preview" className="mt-3 h-32 rounded-xl border border-[#a8d8a8] object-cover" /> : null}</div>
        <Input label="Product / spray name (optional)" value={form.productName} onChange={update('productName')} />
        <Input label="Total Amount (Rs.)" type="number" min="0" value={form.productAmount} onChange={update('productAmount')} placeholder={productRowsAmount ? String(productRowsAmount) : '0'} />
        <div className="rounded-xl border border-[#a8d8a8] p-3"><div className="mb-2 flex items-center justify-between"><div className="text-sm font-semibold text-[#001e00]">Extra products (optional)</div><button type="button" onClick={addProduct} aria-label="Add product" className="flex h-7 w-7 items-center justify-center rounded-full bg-[#001e00] text-lg font-semibold text-white hover:bg-[#0f3d0f]">+</button></div>{form.products.map((item, index) => <div className="mb-2 grid grid-cols-[1fr_70px_90px_auto] gap-2" key={index}><input value={item.name} onChange={event => updateProduct(index, 'name', event.target.value)} placeholder="Product" className="rounded-lg border border-[#a8d8a8] px-2 text-sm" /><input value={item.quantity} onChange={event => updateProduct(index, 'quantity', event.target.value)} placeholder="Qty" className="rounded-lg border border-[#a8d8a8] px-2 text-sm" /><input value={item.price} onChange={event => updateProduct(index, 'price', event.target.value)} placeholder="Rs." type="number" className="rounded-lg border border-[#a8d8a8] px-2 text-sm" /><button type="button" className="text-sm text-red-700" onClick={() => removeProduct(index)}>×</button></div>)}</div>
        <Input label="Spray karne wale ke charges (Rs.)" type="number" min="0" value={form.labourCost} onChange={update('labourCost')} /><Input label="Other charges (Rs.)" type="number" min="0" value={form.otherCost} onChange={update('otherCost')} />
        <div className="rounded-xl bg-[#f0faf0] p-4"><div className="text-sm text-[#3a8a3a]">Total spray expense</div><div className="mt-1 text-xl font-bold text-[#001e00]">{money(total)}</div></div><Textarea label="Notes" rows="2" value={form.notes} onChange={update('notes')} />
        <div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update spray' : 'Save spray'}</Button>{editingId ? <Button type="button" variant="secondary" onClick={reset}>Cancel</Button> : null}</div>
      </form></Card>
      <Table rows={sprays} columns={[{ key: 'number', label: 'Spray no.', render: row => row.details?.applicationNumber }, { key: 'date', label: 'Date', render: row => row.date || '-' }, { key: 'picture', label: 'Picture', render: row => row.details?.receiptImage ? <Button variant="secondary" onClick={() => showBill(row.details.receiptImage)}>View</Button> : '-' }, { key: 'amount', label: 'Total amount', render: row => money(row.details?.productAmount) }, { key: 'labour', label: 'Labour', render: row => money(row.details?.labourCost) }, { key: 'total', label: 'Total', render: row => money(row.totalCost) }, { key: 'actions', label: 'Actions', render: row => <div className="flex gap-2"><Button variant="secondary" onClick={() => showDetails(row)}>Details</Button><Button variant="secondary" onClick={() => edit(row)}>Edit</Button><Button variant="danger" onClick={() => remove(row.id)}>Delete</Button></div> }]} emptyMessage="No spray applications yet." />
    </div>
  </div>;
}
