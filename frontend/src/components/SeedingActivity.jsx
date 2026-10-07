import { useState } from 'react';
import api from '../lib/api';
import { Input, Textarea } from './ui';
import { StageForm, StageHistory, StageSave, StageSection, StageSummary, StageTotal, stageMoney } from './CropStageUI';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const blank = { date: '', title: '', quantity: '', unit: '', totalCost: '', notes: '' };

export default function SeedingActivity({ seasonId, activities, acres, onSaved }) {
  const rows = activities.filter(row => row.type === 'Seed / Sowing');
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const totalCost = rows.reduce((sum, row) => sum + Number(row.totalCost || 0), 0);
  const change = key => event => setForm(current => ({ ...current, [key]: event.target.value }));
  const reset = () => { setForm(blank); setEditingId(null); };
  const save = async event => {
    event.preventDefault(); setSaving(true);
    const payload = { ...form, type: 'Seed / Sowing', details: rows.find(row => row.id === editingId)?.details || {} };
    try {
      if (editingId) await api.put(`/crops/${seasonId}/activities/${editingId}`, payload);
      else await api.post(`/crops/${seasonId}/activities`, payload);
      toast.success(editingId ? 'Seeding entry updated' : 'Seeding entry saved');
      reset(); await onSaved();
    } catch (err) { Swal.fire({ icon: 'error', title: 'Could not save seeding entry', text: err.response?.data?.message || err.message, confirmButtonColor: '#305d28' }); }
    finally { setSaving(false); }
  };
  const edit = row => {
    setForm({ date: row.date || '', title: row.title || '', quantity: String(row.quantity ?? ''), unit: row.unit || '', totalCost: String(row.totalCost ?? ''), notes: row.notes || '' });
    setEditingId(row.id); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const remove = async id => {
    const answer = await Swal.fire({ title: 'Delete seeding entry?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#305d28' });
    if (!answer.isConfirmed) return;
    try { await api.delete(`/crops/${seasonId}/activities/${id}`); if (editingId === id) reset(); toast.success('Seeding entry deleted'); await onSaved(); }
    catch (err) { toast.error(err.response?.data?.message || err.message); }
  };
  return <div className="crop-stage-screen">
    <StageSummary title="Total seeding cost" value={stageMoney(totalCost)} hint={acres ? `Avg ${stageMoney(totalCost / acres)} / Acre` : 'No land area recorded'} badge={<>{rows.length} entries<small>Seed / Sowing</small></>} />
    <div className="crop-stage-columns">
      <StageForm title={editingId ? 'Edit Seeding Log' : 'Quick Seeding Log'} icon="Activities" onSubmit={save}>
        <StageSection title="Seed & Timing"><div className="crop-stage-field-pair"><Input label="Seed / variety" value={form.title} onChange={change('title')} required /><Input label="Date" type="date" value={form.date} onChange={change('date')} required /></div></StageSection>
        <StageSection title="Sowing Quantity"><div className="crop-stage-field-pair"><Input label="Quantity" type="number" min="0" step="0.01" value={form.quantity} onChange={change('quantity')} /><Input label="Unit" value={form.unit} onChange={change('unit')} placeholder="e.g. Kg, Bags" /></div></StageSection>
        <StageSection title="Cost Summary"><Input label="Total seeding cost (Rs.)" type="number" min="0" step="0.01" value={form.totalCost} onChange={change('totalCost')} required /><StageTotal total={form.totalCost} hint="Seed / Sowing expense" /></StageSection>
        <details className="crop-stage-extras"><summary>Additional notes</summary><Textarea label="Notes" rows="2" value={form.notes} onChange={change('notes')} /></details>
        <StageSave saving={saving} editing={editingId} total={form.totalCost} label="Seeding" onCancel={reset} />
      </StageForm>
      <StageHistory title="Past seeding history" rows={rows} renderSubtitle={row => row.notes || 'Seed / Sowing'} renderBreakdown={row => `${row.quantity || 0} ${row.unit || ''}`.trim()} onEdit={edit} onDelete={remove} emptyMessage="No seeding records yet." />
    </div>
  </div>;
}
