import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Card, Input, Select, SectionHeader, Table, StatCard } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

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
    { key: 'animalId', label: 'Animal ID' },
    { key: 'type', label: 'Type' },
    { key: 'gender', label: 'Gender' },
    { key: 'breed', label: 'Breed' },
    { key: 'status', label: 'Status' },
    { key: 'purchasePrice', label: 'Purchase Price', render: row => `Rs. ${Number(row.purchasePrice || 0).toLocaleString()}` },
    {
      key: 'actions',
      label: 'Actions',
      render: row => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate(`/animals/${row.id}`)}>View/Edit</Button>
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

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Animals"
        subtitle="Search and manage every cow, goat, or sheep in the farm."
        action={<Button onClick={() => navigate('/animals/new')}>Add Animal</Button>}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard title="GOATS" value={goats.length} hint={`Male: ${mGoats} · Female: ${fGoats}`} />
        <StatCard title="COWS" value={cows.length} hint={`Male: ${mCows} · Female: ${fCows}`} />
        <StatCard title="SHEEP" value={sheep.length} hint={`Male: ${mSheep} · Female: ${fSheep}`} />
      </div>

      <Card>
        <div className="grid gap-4 md:grid-cols-4">
          <Input label="Search" value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} />
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
        </div>
        <div className="mt-4">
          <Button onClick={apply}>Apply filters</Button>
        </div>
      </Card>

      <Table columns={columns} rows={animals} emptyMessage="No animals found." />
    </div>
  );
}
