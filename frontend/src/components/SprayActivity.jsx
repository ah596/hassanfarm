import { useMemo, useRef, useState } from 'react';
import api from '../lib/api';
import { Input, Select, Textarea } from './ui';
import { StageForm, StageHistory, StageSave, StageSection, StageSummary, StageTotal } from './CropStageUI';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;
const ordinal = value => { const n = Number(value); if (!n) return ''; const suffix = n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'; return `${n}${suffix} Spray`; };
const defaultForm = applicationNumber => ({ applicationNumber, customApplication: '', date: '', receiptImage: '', productName: '', productAmount: '', labourCost: '', otherCost: '', products: [], notes: '' });

export default function SprayActivity({ seasonId, activities, summary, acres, onSaved }) {
  const sprays = activities.filter(item => item.type === 'Spray / Pesticide');
  const nextNumber = () => ordinal(sprays.length + 1);
  const applicationOptions = Array.from({ length: Math.max(sprays.length + 3, 10) }, (_, index) => ordinal(index + 1));
  const [form, setForm] = useState(() => defaultForm(nextNumber()));
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const receiptInput = useRef(null);
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
  const suggestedProducts = [...new Set(['Vitako', 'Belt Expert', 'Cartap 40', 'Tricyclazole', ...sprays.map(row => row.details?.productName).filter(Boolean)])];
  return <div className="crop-stage-screen">
    <StageSummary title="Total spray cost" value={money(summary?.totalCost)} hint={acres ? `Avg ${money(Number(summary?.totalCost || 0) / acres)} / Acre` : 'No land area recorded'} badge={<>{nextNumber()}<small>Next application</small></>}>
      <div className="crop-stage-progress"><div><b>{sprays.length} sprays logged</b><span>{nextNumber()} next</span></div><div className="crop-stage-progress-bars">{Array.from({ length: Math.max(sprays.length + 1, 3) }, (_, index) => <span key={index} className={index < sprays.length ? 'complete' : ''} />)}</div><div className="crop-stage-progress-labels"><span>Completed applications</span><span>Next spray</span></div></div>
    </StageSummary>
    <div className="crop-stage-columns">
      <StageForm title={editingId ? 'Edit Spray Log' : 'Quick Spray Log'} onSubmit={save} icon="Spray">
        <StageSection title="Application & Timing"><div className="crop-stage-field-pair"><Select label="Spray stage" required value={form.applicationNumber} onChange={update('applicationNumber')}>{applicationOptions.map(option => <option key={option} value={option}>{option}{option === nextNumber() ? ' (Current)' : ''}</option>)}<option>Custom</option></Select><Input label="Date" type="date" value={form.date} onChange={update('date')} required /></div>{form.applicationNumber === 'Custom' && <Input label="Custom spray number" value={form.customApplication} onChange={update('customApplication')} required />}</StageSection>
        <StageSection title="Chemical & Photo" action={<button type="button" className="crop-stage-bill-button" onClick={() => receiptInput.current?.click()}>▣ Add Bottle Slip</button>}>
          <input ref={receiptInput} type="file" accept="image/*" capture="environment" onChange={readReceipt} className="sr-only" aria-label="Upload spray receipt" />
          <Input aria-label="Product / spray name" value={form.productName} onChange={update('productName')} placeholder="Product / spray name" />
          <div className="crop-stage-product-chips">{suggestedProducts.map(name => <button type="button" key={name} onClick={() => setForm(current => ({ ...current, productName: name }))}>{name}</button>)}</div>
          {form.receiptImage && <div className="crop-stage-receipt"><img src={form.receiptImage} alt="Spray receipt preview" /><button type="button" onClick={() => { setForm(current => ({ ...current, receiptImage: '' })); if (receiptInput.current) receiptInput.current.value = ''; }}>Remove image</button></div>}
        </StageSection>
        <StageSection title="Cost Summary"><div className="crop-stage-field-pair"><Input label="Labour cost" type="number" min="0" step="0.01" value={form.labourCost} onChange={update('labourCost')} placeholder="Rs. 0" /><Input label="Chemical cost" type="number" min="0" step="0.01" value={form.productAmount} onChange={update('productAmount')} placeholder={productRowsAmount ? String(productRowsAmount) : 'Rs. 0'} /></div><StageTotal total={total} hint="Labour + Chemical + Other" /></StageSection>
        <details className="crop-stage-extras"><summary>Extra products, other charges & notes</summary><div className="crop-stage-extra-fields"><button type="button" onClick={addProduct} className="crop-stage-bill-button">+ Add product</button>{form.products.map((item, index) => <div className="crop-stage-extra-product" key={index}><Input aria-label={`Product ${index + 1}`} value={item.name} onChange={event => updateProduct(index, 'name', event.target.value)} placeholder="Product" /><Input aria-label={`Quantity ${index + 1}`} value={item.quantity} onChange={event => updateProduct(index, 'quantity', event.target.value)} placeholder="Qty" /><Input aria-label={`Price ${index + 1}`} value={item.price} onChange={event => updateProduct(index, 'price', event.target.value)} placeholder="Rs." type="number" min="0" /><button type="button" aria-label={`Remove product ${index + 1}`} onClick={() => removeProduct(index)}>×</button></div>)}<Input label="Other charges (Rs.)" type="number" min="0" value={form.otherCost} onChange={update('otherCost')} /><Textarea label="Notes" rows="2" value={form.notes} onChange={update('notes')} /></div></details>
        <StageSave saving={saving} editing={editingId} total={total} label="Spray" onCancel={() => reset()} />
      </StageForm>
      <StageHistory title="Past sprays history" rows={sprays} renderSubtitle={row => row.notes || 'Spray / Protection'} renderBreakdown={row => `Labour: ${money(row.details?.labourCost)} · Chem: ${money(row.details?.productAmount)}`} onView={showDetails} onImage={showBill} onEdit={edit} onDelete={remove} emptyMessage="No spray applications yet." />
    </div>
  </div>;
}
