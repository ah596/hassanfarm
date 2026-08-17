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
  const [form, setForm] = useState({ breedingDate: '', notes: '' });
  const [editingRecord, setEditingRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const eligibleAnimals = useMemo(() => animals.filter(animal => animal.gender === 'Female' && GESTATION_DAYS[animal.type]), [animals]);
  const selectedAnimal = eligibleAnimals.find(animal => animal.id === selectedId) || null;
  const shownAnimals = selectedAnimal ? [selectedAnimal] : eligibleAnimals;
  const pregnancyAnimals = shownAnimals.filter(animal => animal.breedingHistory?.length);
  const estimate = getEstimate(selectedAnimal?.type, form.breedingDate);

  useEffect(() => {
    api.get('/animals')
      .then(res => setAnimals(res.data.animals))
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectAnimal = event => {
    setSelectedId(event.target.value);
    setForm({ breedingDate: '', notes: '' });
    setEditingRecord(null);
    setError('');
  };

  const refreshAnimal = async animalId => {
    const res = await api.get(`/animals/${animalId}`);
    setAnimals(current => current.map(animal => animal.id === animalId ? res.data.animal : animal));
  };

  const editRecord = (animal, record) => {
    setSelectedId(animal.id);
    setForm({ breedingDate: record.breedingDate || '', notes: record.notes || '' });
    setEditingRecord({ animalId: animal.id, recordId: record.id });
    setError('');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const deleteRecord = async (animal, record) => {
    const result = await Swal.fire({
      title: 'Delete pregnancy record?',
      text: `This will remove the record dated ${displayDate(record.breedingDate)} for ${animal.name || animal.animalId}.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#b91c1c',
      cancelButtonColor: '#001e00'
    });
    if (!result.isConfirmed) return;

    setError('');
    try {
      await api.delete(`/animals/${animal.id}/breeding/${record.id}`);
      await refreshAnimal(animal.id);
      toast.success('Pregnancy record deleted.');
      if (editingRecord?.recordId === record.id) {
        setEditingRecord(null);
        setForm({ breedingDate: '', notes: '' });
      }
    } catch (err) {
      const message = err.response?.data?.message || err.message;
      setError(message);
      Swal.fire({ icon: 'error', title: 'Could not delete record', text: message, confirmButtonColor: '#001e00' });
    }
  };

  const save = async event => {
    event.preventDefault();
    if (!selectedAnimal) return;
    setSaving(true);
    setError('');
    try {
      if (editingRecord) {
        await api.put(`/animals/${selectedAnimal.id}/breeding/${editingRecord.recordId}`, form);
      } else {
        await api.post(`/animals/${selectedAnimal.id}/breeding`, form);
      }
      await refreshAnimal(selectedAnimal.id);
      setForm({ breedingDate: '', notes: '' });
      setEditingRecord(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading saved pregnancy records..." />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Pregnancy" subtitle="All saved pregnancy records are shown by default. Select one animal to view only its records or add a new one." />

      <Card>
        <Select label="Filter by Female Animal" value={selectedId} onChange={selectAnimal}>
          <option value="">All saved animals</option>
          {eligibleAnimals.map(animal => <option key={animal.id} value={animal.id}>{animal.animalId} — {animal.name || animal.breed} ({animal.type})</option>)}
        </Select>
        {!eligibleAnimals.length ? <div className="mt-3 text-sm text-[#B3B3B3]">No female cows, goats, or sheep have been saved yet.</div> : null}
      </Card>

      {error && !selectedAnimal ? <Card><div className="text-sm text-red-700">{error}</div></Card> : null}

      <Card>
        <div className="mb-4 text-lg font-bold text-[#2B2B2B]">Saved Pregnancy Records</div>
        <div className="space-y-5">
          {pregnancyAnimals.length ? pregnancyAnimals.map(animal => (
            <div key={animal.id} className="space-y-3">
                {[...animal.breedingHistory].reverse().map(record => (
                  <div key={record.id} className="space-y-3">
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
                          <div className="mt-0.5 text-sm font-bold text-[#001e00]">{record.status || 'Pregnant / Expecting'}</div>
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
                        <span className="text-[9px] font-bold uppercase tracking-wide text-[#3a8a3a]">Actual Birth</span>
                        <span className="font-bold text-[#001e00]">{displayDate(record.actualBirthDate)}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button className="flex-1 px-3 py-1.5" onClick={() => editRecord(animal, record)}>✎&nbsp; Edit Record</Button>
                        <Button variant="danger" className="px-3 py-1.5" onClick={() => deleteRecord(animal, record)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                  <div className="hidden rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] p-4 text-sm md:block">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {animal.image ? <img src={animal.image} alt={animal.name || animal.animalId} className="h-14 w-14 rounded-xl object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-xs text-[#B3B3B3]">No photo</div>}
                        <div>
                          <div className="font-bold text-[#2B2B2B]">{animal.name || animal.animalId}</div>
                          <div className="text-sm text-[#B3B3B3]">{animal.breed || 'Breed not recorded'} · {animal.animalId} · {animal.type}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" className="px-3 py-2" onClick={() => editRecord(animal, record)}>Edit</Button>
                        <Button variant="danger" className="px-3 py-2" onClick={() => deleteRecord(animal, record)}>Delete</Button>
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-4">
                      <div><span className="text-[#B3B3B3]">Breeding</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.breedingDate)}</div></div>
                      <div><span className="text-[#B3B3B3]">Expected Birth</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.expectedBirthDate)}</div></div>
                      <div><span className="text-[#B3B3B3]">Status</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{record.status || 'Pregnant / Expecting'}{record.remainingDays > 0 ? ` · ${record.remainingDays} days` : ''}</div></div>
                      <div><span className="text-[#B3B3B3]">Actual Birth</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.actualBirthDate)}</div></div>
                    </div>
                  </div>
                  </div>
                ))}
            </div>
          )) : <div className="text-sm text-[#B3B3B3]">{selectedAnimal ? 'No pregnancy records for this animal yet.' : 'No saved pregnancy records yet.'}</div>}
        </div>
      </Card>

      {selectedAnimal ? (
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="text-lg font-bold text-[#2B2B2B]">{editingRecord ? 'Edit' : 'Add'} pregnancy record for {selectedAnimal.name || selectedAnimal.animalId}</div>
            {editingRecord ? <Button type="button" variant="secondary" onClick={() => { setEditingRecord(null); setForm({ breedingDate: '', notes: '' }); }}>Cancel edit</Button> : null}
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
            <Input label="Breeding / Crossing Date" type="date" value={form.breedingDate} onChange={event => setForm({ ...form, breedingDate: event.target.value })} required />
            <div className="rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] p-4 text-sm">
              <div className="text-[#B3B3B3]">Expected Birth Date</div>
              <div className="mt-1 text-lg font-bold text-[#2B2B2B]">{estimate ? displayDate(estimate.due) : '—'}</div>
              {estimate ? <div className="mt-1 font-medium text-[#2B2B2B]">{estimate.remainingDays > 0 ? `Expected Birth in ${estimate.remainingDays} Days` : estimate.remainingDays === 0 ? 'Due Today' : `Overdue by ${Math.abs(estimate.remainingDays)} Days`}</div> : null}
            </div>
            <div className="md:col-span-2"><Textarea label="Notes" rows="2" value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} /></div>
            {error ? <div className="md:col-span-2 text-sm text-red-700">{error}</div> : null}
            <div className="md:col-span-2"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingRecord ? 'Update pregnancy record' : 'Save pregnancy record'}</Button></div>
          </form>
        </Card>
      ) : null}
    </div>
  );
}
