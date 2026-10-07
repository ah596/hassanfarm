import { useMemo, useRef, useState } from 'react';
import api from '../lib/api';
import { Input, Select, Textarea } from './ui';
import { StageForm, StageHistory, StageSave, StageSection, StageSummary, StageTotal } from './CropStageUI';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;
const ordinal = number => { const suffix = number % 10 === 1 && number % 100 !== 11 ? 'st' : number % 10 === 2 && number % 100 !== 12 ? 'nd' : number % 10 === 3 && number % 100 !== 13 ? 'rd' : 'th'; return `${number}${suffix} Time`; };
const makeForm = applicationNumber => ({ applicationNumber, customApplication: '', date: '', image: '', productName: '', amount: '', products: [], notes: '' });

export default function PesticideActivity({ seasonId, activities, summary, acres, onSaved }) {
  const rows = activities.filter(item => item.type === 'Pesticide Application');
  const options = Array.from({ length: Math.max(rows.length + 3, 10) }, (_, index) => ordinal(index + 1));
  const [form, setForm] = useState(() => makeForm(ordinal(rows.length + 1)));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const receiptInput = useRef(null);
  const change = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  const productRowsAmount = useMemo(() => form.products.reduce((sum, item) => sum + (Number(item.price) || 0), 0), [form.products]);
  const reset = number => { setEditingId(null); setForm(makeForm(number || ordinal(rows.length + 1))); };
  const addProduct = () => setForm(current => ({ ...current, products: [...current.products, { name: '', quantity: '', price: '' }] }));
  const removeProduct = index => setForm(current => ({ ...current, products: current.products.filter((_, i) => i !== index) }));
  const updateProduct = (index, key, value) => setForm(current => ({ ...current, products: current.products.map((item, i) => i === index ? { ...item, [key]: value } : item) }));
  const readImage = event => { const file = event.target.files?.[0]; if (!file) return; if (!file.type.startsWith('image/')) { toast.error('Please select an image.'); return; } if (file.size > 700000) { toast.error('Please use an image below 700 KB.'); return; } const reader = new FileReader(); reader.onload = () => setForm(current => ({ ...current, image: reader.result })); reader.readAsDataURL(file); };
  const showImage = image => Swal.fire({ title: 'Pesticide image', imageUrl: image, imageAlt: 'Pesticide product or bill', confirmButtonColor: '#001e00' });
  const save = async event => { event.preventDefault(); setSaving(true); try { const applicationNumber = form.applicationNumber === 'Custom' ? form.customApplication : form.applicationNumber; const amount = (Number(form.amount) || 0) || productRowsAmount; const payload = { type: 'Pesticide Application', date: form.date || null, title: form.productName || applicationNumber, quantity: 0, unit: '', totalCost: amount, notes: form.notes, details: { applicationNumber, image: form.image, productName: form.productName, amount, products: form.products } }; const wasEditing = Boolean(editingId); if (editingId) await api.put(`/crops/${seasonId}/activities/${editingId}`, payload); else await api.post(`/crops/${seasonId}/activities`, payload); toast.success(editingId ? 'Pesticide application updated' : 'Pesticide application saved'); reset(ordinal(rows.length + (wasEditing ? 1 : 2))); await onSaved(); } catch (err) { Swal.fire({ icon: 'error', title: 'Could not save pesticide application', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' }); } finally { setSaving(false); } };
  const edit = row => { const detail = row.details || {}; const known = options.includes(detail.applicationNumber); setForm({ applicationNumber: known ? detail.applicationNumber : 'Custom', customApplication: known ? '' : detail.applicationNumber || '', date: row.date || '', image: detail.image || '', productName: detail.productName || row.title || '', amount: String(detail.amount ?? row.totalCost ?? ''), products: Array.isArray(detail.products) ? detail.products : [], notes: row.notes || '' }); setEditingId(row.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async id => { const answer = await Swal.fire({ title: 'Delete pesticide application?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00' }); if (!answer.isConfirmed) return; try { await api.delete(`/crops/${seasonId}/activities/${id}`); toast.success('Pesticide application deleted'); await onSaved(); } catch (err) { toast.error(err.response?.data?.message || err.message); } };
  const details = row => Swal.fire({ title: row.details?.applicationNumber || 'Pesticide application', html: `<div style="text-align:left"><p><b>Product:</b> ${row.details?.productName || '—'}</p><p><b>Amount:</b> ${money(row.totalCost)}</p><p><b>Notes:</b> ${row.notes || '—'}</p></div>`, confirmButtonColor: '#001e00' });
  const total = (Number(form.amount) || 0) || productRowsAmount;
  const suggestions = [...new Set(rows.map(row => row.details?.productName || row.title).filter(Boolean))].slice(0, 6);
  return <div className="crop-stage-screen">
    <StageSummary title="Total pesticide cost" value={money(summary?.totalCost)} hint={acres ? `Avg ${money(Number(summary?.totalCost || 0) / acres)} / Acre` : 'No land area recorded'} badge={<>{rows.length} applications<small>Recorded this season</small></>} />
    <div className="crop-stage-columns">
      <StageForm title={editingId ? 'Edit Pesticide Log' : 'Quick Pesticide Log'} onSubmit={save} icon="Pesticide">
        <StageSection title="Application & Timing"><div className="crop-stage-field-pair"><Select label="Application number" required value={form.applicationNumber} onChange={change('applicationNumber')}>{options.map(option => <option key={option}>{option}</option>)}<option>Custom</option></Select><Input label="Date" type="date" value={form.date} onChange={change('date')} /></div>{form.applicationNumber === 'Custom' && <Input label="Custom application number" value={form.customApplication} onChange={change('customApplication')} required />}</StageSection>
        <StageSection title="Chemical & Photo" action={<button type="button" className="crop-stage-bill-button" onClick={() => receiptInput.current?.click()}>+ Add Bottle Slip</button>}>
          <input ref={receiptInput} type="file" accept="image/*" capture="environment" onChange={readImage} className="sr-only" aria-label="Upload pesticide receipt" /><Input aria-label="Pesticide / product name" value={form.productName} onChange={change('productName')} placeholder="Pesticide / product name" />
          <div className="crop-stage-product-chips">{suggestions.map(name => <button type="button" key={name} onClick={() => setForm(current => ({ ...current, productName: name }))}>{name}</button>)}</div>
          {form.image && <div className="crop-stage-receipt"><img src={form.image} alt="Pesticide receipt preview" /><button type="button" onClick={() => { setForm(current => ({ ...current, image: '' })); if (receiptInput.current) receiptInput.current.value = ''; }}>Remove image</button></div>}
        </StageSection>
        <StageSection title="Cost Summary"><Input label="Chemical cost (Rs.)" type="number" min="0" step="0.01" value={form.amount} onChange={change('amount')} placeholder={productRowsAmount ? String(productRowsAmount) : '0'} /><StageTotal total={total} hint="Pesticide / product cost" /></StageSection>
        <details className="crop-stage-extras"><summary>Extra products & notes</summary><div className="crop-stage-extra-fields"><button type="button" className="crop-stage-bill-button" onClick={addProduct}>+ Add product</button>{form.products.map((item, index) => <div className="crop-stage-extra-product" key={index}><Input aria-label={`Product ${index + 1}`} value={item.name} onChange={event => updateProduct(index, 'name', event.target.value)} placeholder="Product" /><Input aria-label={`Quantity ${index + 1}`} value={item.quantity} onChange={event => updateProduct(index, 'quantity', event.target.value)} placeholder="Qty" /><Input aria-label={`Price ${index + 1}`} value={item.price} onChange={event => updateProduct(index, 'price', event.target.value)} placeholder="Rs." type="number" min="0" /><button type="button" aria-label={`Remove product ${index + 1}`} onClick={() => removeProduct(index)}>x</button></div>)}<Textarea label="Notes" rows="2" value={form.notes} onChange={change('notes')} /></div></details>
        <StageSave saving={saving} editing={editingId} total={total} label="Pesticide" onCancel={() => reset()} />
      </StageForm>
      <StageHistory title="Past pesticide history" rows={rows} renderSubtitle={row => row.notes || 'Pesticide application'} renderBreakdown={row => `Chemical: ${money(row.totalCost)}`} onView={details} onImage={showImage} onEdit={edit} onDelete={remove} emptyMessage="No pesticide applications yet." />
    </div>
  </div>;
}
