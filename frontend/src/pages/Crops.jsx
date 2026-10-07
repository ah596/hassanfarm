import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Button, Card, EmptyState, Input, LoadingState, SectionHeader, Select, Textarea } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const crops = [['Rice', 'Chawal'], ['Wheat', 'Gandum'], ['Cotton', 'Kapas'], ['Sugarcane', 'Ganna'], ['Maize', 'Makai'], ['Other Crop', 'Other']];
const blank = name => ({ cropName: name === 'Other Crop' ? '' : name, variety: '', season: String(new Date().getFullYear()), fieldName: '', totalArea: '', areaUnit: 'Acre', sowingDate: '', expectedHarvestDate: '', landOwnership: 'Own', rentCost: '0', notes: '', status: 'Planned' });

function CropIcon({ name }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'Other Crop' ? <path d="M12 6v12M6 12h12" /> : name === 'Cotton' ? <><path d="M9 15a4 4 0 1 1-3-7 4 4 0 0 1 7-3 4 4 0 0 1 5 6 4 4 0 0 1-4 4Z"/><path d="M12 15v6m-4-4 4 2 4-2"/></> : name === 'Sugarcane' ? <><path d="M9 22V7m6 15V4M6 10h6m0-3h6M6 15h6m0-3h6M6 20h6m0-3h6M9 7 5 3m10 1 4-2"/></> : <><path d="M12 22V5M12 14C7 14 5 11 5 8c4 0 7 2 7 6Zm0 4c5 0 7-3 7-6-4 0-7 2-7 6Zm0-8c4 0 6-3 6-6-4 0-6 2-6 6Z"/></>}
  </svg>;
}

export default function Crops() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [seasons, setSeasons] = useState([]); const [loading, setLoading] = useState(true); const [form, setForm] = useState(blank('')); const [saving, setSaving] = useState(false);
  const selected = searchParams.get('new') || '';
  const [sortOrder, setSortOrder] = useState('recent');
  const sortedSeasons = useMemo(() => [...seasons].sort((a, b) => sortOrder === 'name' ? a.cropName.localeCompare(b.cropName) : String(b.createdAt || '').localeCompare(String(a.createdAt || ''))), [seasons, sortOrder]);
  const load = async () => { setLoading(true); try { setSeasons((await api.get('/crops')).data.seasons); } catch (err) { toast.error(err.response?.data?.message || err.message); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const counts = useMemo(() => seasons.reduce((map, item) => ({ ...map, [item.cropName]: (map[item.cropName] || 0) + 1 }), {}), [seasons]);
  const field = key => event => setForm(value => ({ ...value, [key]: event.target.value }));
  const openSetup = name => { setSearchParams({ new: name }); setForm(blank(name)); };
  const submit = async event => { event.preventDefault(); setSaving(true); try { const response = await api.post('/crops', form); toast.success('Crop season created'); navigate(`/crops/${response.data.season.id}`); } catch (err) { Swal.fire({ icon: 'error', title: 'Could not save crop season', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' }); } finally { setSaving(false); } };
  if (selected) return <div className="crop-management crop-season-setup mx-auto max-w-5xl"><SectionHeader title={`New ${selected} season`} subtitle="Keep each crop, field, and season as a separate record." /><Card><form className="grid gap-4 md:grid-cols-3" onSubmit={submit}>
    {selected === 'Other Crop' ? <Input label="Crop name" value={form.cropName} onChange={field('cropName')} required /> : <Input label="Crop name" value={form.cropName} readOnly required />}
    <Input label="Variety / seed type" value={form.variety} onChange={field('variety')} /><Input label="Season / year" value={form.season} onChange={field('season')} placeholder="Rabi 2026" required /><Input label="Field / land name (optional)" value={form.fieldName} onChange={field('fieldName')} />
    <Input label="Total area" type="number" min="0.01" step="0.01" value={form.totalArea} onChange={field('totalArea')} required /><Select label="Area unit" required value={form.areaUnit} onChange={field('areaUnit')}><option>Acre</option><option>Kanal</option><option>Marla</option></Select><Input label="Sowing date" type="date" value={form.sowingDate} onChange={field('sowingDate')} /><Input label="Expected harvest date" type="date" value={form.expectedHarvestDate} onChange={field('expectedHarvestDate')} />
    <Select label="Land ownership" value={form.landOwnership} onChange={field('landOwnership')}><option>Own</option><option>Rented / Theka</option></Select>{form.landOwnership === 'Rented / Theka' ? <Input label="Rent / theka cost" type="number" min="0" value={form.rentCost} onChange={field('rentCost')} /> : null}<Select label="Status" value={form.status} onChange={field('status')}><option>Planned</option><option>Active</option><option>Harvested</option><option>Sold</option><option>Closed</option></Select>
    <div className="md:col-span-3"><Textarea label="Notes" rows="3" value={form.notes} onChange={field('notes')} /></div><div className="md:col-span-3"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create crop season'}</Button></div>
  </form></Card></div>;
  return <div className="crop-management crop-canvas mx-auto max-w-6xl">
    <div className="crop-canvas-heading">
      <h1>Crop Management</h1>
      <p>Manage crops from land preparation through harvest and final sale.</p>
    </div>
    <div className="crop-type-grid">
      {crops.map(([name, local]) => <button key={name} type="button" onClick={() => openSetup(name)} className="crop-type-card">
        <div className="crop-tile-top"><span>{local}</span><span className={`crop-tile-icon crop-icon-${name.toLowerCase().replaceAll(' ', '-')}`}><CropIcon name={name}/></span></div>
        <strong>{name}</strong>
        <div className="crop-tile-bottom"><span>{name === 'Other Crop' ? seasons.filter(item => !crops.slice(0, -1).some(([known]) => known === item.cropName)).length : counts[name] || 0} seasons</span></div>
      </button>)}
    </div>
    <Button className="crop-custom-action" onClick={() => openSetup('Other Crop')}><span aria-hidden="true">+</span>Add custom crop</Button>
    <section className="crop-saved-section">
      <div className="crop-saved-heading"><h2>Saved crop seasons <span className="crop-season-count">{seasons.length}</span></h2>
        <label className="crop-sort"><span>Sort:</span><select aria-label="Sort crop seasons" value={sortOrder} onChange={event => setSortOrder(event.target.value)}><option value="recent">Recent</option><option value="name">Name</option></select></label>
      </div>
      {loading ? <LoadingState label="Loading crop seasons..." /> : !seasons.length ? <EmptyState title="No crop seasons yet" description="Select one of the crop cards above to start your first record." /> : <div className="crop-saved-grid">
        {sortedSeasons.map(item => <article key={item.id} className="crop-saved-card">
          <div className="crop-saved-body">
            <div className="crop-saved-title"><h3>{item.cropName} {item.variety ? <small>({item.variety})</small> : null}</h3><span className="crop-status"><i/>{item.status}</span></div>
            <p className="crop-season-subtitle">{item.fieldName ? `${item.fieldName} ? ` : ''}Year: {item.season}</p>
            <div className="crop-saved-facts"><div><span>Area</span><b>{item.totalArea} {item.areaUnit}</b></div><div><span>Stage</span><b>{item.stage || item.status}</b></div><div><span>Health</span><b className={item.health ? 'crop-health' : ''}>{item.health || 'Not recorded'}</b></div></div>
          </div>
          <Button onClick={() => navigate(`/crops/${item.id}`)}>Open dashboard <span aria-hidden="true">&rarr;</span></Button>
        </article>)}
      </div>}
    </section>
  </div>;
}
