import { useMemo, useState } from 'react';
import api from '../lib/api';
import { Input, Select, Textarea } from './ui';
import { StageForm, StageHistory, StageSave, StageSection, StageSummary } from './CropStageUI';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const ordinal = number => { const suffix = number % 10 === 1 && number % 100 !== 11 ? 'st' : number % 10 === 2 && number % 100 !== 12 ? 'nd' : number % 10 === 3 && number % 100 !== 13 ? 'rd' : 'th'; return `${number}${suffix} Harvest`; };
const makeForm = number => ({ harvestNumber: number, customHarvest: '', date: '', unit: '', quantity: '', weightPerBag: '', unitPerBag: 'Kg', notes: '' });

export default function HarvestingActivity({ seasonId, yields, summary, onSaved }) {
  const options = Array.from({ length: Math.max(yields.length + 3, 10) }, (_, index) => ordinal(index + 1));
  const [form, setForm] = useState(() => makeForm(ordinal(yields.length + 1)));
  const [editingId, setEditingId] = useState(null); const [saving, setSaving] = useState(false);
  const change = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  const quantityLabel = form.unit === 'Bags' ? 'Total Bags' : form.unit ? `Total Weight (${form.unit})` : 'Quantity / Weight';
  const calculatedProduction = form.unit === 'Bags' ? (Number(form.quantity) || 0) * (Number(form.weightPerBag) || 0) : 0;
  const reset = number => { setEditingId(null); setForm(makeForm(number || ordinal(yields.length + 1))); };
  const submit = async event => { event.preventDefault(); setSaving(true); try { const harvestNumber = form.harvestNumber === 'Custom' ? form.customHarvest : form.harvestNumber; const payload = { harvestNumber, date: form.date || null, totalProduction: Number(form.quantity) || 0, unit: form.unit || null, bags: form.unit === 'Bags' ? Number(form.quantity) || 0 : 0, weightPerBag: Number(form.weightPerBag) || 0, unitPerBag: form.unit === 'Bags' ? form.unitPerBag : null, calculatedProduction, quality: '', moisture: '', storedQuantity: 0, soldQuantity: 0, notes: form.notes }; const wasEditing = Boolean(editingId); if (editingId) await api.put(`/crops/${seasonId}/yields/${editingId}`, payload); else await api.post(`/crops/${seasonId}/yields`, payload); toast.success(editingId ? 'Harvest updated' : 'Harvest saved'); reset(ordinal(yields.length + (wasEditing ? 1 : 2))); await onSaved(); } catch (err) { Swal.fire({ icon: 'error', title: 'Could not save harvest', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' }); } finally { setSaving(false); } };
  const edit = row => { const known = options.includes(row.harvestNumber); setForm({ harvestNumber: known ? row.harvestNumber : 'Custom', customHarvest: known ? '' : row.harvestNumber || '', date: row.date || '', unit: row.unit || '', quantity: String(row.totalProduction ?? ''), weightPerBag: String(row.weightPerBag ?? ''), unitPerBag: row.unitPerBag || 'Kg', notes: row.notes || '' }); setEditingId(row.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async id => { const answer = await Swal.fire({ title: 'Delete harvest record?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00' }); if (!answer.isConfirmed) return; try { await api.delete(`/crops/${seasonId}/yields/${id}`); toast.success('Harvest deleted'); await onSaved(); } catch (err) { toast.error(err.response?.data?.message || err.message); } };
  const totals = useMemo(() => Object.entries(summary?.harvestTotals || {}), [summary]);
  return <div className="crop-stage-screen">
    <StageSummary title="Total harvest" value={totals.length ? totals.map(([unit, value]) => `${Number(value).toLocaleString()} ${unit}`).join(' / ') : 'No quantity recorded'} badge={`${yields.length} harvests logged`} />
    <div className="crop-stage-columns">
      <StageForm title={editingId ? 'Edit Harvest Log' : 'Quick Harvest Log'} onSubmit={submit}>
        <StageSection title="Harvest & Timing"><div className="crop-stage-field-pair"><Select label="Harvest number" required value={form.harvestNumber} onChange={change('harvestNumber')}>{options.map(option => <option key={option}>{option}</option>)}<option>Custom</option></Select><Input label="Date" type="date" value={form.date} onChange={change('date')} /></div>{form.harvestNumber === 'Custom' && <Input label="Custom harvest number" value={form.customHarvest} onChange={change('customHarvest')} required />}</StageSection>
        <StageSection title="Production & Quantity"><div className="crop-stage-field-pair"><Select label="Unit" value={form.unit} onChange={change('unit')}><option value="">Select unit (optional)</option><option>Kg</option><option>Maund</option><option>Ton</option><option>Bags</option></Select><Input label={quantityLabel} type="number" min="0" step="0.01" value={form.quantity} onChange={change('quantity')} /></div>{form.unit === 'Bags' && <div className="crop-stage-field-pair"><Input label="Weight per bag (optional)" type="number" min="0" step="0.01" value={form.weightPerBag} onChange={change('weightPerBag')} /><Select label="Unit per bag" value={form.unitPerBag} onChange={change('unitPerBag')}><option>Kg</option><option>Maund</option></Select></div>}</StageSection>
        <StageSection title="Harvest Summary"><div className="crop-stage-entry-total"><div><span className="crop-stage-eyebrow">Entry production</span><small>{form.unit === 'Bags' ? `${form.quantity || 0} bags` : 'Recorded quantity'}</small></div><strong>{form.unit === 'Bags' ? `${calculatedProduction.toLocaleString()} ${form.unitPerBag}` : `${Number(form.quantity || 0).toLocaleString()} ${form.unit}`}</strong></div></StageSection>
        <details className="crop-stage-extras"><summary>Additional notes</summary><Textarea label="Notes" rows="2" value={form.notes} onChange={change('notes')} /></details>
        <StageSave saving={saving} editing={editingId} label="Harvest" onCancel={() => reset()} />
      </StageForm>
      <StageHistory title="Past harvest history" rows={yields} renderSubtitle={row => row.notes || 'Harvest production'} renderBreakdown={row => row.unit === 'Bags' ? `Weight per bag: ${row.weightPerBag || 0} ${row.unitPerBag || 'Kg'}` : 'Recorded production'} renderAmount={row => `${Number(row.totalProduction || 0).toLocaleString()} ${row.unit || ''}`} onEdit={edit} onDelete={remove} emptyMessage="No harvest records yet." />
    </div>
  </div>;
}
