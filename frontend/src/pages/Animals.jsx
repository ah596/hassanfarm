import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Card, Input, Select, SectionHeader, Table, StatCard } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function AnimalPhoto({ animal }) {
  return animal.image ? (
    <img src={animal.image} alt={animal.name || animal.animalId} className="h-12 w-12 rounded-xl object-cover" />
  ) : (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0faf0] text-xs font-semibold text-[#3a8a3a]">—</div>
  );
}

function MobileAnimalCard({ animal, onOpen, onEdit, onDelete }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const status = animal.status === 'Available' ? 'Healthy' : animal.status || 'Available';

  useEffect(() => {
    if (!open) return;
    const handler = e => { if (!menuRef.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [open]);

  return (
    <div className="animals-mobile-card">
      {/* clickable area */}
      <button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <AnimalPhoto animal={animal} />
        <div className="min-w-0 flex-1">
          <div className="animals-mobile-tag">TAG #{animal.animalId || '—'}</div>
          <div className="truncate text-sm font-bold text-[#102b20]">{animal.name || `${animal.breed || animal.type || 'Farm'} ${animal.type || ''}`}</div>
          <div className="mt-0.5 text-[10px] text-[#304f41]">Weight: {animal.weight ? `${animal.weight} Kg` : '—'}{animal.status ? ` · ${animal.status}` : ''}</div>
        </div>
        <span className={`animals-mobile-status ${status === 'Healthy' ? 'healthy' : 'attention'}`}>{status}</span>
      </button>

      {/* 3-dot menu */}
      <div ref={menuRef} className="relative ml-2 flex-shrink-0">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#876e2e] hover:bg-[#f0faf0] transition"
          aria-label="Options"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <circle cx="10" cy="4" r="1.5"/><circle cx="10" cy="10" r="1.5"/><circle cx="10" cy="16" r="1.5"/>
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-9 z-50 w-36 overflow-hidden rounded-xl border border-[#a8d8a8] bg-white shadow-lg">
            <button
              type="button"
              onClick={() => { setOpen(false); onEdit(); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-[#001e00] hover:bg-[#f0faf0] transition"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-[#3a8a3a]">
                <path d="M14.5 2.5a2.121 2.121 0 0 1 3 3L6 17l-4 1 1-4 11.5-11.5Z"/>
              </svg>
              Edit
            </button>
            <div className="mx-3 border-t border-[#e8f0e8]" />
            <button
              type="button"
              onClick={() => { setOpen(false); onDelete(); }}
              className="flex w-full items-center gap-2.5 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M3 5h14m-9 0V3h4v2m1 0v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5m2 4v5m4-5v5"/>
              </svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [filters, setFilters] = useState({ q: '', type: '', gender: '', status: '' });
  const navigate = useNavigate();

  const load = async params => {
    const res = await api.get('/animals', { params });
    setAnimals(res.data.animals);
  };

  useEffect(() => {
    load(filters);
  }, []);

  const apply = async () => load(filters);
  const remove = async id => {
    const result = await Swal.fire({ title: 'Delete Animal?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00', confirmButtonText: 'Yes, delete' });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/animals/${id}`);
      toast.success('Animal deleted successfully.');
      load(filters);
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' });
    }
  };

  const columns = [
    { key: 'image', label: 'Photo', render: row => <AnimalPhoto animal={row} /> },
    { key: 'animalId', label: 'Animal ID' },
    { key: 'type', label: 'Type' },
    { key: 'gender', label: 'Gender' },
    { key: 'breed', label: 'Breed' },
    { key: 'parentAnimalId', label: 'Mother', render: row => row.parentAnimalId ? `${row.parentName || 'Mother'} (${row.parentAnimalId})` : '—' },
    { key: 'status', label: 'Status' },
    { key: 'purchasePrice', label: 'Purchase Price', render: row => `Rs. ${Number(row.purchasePrice || 0).toLocaleString()}` },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(`/farm/animals/${row.id}`)}>View/Edit</Button>
          <Button variant="danger" onClick={() => remove(row.id)}>Delete</Button>
        </div>
      )
    }
  ];

  const goats = animals.filter(a => a.type === 'Goat');
  const mGoats = goats.filter(a => a.gender === 'Male').length;
  const fGoats = goats.filter(a => a.gender === 'Female').length;

  const cows = animals.filter(a => a.type === 'Cow');
  const mCows = cows.filter(a => a.gender === 'Male').length;
  const fCows = cows.filter(a => a.gender === 'Female').length;

  const sheep = animals.filter(a => a.type === 'Sheep');
  const mSheep = sheep.filter(a => a.gender === 'Male').length;
  const fSheep = sheep.filter(a => a.gender === 'Female').length;
  const searchSuggestions = useMemo(
    () => [...new Set(animals.flatMap(animal => [animal.name, animal.animalId, animal.breed]).filter(Boolean))],
    [animals]
  );
  const setMobileType = type => { const next = { ...filters, type }; setFilters(next); load(next); };
  const searchMobile = event => { const next = { ...filters, q: event.target.value }; setFilters(next); };

  return (
    <div className="space-y-6">
      <div className="animals-mobile-directory md:hidden">
        <div className="animals-mobile-search"><span>⌕</span><input value={filters.q} onChange={searchMobile} onKeyDown={event => { if (event.key === 'Enter') apply(); }} placeholder="Search by Tag ID or Breed..." /></div>
        <div className="animals-mobile-chips"><button className={!filters.type ? 'active' : ''} onClick={() => setMobileType('')}>All Animals</button><button className={filters.type === 'Cow' ? 'active' : ''} onClick={() => setMobileType('Cow')}>Cows</button><button className={filters.type === 'Goat' ? 'active' : ''} onClick={() => setMobileType('Goat')}>Goats</button><button className={filters.type === 'Sheep' ? 'active' : ''} onClick={() => setMobileType('Sheep')}>Sheeps</button></div>
        <div className="flex items-center justify-between"><h1>Livestock Directory</h1><span>{animals.length} Total</span></div>
        <div className="animals-mobile-list">{animals.length ? animals.map(animal => <MobileAnimalCard key={animal.id} animal={animal} onOpen={() => navigate(`/farm/animals/${animal.id}`)} onEdit={() => navigate(`/farm/animals/${animal.id}`)} onDelete={() => remove(animal.id)} />) : <div className="py-12 text-center text-sm text-[#6a8277]">No animals found.</div>}</div>
        <button className="animals-mobile-fab" onClick={() => navigate('/farm/animals/new')} aria-label="Add animal">+</button>
      </div>

      <div className="hidden md:block"><SectionHeader
        title="Animals"
        subtitle="Search and manage every cow, goat, or sheep in the farm."
        action={<Button onClick={() => navigate('/farm/animals/new')}>Add Animal</Button>}
      /></div>

      <div className="hidden grid-cols-3 gap-2 md:grid md:gap-4">
        <StatCard compact title="GOATS" value={goats.length} hint={`Male: ${mGoats} · Female: ${fGoats}`} />
        <StatCard compact title="COWS" value={cows.length} hint={`Male: ${mCows} · Female: ${fCows}`} />
        <StatCard compact title="SHEEP" value={sheep.length} hint={`Male: ${mSheep} · Female: ${fSheep}`} />
      </div>

      <Card className="hidden md:block">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          <div className="col-span-2 md:col-span-1">
            <Input label="Search" list="animal-search-suggestions" value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} />
            <datalist id="animal-search-suggestions">
              {searchSuggestions.map(suggestion => <option key={suggestion} value={suggestion} />)}
            </datalist>
          </div>
          <Select label="Type" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
            <option value="">All</option>
            <option value="Cow">Cow</option>
            <option value="Goat">Goat</option>
            <option value="Sheep">Sheep</option>
          </Select>
          <Select label="Gender" value={filters.gender} onChange={e => setFilters({ ...filters, gender: e.target.value })}>
            <option value="">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </Select>
          <Select label="Status" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="">All</option>
            <option value="Available">Available</option>
            <option value="Sold">Sold</option>
            <option value="Dead">Dead</option>
            <option value="Transferred">Transferred</option>
          </Select>
          <div className="flex items-end md:hidden">
            <Button className="w-full" onClick={apply}>Apply filters</Button>
          </div>
        </div>
        <div className="mt-4 hidden md:block">
          <Button onClick={apply}>Apply filters</Button>
        </div>
      </Card>

      <div className="hidden md:block"><Table columns={columns} rows={animals} emptyMessage="No animals found." /></div>
    </div>
  );
}
