import { useMemo, useState } from 'react';
import api from '../lib/api';
import { Input, Select, Textarea } from './ui';
import { StageForm, StageHistory, StageSave, StageSection, StageSummary, StageTotal } from './CropStageUI';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const fertilizerTypes = ['DAP', 'Urea', 'SOP', 'MOP', 'NP', 'NPK', 'Zinc', 'Potash', 'Gypsum', 'Other', 'Custom'];
const blank = { date: '', fertilizerType: 'DAP', customFertilizerType: '', applicationNumber: '1st Application', customApplication: '', bags: '', weightPerBag: '', pricePerBag: '', labourCost: '0', notes: '' };
const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function FertilizerActivity({ seasonId, activities, summary, acres, onSaved }) {
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const change = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  const fertilizerCost = useMemo(() => (Number(form.bags) || 0) * (Number(form.pricePerBag) || 0), [form.bags, form.pricePerBag]);
  const totalExpense = fertilizerCost + (Number(form.labourCost) || 0);
  const fertilizerRows = activities.filter(item => item.type === 'Fertilizer');
  const resolvedType = form.fertilizerType === 'Custom' ? form.customFertilizerType : form.fertilizerType;
  const payload = { type: 'Fertilizer', date: form.date, title: resolvedType, quantity: form.bags, unit: 'Bags', totalCost: totalExpense, notes: form.notes, details: { productName: resolvedType, fertilizerType: resolvedType, applicationNumber: form.applicationNumber === 'Custom' ? form.customApplication : form.applicationNumber, bags: form.bags, weightPerBag: form.weightPerBag, pricePerBag: form.pricePerBag, labourCost: form.labourCost } };
  const reset = () => { setForm(blank); setEditingId(null); };
  const submit = async event => {
    event.preventDefault(); setSaving(true);
    try { if (editingId) await api.put(`/crops/${seasonId}/activities/${editingId}`, payload); else await api.post(`/crops/${seasonId}/activities`, payload); toast.success(editingId ? 'Fertilizer entry updated' : 'Fertilizer entry saved'); reset(); await onSaved(); }
    catch (err) { Swal.fire({ icon: 'error', title: 'Could not save fertilizer', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' }); }
    finally { setSaving(false); }
  };
  const edit = row => { const detail = row.details || {}; const ft = detail.fertilizerType || 'Other'; const knownTypes = fertilizerTypes.filter(t => t !== 'Custom'); const isCustom = !knownTypes.includes(ft); setForm({ date: row.date, fertilizerType: isCustom ? 'Custom' : ft, customFertilizerType: isCustom ? ft : '', applicationNumber: ['1st Application', '2nd Application', '3rd Application'].includes(detail.applicationNumber) ? detail.applicationNumber : 'Custom', customApplication: ['1st Application', '2nd Application', '3rd Application'].includes(detail.applicationNumber) ? '' : detail.applicationNumber || '', bags: String(detail.bags ?? row.quantity ?? ''), weightPerBag: String(detail.weightPerBag ?? ''), pricePerBag: String(detail.pricePerBag ?? ''), labourCost: String(detail.labourCost ?? 0), notes: row.notes || '' }); setEditingId(row.id); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const remove = async id => { const answer = await Swal.fire({ title: 'Delete fertilizer entry?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00' }); if (!answer.isConfirmed) return; try { await api.delete(`/crops/${seasonId}/activities/${id}`); toast.success('Fertilizer entry deleted'); onSaved(); } catch (err) { toast.error(err.response?.data?.message || err.message); } };
  return <div className="crop-stage-screen">
    <StageSummary title="Total fertilizer cost" value={money(summary?.totalCost)} hint={acres ? `Avg ${money(Number(summary?.totalCost || 0) / acres)} / Acre` : 'No land area recorded'} badge={<>{summary?.applications || 0} applications<small>{summary?.totalBags || 0} bags used</small></>} />
    <div className="crop-stage-columns">
      <StageForm title={editingId ? 'Edit Fertilizer Log' : 'Quick Fertilizer Log'} onSubmit={submit}>
        <StageSection title="Application & Timing"><div className="crop-stage-field-pair"><Select label="Application number" required value={form.applicationNumber} onChange={change('applicationNumber')}><option>1st Application</option><option>2nd Application</option><option>3rd Application</option><option>Custom</option></Select><Input label="Date" type="date" value={form.date} onChange={change('date')} required /></div>{form.applicationNumber === 'Custom' && <Input label="Custom application name" value={form.customApplication} onChange={change('customApplication')} required />}</StageSection>
        <StageSection title="Fertilizer & Quantity"><Select label="Fertilizer type" value={form.fertilizerType} onChange={change('fertilizerType')}>{fertilizerTypes.map(type => <option key={type}>{type}</option>)}</Select>{form.fertilizerType === 'Custom' && <Input label="Custom fertilizer name" value={form.customFertilizerType} onChange={change('customFertilizerType')} required />}<div className="crop-stage-product-chips">{fertilizerTypes.slice(0, 6).map(type => <button type="button" key={type} onClick={() => setForm(current => ({ ...current, fertilizerType: type }))}>{type}</button>)}</div><div className="crop-stage-field-pair"><Input label="Number of bags" type="number" min="0" step="0.01" value={form.bags} onChange={change('bags')} required /><Input label="Weight per bag (Kg)" type="number" min="0" step="0.01" value={form.weightPerBag} onChange={change('weightPerBag')} /></div></StageSection>
        <StageSection title="Cost Summary"><div className="crop-stage-field-pair"><Input label="Price per bag (Rs.)" type="number" min="0" step="0.01" value={form.pricePerBag} onChange={change('pricePerBag')} required /><Input label="Labour cost (Rs.)" type="number" min="0" step="0.01" value={form.labourCost} onChange={change('labourCost')} /></div><StageTotal total={totalExpense} hint={`Fertilizer ${money(fertilizerCost)} + Labour`} /></StageSection>
        <details className="crop-stage-extras"><summary>Additional notes</summary><Textarea label="Notes" rows="2" value={form.notes} onChange={change('notes')} /></details>
        <StageSave saving={saving} editing={editingId} total={totalExpense} label="Fertilizer" onCancel={reset} />
      </StageForm>
      <StageHistory title="Past fertilizer history" rows={fertilizerRows} renderSubtitle={row => `${row.details?.bags || row.quantity || 0} bags${row.details?.weightPerBag ? ` / ${row.details.weightPerBag} Kg per bag` : ''}`} renderBreakdown={row => `Price / bag: ${money(row.details?.pricePerBag)} / Labour: ${money(row.details?.labourCost)}`} onEdit={edit} onDelete={remove} emptyMessage="No fertilizer applications yet." />
    </div>
  </div>;
}
