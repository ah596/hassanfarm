import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Card, Input, Select, SectionHeader, Table } from '../components/ui';

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
    if (!window.confirm('Delete this animal?')) return;
    await api.delete(`/animals/${id}`);
    load(filters);
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

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Animals"
        subtitle="Search and manage every cow, goat, or sheep in the farm."
        action={<Button onClick={() => navigate('/animals/new')}>Add Animal</Button>}
      />

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
