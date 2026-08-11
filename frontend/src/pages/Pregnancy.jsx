import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { Button, Card, Input, SectionHeader, Select, Textarea, LoadingState } from '../components/ui';

const GESTATION_DAYS = { Cow: 283, Goat: 150 };
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
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [form, setForm] = useState({ breedingDate: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const eligibleAnimals = useMemo(() => animals.filter(a => a.gender === 'Female' && GESTATION_DAYS[a.type]), [animals]);
  const estimate = getEstimate(selectedAnimal?.type, form.breedingDate);

  useEffect(() => {
    api.get('/animals')
      .then(res => setAnimals(res.data.animals))
      .catch(err => setError(err.response?.data?.message || err.message))
      .finally(() => setLoading(false));
  }, []);

  const selectAnimal = async id => {
    setSelectedId(id);
    setSelectedAnimal(null);
    setError('');
    if (!id) return;
    try {
      const res = await api.get(`/animals/${id}`);
      setSelectedAnimal(res.data.animal);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const save = async event => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post(`/animals/${selectedId}/breeding`, form);
      setForm({ breedingDate: '', notes: '' });
      await selectAnimal(selectedId);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState label="Loading female animals..." />;

  return (
    <div className="space-y-6">
      <SectionHeader title="Pregnancy" subtitle="Select a saved female cow or goat and record breeding details." />

      <Card>
        <Select label="Select Female Animal" value={selectedId} onChange={event => selectAnimal(event.target.value)}>
          <option value="">Select animal</option>
          {eligibleAnimals.map(a => <option key={a.id} value={a.id}>{a.animalId} — {a.name || a.breed} ({a.type})</option>)}
        </Select>
        {!eligibleAnimals.length ? (
          <div className="mt-3 text-sm text-[#B3B3B3]">No female cows or goats have been saved yet. Add one from Animals first.</div>
        ) : null}
      </Card>

      {selectedAnimal ? (
        <>
          <Card>
            <div className="mb-4 grid gap-3 text-sm md:grid-cols-3">
              <div><span className="text-[#B3B3B3]">Animal</span><div className="mt-1 font-semibold text-[#2B2B2B]">{selectedAnimal.animalId} · {selectedAnimal.name || selectedAnimal.breed}</div></div>
              <div><span className="text-[#B3B3B3]">Animal Type</span><div className="mt-1 font-semibold text-[#2B2B2B]">{selectedAnimal.type}</div></div>
              <div><span className="text-[#B3B3B3]">Gestation Estimate</span><div className="mt-1 font-semibold text-[#2B2B2B]">{GESTATION_DAYS[selectedAnimal.type]} days</div></div>
            </div>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
              <Input label="Breeding / Crossing Date" type="date" value={form.breedingDate} onChange={event => setForm({ ...form, breedingDate: event.target.value })} required />
              {estimate ? (
                <div className="rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] p-4 text-sm">
                  <div className="text-[#B3B3B3]">Expected Birth Date</div>
                  <div className="mt-1 text-lg font-bold text-[#2B2B2B]">{displayDate(estimate.due)}</div>
                  <div className="mt-1 text-sm font-medium text-[#2B2B2B]">
                    {estimate.remainingDays > 0 ? `Expected Birth in ${estimate.remainingDays} Days` : estimate.remainingDays === 0 ? 'Due Today' : `Overdue by ${Math.abs(estimate.remainingDays)} Days`}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] p-4 text-sm text-[#B3B3B3]">
                  Expected birth date will appear after selecting a breeding date.
                </div>
              )}
              <div className="md:col-span-2">
                <Textarea label="Notes" rows="2" value={form.notes} onChange={event => setForm({ ...form, notes: event.target.value })} />
              </div>
              {error ? <div className="md:col-span-2 rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] px-4 py-3 text-sm text-[#2B2B2B]">{error}</div> : null}
              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save pregnancy record'}</Button>
              </div>
            </form>
          </Card>

          <Card>
            <div className="mb-4 text-lg font-bold text-[#2B2B2B]">Pregnancy History</div>
            <div className="space-y-3">
              {selectedAnimal.breedingHistory?.length ? [...selectedAnimal.breedingHistory].reverse().map(record => (
                <div key={record.id} className="grid gap-2 rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] p-4 text-sm md:grid-cols-4">
                  <div><span className="text-[#B3B3B3]">Breeding</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.breedingDate)}</div></div>
                  <div><span className="text-[#B3B3B3]">Expected Birth</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.expectedBirthDate)}</div></div>
                  <div><span className="text-[#B3B3B3]">Status</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{record.status}{record.remainingDays > 0 ? ` · ${record.remainingDays} days` : ''}</div></div>
                  <div><span className="text-[#B3B3B3]">Actual Birth</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.actualBirthDate)}</div></div>
                </div>
              )) : <div className="text-sm text-[#B3B3B3]">No pregnancy records for this animal yet.</div>}
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
