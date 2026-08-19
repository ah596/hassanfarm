import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { Button, Card, Input, SectionHeader, Select, Textarea, LoadingState } from '../components/ui';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const GESTATION_DAYS = { Cow: 283, Goat: 150, Sheep: 147 };
const displayDate = value => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString() : '—';

function getEstimate(type, breedingDate) {
  if (!type || !breedingDate) return null;
  const due = new Date(`${breedingDate}T00:00:00Z`);
  due.setUTCDate(due.getUTCDate() + GESTATION_DAYS[type]);
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return { due: due.toISOString().slice(0, 10), remainingDays: Math.ceil((due.getTime() - today) / 86400000) };
}

export default function Pregnancy() {
  const [animals, setAnimals] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [addForm, setAddForm] = useState({ breedingDate: '', pregnancyNumber: '1', notes: '' });
  // activePanel: { recordId, type: 'outcome' | 'edit' } — only one open at a time
  const [activePanel, setActivePanel] = useState(null);
  const [outcomeForm, setOutcomeForm] = useState({ outcome: 'Birth', outcomeDate: new Date().toISOString().slice(0, 10), babyName: '', babyGender: 'Female', notes: '' });
  const [editForm, setEditForm] = useState({ breedingDate: '', pregnancyNumber: '1', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const eligibleAnimals = useMemo(() => animals.filter(a => a.gender === 'Female' && GESTATION_DAYS[a.type]), [animals]);
  const selectedAnimal = eligibleAnimals.find(a => a.id === selectedId) || null;
  const shownAnimals = selectedAnimal ? [selectedAnimal] : eligibleAnimals;
  const pregnancyAnimals = useMemo(() => {
    const nextDue = a => Math.min(...(a.breedingHistory || []).filter(r => Number.isFinite(r.remainingDays)).map(r => r.remainingDays), Infinity);
    return shownAnimals.filter(a => a.breedingHistory?.length).sort((a, b) => nextDue(a) - nextDue(b));
  }, [shownAnimals]);
  const estimate = getEstimate(selectedAnimal?.type, addForm.breedingDate);

  useEffect(() => {
    api.get('/animals')
      .then(res => setAnimals(res.data.animals))
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const refreshAnimal = async animalId => {
    const res = await api.get(`/animals/${animalId}`);
    setAnimals(cur => cur.map(a => a.id === animalId ? res.data.animal : a));
  };

  const togglePanel = (recordId, type, record) => {
    if (activePanel?.recordId === recordId && activePanel?.type === type) {
      setActivePanel(null);
      return;
    }
    if (type === 'edit' && record) {
      setEditForm({ breedingDate: record.breedingDate || '', pregnancyNumber: String(record.pregnancyNumber || 1), notes: record.notes || '' });
    }
    if (type === 'outcome') {
      setOutcomeForm({ outcome: 'Birth', outcomeDate: new Date().toISOString().slice(0, 10), babyName: '', babyGender: 'Female', notes: '' });
    }
    setActivePanel({ recordId, type });
    setError('');
  };

  const saveOutcome = async (e, animal, record) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await api.post(`/animals/${animal.id}/breeding/${record.id}/outcome`, outcomeForm);
      await refreshAnimal(animal.id);
      toast.success(res.data.child ? `Baby ${res.data.child.animalId} created!` : 'Outcome saved.');
      setActivePanel(null);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  const saveEdit = async (e, animal, record) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await api.put(`/animals/${animal.id}/breeding/${record.id}`, editForm);
      await refreshAnimal(animal.id);
      toast.success('Record updated!');
      setActivePanel(null);
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  const deleteRecord = async (animal, record) => {
    const result = await Swal.fire({ title: 'Delete pregnancy record?', text: `Record dated ${displayDate(record.breedingDate)} for ${animal.name || animal.animalId}.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete', cancelButtonText: 'Cancel', confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00' });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/animals/${animal.id}/breeding/${record.id}`);
      await refreshAnimal(animal.id);
      toast.success('Record deleted.');
      if (activePanel?.recordId === record.id) setActivePanel(null);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' });
    }
  };

  const saveAdd = async e => {
    e.preventDefault();
    if (!selectedAnimal) return;
    setSaving(true); setError('');
    try {
      await api.post(`/animals/${selectedAnimal.id}/breeding`, addForm);
      await refreshAnimal(selectedAnimal.id);
      toast.success('Pregnancy record saved!');
      setAddForm({ breedingDate: '', pregnancyNumber: '1', notes: '' });
    } catch (err) { setError(err.response?.data?.message || err.message); }
    finally { setSaving(false); }
  };

  const ExpandedPanel = ({ animal, record }) => {
    const isOutcome = activePanel?.recordId === record.id && activePanel?.type === 'outcome';
    const isEdit = activePanel?.recordId === record.id && activePanel?.type === 'edit';
    if (!isOutcome && !isEdit) return null;

    if (isOutcome) return (
      <form className="mt-3 grid gap-3 rounded-xl border border-[#a8d8a8] bg-white p-3 text-sm md:grid-cols-2" onSubmit={e => saveOutcome(e, animal, record)}>
        <Select label="Birth status" value={outcomeForm.outcome} onChange={e => setOutcomeForm({ ...outcomeForm, outcome: e.target.value })}>
          <option value="Birth">Baby born</option>
          <option value="Abortion">Abortion</option>
          <option value="Stillbirth">Stillbirth</option>
        </Select>
        <Input label={outcomeForm.outcome === 'Birth' ? 'Date of birth' : 'Outcome date'} type="date" value={outcomeForm.outcomeDate} onChange={e => setOutcomeForm({ ...outcomeForm, outcomeDate: e.target.value })} required />
        {outcomeForm.outcome === 'Birth' ? <>
          <Input label="Baby name (optional)" value={outcomeForm.babyName} onChange={e => setOutcomeForm({ ...outcomeForm, babyName: e.target.value })} />
          <Select label="Baby gender" value={outcomeForm.babyGender} onChange={e => setOutcomeForm({ ...outcomeForm, babyGender: e.target.value })}>
            <option value="Female">Female</option><option value="Male">Male</option>
          </Select>
          <div className="md:col-span-2 rounded-xl bg-[#f0faf0] px-3 py-2 text-xs text-[#001e00]">A new tag and date of birth are created automatically.</div>
        </> : null}
        <div className="md:col-span-2"><Textarea label="Notes" rows="2" value={outcomeForm.notes} onChange={e => setOutcomeForm({ ...outcomeForm, notes: e.target.value })} /></div>
        {error ? <div className="md:col-span-2 text-sm text-red-700">{error}</div> : null}
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save birth status'}</Button>
          <Button type="button" variant="secondary" onClick={() => setActivePanel(null)}>Cancel</Button>
        </div>
      </form>
    );

    return (
      <form className="mt-3 grid gap-3 rounded-xl border border-[#a8d8a8] bg-white p-3 text-sm md:grid-cols-2" onSubmit={e => saveEdit(e, animal, record)}>
        <Input label="Breeding Date" type="date" value={editForm.breedingDate} onChange={e => setEditForm({ ...editForm, breedingDate: e.target.value })} required />
        <Select label="Pregnancy number" value={editForm.pregnancyNumber} onChange={e => setEditForm({ ...editForm, pregnancyNumber: e.target.value })}>
          <option value="1">First pregnancy</option><option value="2">Second pregnancy</option><option value="3">Third pregnancy</option><option value="4">Fourth pregnancy</option><option value="5">Fifth or later pregnancy</option>
        </Select>
        <div className="md:col-span-2"><Textarea label="Notes" rows="2" value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} /></div>
        {error ? <div className="md:col-span-2 text-sm text-red-700">{error}</div> : null}
        <div className="md:col-span-2 flex gap-2">
          <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Update record'}</Button>
          <Button type="button" variant="secondary" onClick={() => setActivePanel(null)}>Cancel</Button>
        </div>
      </form>
    );
  };

  if (loading) return <LoadingState label="Loading saved pregnancy records..." />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Pregnancy" subtitle="All saved pregnancy records are shown by default. Select one animal to view only its records or add a new one." />

      <Card>
        <Select label="Filter by Female Animal" value={selectedId} onChange={e => { setSelectedId(e.target.value); setActivePanel(null); setError(''); }}>
          <option value="">All saved animals</option>
          {eligibleAnimals.map(a => <option key={a.id} value={a.id}>{a.animalId} — {a.name || a.breed} ({a.type})</option>)}
        </Select>
        {!eligibleAnimals.length ? <div className="mt-3 text-sm text-[#B3B3B3]">No female cows, goats, or sheep have been saved yet.</div> : null}
      </Card>

      <Card>
        <div className="mb-4 text-lg font-bold text-[#2B2B2B]">Saved Pregnancy Records</div>
        <div className="space-y-5">
          {pregnancyAnimals.length ? pregnancyAnimals.map(animal => (
            <div key={animal.id} className="space-y-3">
              {[...animal.breedingHistory].sort((a, b) => (Number.isFinite(a.remainingDays) ? a.remainingDays : Infinity) - (Number.isFinite(b.remainingDays) ? b.remainingDays : Infinity)).map(record => (
                <div key={record.id}>
                  {/* Mobile */}
                  <div className="overflow-hidden rounded-2xl border border-[#d7ead7] bg-[#fbfefb] shadow-card md:hidden">
                    <div className="relative h-32 overflow-hidden bg-[#d6f0d6]">
                      {animal.image ? <img src={animal.image} alt={animal.name || animal.animalId} className="h-full w-full object-cover object-center" /> : <div className="flex h-full items-center justify-center text-sm font-medium text-[#3a8a3a]">No animal photo</div>}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#001e00]/75 via-transparent to-transparent" />
                      <div className="absolute left-3 top-3 flex gap-1.5 text-[9px] font-bold uppercase tracking-wide">
                        <span className="rounded-md bg-white/90 px-2 py-1 text-[#001e00]">{animal.animalId}</span>
                        <span className="rounded-md bg-[#d6f0d6]/95 px-2 py-1 text-[#001e00]">{animal.type}</span>
                      </div>
                      <div className="absolute inset-x-3 bottom-3 text-lg font-bold text-white">{animal.name || animal.breed || animal.animalId}</div>
                    </div>
                    <div className="space-y-1.5 p-2">
                      <div className="flex items-center justify-between gap-3 px-1 py-1">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-wide text-[#3a8a3a]">Current Status</div>
                          <div className="mt-0.5 text-sm font-bold text-[#001e00]">{record.status || 'Pregnant / Expecting'} · #{record.pregnancyNumber || 1}</div>
                        </div>
                        <div className="min-w-11 rounded-lg bg-[#f0faf0] px-2 py-1 text-center text-[#001e00]">
                          <div className="text-base font-bold">{record.remainingDays > 0 ? record.remainingDays : '—'}</div>
                          <div className="text-[8px] font-bold uppercase">Days</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-xl bg-white p-1.5"><div className="text-[9px] font-bold uppercase tracking-wide text-[#3a8a3a]">Breeding Date</div><div className="mt-0.5 font-bold text-[#001e00]">{displayDate(record.breedingDate)}</div></div>
                        <div className="rounded-xl bg-white p-1.5"><div className="text-[9px] font-bold uppercase tracking-wide text-[#3a8a3a]">Expected Birth</div><div className="mt-0.5 font-bold text-[#001e00]">{displayDate(record.expectedBirthDate)}</div></div>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-white px-2 py-1.5 text-sm">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-[#3a8a3a]">{record.outcome ? 'Outcome' : 'Actual Birth'}</span>
                        <span className="font-bold text-[#001e00]">{record.outcome ? `${record.outcome} · ${displayDate(record.outcomeDate)}` : displayDate(record.actualBirthDate)}</span>
                      </div>
                      {!record.outcome && !record.actualBirthDate ? (
                        <div className="space-y-2">
                          <Button className="w-full px-3 py-2" onClick={() => togglePanel(record.id, 'outcome', record)}>
                            {activePanel?.recordId === record.id && activePanel?.type === 'outcome' ? 'Cancel' : 'Birth Status'}
                          </Button>
                          <div className="flex gap-2">
                            <Button variant="secondary" className="flex-1 px-3 py-1.5" onClick={() => togglePanel(record.id, 'edit', record)}>
                              {activePanel?.recordId === record.id && activePanel?.type === 'edit' ? 'Cancel Edit' : 'Edit record'}
                            </Button>
                            <Button variant="danger" className="px-3 py-1.5" onClick={() => deleteRecord(animal, record)}>Delete</Button>
                          </div>
                          <ExpandedPanel animal={animal} record={record} />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] p-4 text-sm md:block">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {animal.image ? <img src={animal.image} alt={animal.name || animal.animalId} className="h-14 w-14 rounded-xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xs text-[#B3B3B3]">No photo</div>}
                        <div>
                          <div className="font-bold text-[#2B2B2B]">{animal.name || animal.animalId}</div>
                          <div className="text-sm text-[#B3B3B3]">{animal.breed || 'Breed not recorded'} · {animal.animalId} · {animal.type}</div>
                        </div>
                      </div>
                      {!record.outcome && !record.actualBirthDate ? (
                        <div className="flex gap-2">
                          <Button className="px-3 py-2" onClick={() => togglePanel(record.id, 'outcome', record)}>
                            {activePanel?.recordId === record.id && activePanel?.type === 'outcome' ? 'Cancel' : 'Birth Status'}
                          </Button>
                          <Button variant="secondary" className="px-3 py-2" onClick={() => togglePanel(record.id, 'edit', record)}>
                            {activePanel?.recordId === record.id && activePanel?.type === 'edit' ? 'Cancel Edit' : 'Edit'}
                          </Button>
                          <Button variant="danger" className="px-3 py-2" onClick={() => deleteRecord(animal, record)}>Delete</Button>
                        </div>
                      ) : null}
                    </div>
                    <div className="grid gap-2 md:grid-cols-4">
                      <div><span className="text-[#B3B3B3]">Breeding · Pregnancy #{record.pregnancyNumber || 1}</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.breedingDate)}</div></div>
                      <div><span className="text-[#B3B3B3]">Expected Birth</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.expectedBirthDate)}</div></div>
                      <div><span className="text-[#B3B3B3]">Status</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{record.status || 'Pregnant / Expecting'}{record.remainingDays > 0 ? ` · ${record.remainingDays} days` : ''}</div></div>
                      <div><span className="text-[#B3B3B3]">{record.outcome ? 'Outcome' : 'Actual Birth'}</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{record.outcome ? `${record.outcome} · ${displayDate(record.outcomeDate)}` : displayDate(record.actualBirthDate)}</div></div>
                    </div>
                    <ExpandedPanel animal={animal} record={record} />
                  </div>
                </div>
              ))}
            </div>
          )) : <div className="text-sm text-[#B3B3B3]">{selectedAnimal ? 'No pregnancy records for this animal yet.' : 'No saved pregnancy records yet.'}</div>}
        </div>
      </Card>

      {selectedAnimal ? (
        <Card>
          <div className="mb-4 text-lg font-bold text-[#2B2B2B]">Add pregnancy record for {selectedAnimal.name || selectedAnimal.animalId}</div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={saveAdd}>
            <Input label="Breeding / Crossing Date" type="date" value={addForm.breedingDate} onChange={e => setAddForm({ ...addForm, breedingDate: e.target.value })} required />
            <div className="rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] p-4 text-sm">
              <div className="text-[#B3B3B3]">Expected Birth Date</div>
              <div className="mt-1 text-lg font-bold text-[#2B2B2B]">{estimate ? displayDate(estimate.due) : '—'}</div>
              {estimate ? <div className="mt-1 font-medium text-[#2B2B2B]">{estimate.remainingDays > 0 ? `Expected Birth in ${estimate.remainingDays} Days` : estimate.remainingDays === 0 ? 'Due Today' : `Overdue by ${Math.abs(estimate.remainingDays)} Days`}</div> : null}
            </div>
            <Select label="Pregnancy number" value={addForm.pregnancyNumber} onChange={e => setAddForm({ ...addForm, pregnancyNumber: e.target.value })}>
              <option value="1">First pregnancy</option><option value="2">Second pregnancy</option><option value="3">Third pregnancy</option><option value="4">Fourth pregnancy</option><option value="5">Fifth or later pregnancy</option>
            </Select>
            <div className="md:col-span-2"><Textarea label="Notes" rows="2" value={addForm.notes} onChange={e => setAddForm({ ...addForm, notes: e.target.value })} /></div>
            {error ? <div className="md:col-span-2 text-sm text-red-700">{error}</div> : null}
            <div className="md:col-span-2"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save pregnancy record'}</Button></div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
