import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Input, LoadingState, SectionHeader, Table } from '../components/ui';
import toast from 'react-hot-toast';

const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;

export default function CropReports() {
  const navigate = useNavigate(); const [rows, setRows] = useState(null); const [query, setQuery] = useState('');
  useEffect(() => { api.get('/crops/reports').then(res => setRows(res.data.rows)).catch(err => toast.error(err.response?.data?.message || err.message)); }, []);
  const filtered = useMemo(() => (rows || []).filter(row => `${row.crop} ${row.field} ${row.season} ${row.status}`.toLowerCase().includes(query.toLowerCase())), [rows, query]);
  if (!rows) return <div className="mx-auto max-w-6xl"><LoadingState label="Loading crop reports..." /></div>;
  return <div className="mx-auto max-w-6xl"><SectionHeader title="Crop reports" subtitle="Crop-wise, field-wise, and season-wise financial performance." action={<Button variant="secondary" onClick={() => navigate('/crops')}>Back to crops</Button>} /><div className="mb-5 max-w-md"><Input label="Search crop, field, season or status" value={query} onChange={e => setQuery(e.target.value)} placeholder="e.g. Wheat, Field A, Rabi" /></div><Table rows={filtered} columns={[{ key: 'crop', label: 'Crop' }, { key: 'field', label: 'Field' }, { key: 'season', label: 'Season' }, { key: 'expenses', label: 'Expenses', render: row => money(row.expenses) }, { key: 'revenue', label: 'Revenue', render: row => money(row.revenue) }, { key: 'profit', label: 'Profit / loss', render: row => money(row.profit) }, { key: 'status', label: 'Status' }]} emptyMessage="No crop records match this filter." /></div>;
}
