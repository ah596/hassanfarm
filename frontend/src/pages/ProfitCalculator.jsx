import { useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { Card, Select, SectionHeader } from '../components/ui';

export default function ProfitCalculator() {
  const [animals, setAnimals] = useState([]);
  const [selected, setSelected] = useState('');
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    api.get('/animals').then(res => {
      setAnimals(res.data.animals);
      if (res.data.animals[0]) setSelected(res.data.animals[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    api.get(`/animals/${selected}/summary`).then(res => setSummary(res.data));
  }, [selected]);

  const selectedAnimal = useMemo(() => animals.find(item => item.id === selected), [animals, selected]);

  return (
    <div className="space-y-6">
      <SectionHeader title="Profit Calculator" subtitle="Select an animal to see profit/loss instantly." />
      <Card className="max-w-xl">
        <Select label="Choose Animal" value={selected} onChange={e => setSelected(e.target.value)}>
          {animals.map(animal => (
            <option key={animal.id} value={animal.id}>{animal.animalId} · {animal.breed}</option>
          ))}
        </Select>
      </Card>

      {selectedAnimal && summary ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card><div className="text-sm text-[#3a8a3a]">Animal</div><div className="mt-2 text-xl font-bold text-[#001e00]">{selectedAnimal.animalId}</div></Card>
          <Card><div className="text-sm text-[#3a8a3a]">Total Investment</div><div className="mt-2 text-xl font-bold text-[#001e00]">Rs. {Number(summary.totalInvestment || 0).toLocaleString()}</div></Card>
          <Card><div className="text-sm text-[#3a8a3a]">Sale Price</div><div className="mt-2 text-xl font-bold text-[#001e00]">Rs. {Number(summary.salePrice || 0).toLocaleString()}</div></Card>
          <Card><div className="text-sm text-[#3a8a3a]">Net Result</div><div className="mt-2 text-xl font-bold text-[#001e00]">Rs. {Number(summary.netProfit || 0).toLocaleString()}</div></Card>
        </div>
      ) : null}
    </div>
  );
}
