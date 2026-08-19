import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../lib/api';
import { Button, Card, Input, LoadingState, SectionHeader, Select, StatCard, Table, Textarea } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import FertilizerActivity from '../components/FertilizerActivity';
import SprayActivity from '../components/SprayActivity';
import PesticideActivity from '../components/PesticideActivity';
import HarvestingActivity from '../components/HarvestingActivity';

const landActivities = ['Haal / Ploughing', 'Rotavator / Roter', 'Disc', 'Khalain / Ridger', 'Laser Leveling', 'Kadu / Cultivator', 'Suhaga / Planker', 'Bed Maker', 'Other / Custom Activity'];
const activityTypes = ['Seed / Sowing', 'Irrigation', 'Labour', 'Machinery', 'Other Expense', 'Harvesting'];
const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;
const genericBlank = { type: 'Fertilizer', date: '', title: '', quantity: '', unit: '', totalCost: '', notes: '' };
const yieldBlank = { date: '', harvestNumber: '1st Harvest', totalProduction: '', unit: 'Maund', bags: '0', weightPerBag: '0', quality: '', moisture: '', storedQuantity: '0', soldQuantity: '0', notes: '' };
const toKg = { Kg: 1, Maund: 40, Ton: 1000 };
const calcKaat = (qty, unit, wpb, applyKaat, deductKg, perKg) => {
  const totalKg = unit === 'Bags' ? Number(qty) * Number(wpb) : Number(qty) * (toKg[unit] || 1);
  const kaatKg = applyKaat && totalKg > 0 ? (totalKg / (Number(perKg) || 50)) * (Number(deductKg) || 1) : 0;
  const finalKg = totalKg - kaatKg;
  const finalQty = unit === 'Bags' ? finalKg / (Number(wpb) || 1) : unit === 'Kg' ? finalKg : finalKg / (toKg[unit] || 1);
  return { totalKg, kaatKg, finalKg, finalQty };
};
const saleBlank = { saleDate: '', buyerName: '', unit: 'Maund', quantitySold: '', weightPerBag: '', ratePerUnit: '', applyKaat: false, kaatDeductionKg: '1', kaatPerKg: '50', notes: '' };

export default function CropDashboard() {
  const { seasonId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tab, setTab] = useState('Overview');
  const [editingId, setEditingId] = useState(null);
  const [land, setLand] = useState(null);
  const [generic, setGeneric] = useState(genericBlank);
  const [saleForm, setSaleForm] = useState(saleBlank);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { setData((await api.get(`/crops/${seasonId}/dashboard`)).data); }
    catch (err) { toast.error(err.response?.data?.message || err.message); }
  };
  useEffect(() => { load(); }, [seasonId]);
  const landBlank = season => ({ date: '', activityName: 'Haal / Ploughing', customActivity: '', totalArea: String(season?.totalArea || ''), areaUnit: season?.areaUnit || 'Acre', rounds: '1', hours: '', rateType: 'Per Acre', rate: '', notes: '' });
  useEffect(() => { if (data && !land) setLand(landBlank(data.season)); }, [data, land]);
  const change = set => key => event => set(current => ({ ...current, [key]: event.target.value }));
  const landCost = useMemo(() => {
    if (!land) return 0;
    const rate = Number(land.rate) || 0;
    return land.rateType === 'Per Acre' ? (Number(land.totalArea) || 0) * rate : land.rateType === 'Per Round' ? (Number(land.rounds) || 0) * rate : land.rateType === 'Per Hour' ? (Number(land.hours) || 0) * rate : rate;
  }, [land]);
  const save = async (event, endpoint, payload, reset, id = null) => {
    event.preventDefault(); setSaving(true);
    try {
      if (id) await api.put(`/crops/${seasonId}/${endpoint}/${id}`, payload);
      else await api.post(`/crops/${seasonId}/${endpoint}`, payload);
      toast.success(id ? 'Record updated' : 'Record saved'); reset(); setEditingId(null); await load();
    } catch (err) { Swal.fire({ icon: 'error', title: 'Could not save record', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' }); }
    finally { setSaving(false); }
  };
  const deleteRecord = async (kind, id) => {
    const answer = await Swal.fire({ title: 'Delete this record?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00' });
    if (!answer.isConfirmed) return;
    try { await api.delete(`/crops/${seasonId}/${kind}/${id}`); toast.success('Record deleted'); load(); } catch (err) { toast.error(err.response?.data?.message || err.message); }
  };
  const [saleEditingId, setSaleEditingId] = useState(null);
  const startEditSale = row => {
    setSaleForm({ saleDate: row.saleDate || '', buyerName: row.buyerName || '', unit: row.unit || 'Maund', quantitySold: String(row.quantitySold || ''), weightPerBag: String(row.weightPerBag || ''), ratePerUnit: String(row.ratePerUnit || ''), applyKaat: !!row.applyKaat, kaatDeductionKg: String(row.kaatDeductionKg || '1'), kaatPerKg: String(row.kaatPerKg || '50'), notes: row.notes || '' });
    setSaleEditingId(row.id); setTab('Sales'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const startEditLand = row => {
    const details = row.details || {};
    setLand({ date: row.date, activityName: details.activityName || row.title, customActivity: landActivities.includes(details.activityName || row.title) ? '' : row.title, totalArea: String(details.totalArea ?? row.quantity ?? ''), areaUnit: details.areaUnit || row.unit || 'Acre', rounds: String(details.rounds ?? 1), hours: String(details.hours ?? ''), rateType: details.rateType || 'Fixed Price', rate: String(details.rate ?? row.totalCost), notes: row.notes || '' });
    setEditingId(row.id); setTab('Land Preparation'); window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const viewLand = row => Swal.fire({ title: row.title, html: `<div style="text-align:left"><p><b>Date:</b> ${row.date}</p><p><b>Area:</b> ${row.details?.totalArea || 0} ${row.details?.areaUnit || ''}</p><p><b>Rounds:</b> ${row.details?.rounds || 0}</p><p><b>Hours:</b> ${row.details?.hours || 0}</p><p><b>Rate:</b> ${row.details?.rateType || ''} — Rs. ${Number(row.details?.rate || 0).toLocaleString()}</p><p><b>Total:</b> Rs. ${Number(row.totalCost || 0).toLocaleString()}</p><p><b>Notes:</b> ${row.notes || '—'}</p></div>`, confirmButtonColor: '#001e00' });

  if (!data || !land) return <div className="mx-auto max-w-6xl"><LoadingState label="Loading crop dashboard..." /></div>;
  const { season, summary, activities, yields, sales, timeline } = data;
  const landRecords = activities.filter(row => row.type === 'Land Preparation');
  const otherRecords = activities.filter(row => row.type !== 'Land Preparation');
  const tabs = ['Overview', 'Land Preparation', 'Fertilizer', 'Spray', 'Pesticide', 'Activities', 'Harvesting', 'Sales', 'Timeline'];
  const landPayload = { type: 'Land Preparation', date: land.date, title: land.activityName === 'Other / Custom Activity' ? land.customActivity : land.activityName, quantity: land.totalArea, unit: land.areaUnit, totalCost: landCost, notes: land.notes, details: { activityName: land.activityName === 'Other / Custom Activity' ? land.customActivity : land.activityName, totalArea: land.totalArea, areaUnit: land.areaUnit, rounds: land.rounds, hours: land.hours, rateType: land.rateType, rate: land.rate } };

  return <div className="mx-auto max-w-7xl space-y-6">
    <SectionHeader title={`${season.cropName} · ${season.season}`} subtitle={`${season.fieldName ? `${season.fieldName} · ` : ''}${season.totalArea} ${season.areaUnit} · ${season.status}`} />
    <div className="flex flex-wrap gap-2 border-b border-[#a8d8a8] pb-3">{tabs.map(item => <Button key={item} variant={tab === item ? 'primary' : 'secondary'} onClick={() => setTab(item)}>{item}</Button>)}</div>
    {tab === 'Overview' ? <><div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5"><StatCard title="Total area" value={`${season.totalArea} ${season.areaUnit}`} /><StatCard title="Investment" value={money(summary.totalInvestment)} /><StatCard title="Cost / acre" value={money(summary.costPerAcre)} /><StatCard title="Total yield" value={summary.totalProduction.toLocaleString()} /><StatCard title="Revenue" value={money(summary.totalRevenue)} /><StatCard title="Net profit / loss" value={money(summary.netProfit)} /><StatCard title="Profit / acre" value={money(summary.profitPerAcre)} /><StatCard title="ROI" value={`${summary.roi.toFixed(1)}%`} /></div><Card><div className="mb-4 text-lg font-bold">Investment by operation</div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(summary.costsByType).map(([type, cost]) => <div key={type} className="rounded-xl bg-[#f0faf0] p-4"><div className="text-sm text-[#3a8a3a]">{type}</div><div className="mt-1 text-lg font-bold">{money(cost)}</div></div>)}</div></Card></> : null}
    {tab === 'Land Preparation' ? <div className="space-y-6"><div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><StatCard title="Total land preparation cost" value={money(summary.landPreparation?.totalCost)} /><StatCard title="Cost per acre" value={money(summary.landPreparation?.costPerAcre)} /><StatCard title="Operations" value={summary.landPreparation?.operations || 0} /></div><div className="grid gap-6 xl:grid-cols-[1fr_1.5fr]"><Card><form className="grid gap-4" onSubmit={event => save(event, 'activities', landPayload, () => setLand(landBlank(season)), editingId)}><div className="text-lg font-bold">{editingId ? 'Edit land preparation entry' : 'Add land preparation entry'}</div><Select label="Activity name" value={land.activityName} onChange={change(setLand)('activityName')}>{landActivities.map(item => <option key={item}>{item}</option>)}</Select>{land.activityName === 'Other / Custom Activity' ? <Input label="Custom activity name" value={land.customActivity} onChange={change(setLand)('customActivity')} required /> : null}<Input label="Date" type="date" value={land.date} onChange={change(setLand)('date')} required /><div className="grid grid-cols-2 gap-3"><Input label="Total land area" type="number" min="0" step="0.01" value={land.totalArea} onChange={change(setLand)('totalArea')} required /><Select label="Area unit" value={land.areaUnit} onChange={change(setLand)('areaUnit')}><option>Acre</option><option>Kanal</option><option>Marla</option></Select></div><Select label="Calculation basis" value={land.rateType} onChange={change(setLand)('rateType')}><option>Per Acre</option><option>Per Round</option><option>Per Hour</option><option>Fixed Price</option></Select>{land.rateType === 'Per Round' ? <Input label="Number of rounds" type="number" min="0" step="1" value={land.rounds} onChange={change(setLand)('rounds')} required /> : null}{land.rateType === 'Per Hour' ? <Input label="Number of hours" type="number" min="0" step="0.25" value={land.hours} onChange={change(setLand)('hours')} required /> : null}<Input label={land.rateType === 'Per Hour' ? 'Rate per hour (Rs.)' : land.rateType === 'Per Acre' ? 'Rate per acre (Rs.)' : land.rateType === 'Per Round' ? 'Rate per round (Rs.)' : 'Fixed price (Rs.)'} type="number" min="0" value={land.rate} onChange={change(setLand)('rate')} required /><div className="rounded-xl bg-[#f0faf0] p-4"><div className="text-sm text-[#3a8a3a]">Total cost (automatic)</div><div className="mt-1 text-xl font-bold text-[#001e00]">{money(landCost)}</div></div><Textarea label="Notes" rows="2" value={land.notes} onChange={change(setLand)('notes')} /><div className="flex gap-2"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Update entry' : 'Save entry'}</Button>{editingId ? <Button type="button" variant="secondary" onClick={() => { setEditingId(null); setLand(landBlank(season)); }}>Cancel</Button> : null}</div></form></Card><Table rows={landRecords} columns={[{ key: 'date', label: 'Date' }, { key: 'title', label: 'Activity' }, { key: 'area', label: 'Area', render: row => `${row.details?.totalArea || 0} ${row.details?.areaUnit || ''}` }, { key: 'usage', label: 'Rounds / hours', render: row => row.details?.rateType === 'Per Hour' ? `${row.details?.hours || 0} hours` : row.details?.rounds || 0 }, { key: 'rateType', label: 'Rate type', render: row => row.details?.rateType || '-' }, { key: 'rate', label: 'Rate (Rs.)', render: row => money(row.details?.rate) }, { key: 'totalCost', label: 'Total (Rs.)', render: row => money(row.totalCost) }, { key: 'actions', label: 'Actions', render: row => <div className="flex gap-2"><Button variant="secondary" onClick={() => viewLand(row)}>View</Button><Button variant="secondary" onClick={() => startEditLand(row)}>Edit</Button><Button variant="danger" onClick={() => deleteRecord('activities', row.id)}>Delete</Button></div> }]} emptyMessage="No land preparation records yet." /></div></div> : null}
    {tab === 'Fertilizer' ? <FertilizerActivity seasonId={seasonId} activities={activities} summary={summary.fertilizer} onSaved={load} /> : null}
    {tab === 'Spray' ? <SprayActivity seasonId={seasonId} activities={activities} summary={summary.spray} onSaved={load} /> : null}
    {tab === 'Pesticide' ? <PesticideActivity seasonId={seasonId} activities={activities} summary={summary.pesticide} onSaved={load} /> : null}
    {tab === 'Activities' ? <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]"><Card><form className="grid gap-4" onSubmit={event => save(event, 'activities', { ...generic, details: {} }, () => setGeneric(genericBlank))}><div className="text-lg font-bold">Add crop activity / expense</div><Select label="Section" value={generic.type} onChange={change(setGeneric)('type')}>{activityTypes.map(type => <option key={type}>{type}</option>)}</Select><Input label="Date" type="date" value={generic.date} onChange={change(setGeneric)('date')} required /><Input label="Activity / product" value={generic.title} onChange={change(setGeneric)('title')} required /><div className="grid grid-cols-2 gap-3"><Input label="Quantity" type="number" min="0" value={generic.quantity} onChange={change(setGeneric)('quantity')} /><Input label="Unit" value={generic.unit} onChange={change(setGeneric)('unit')} /></div><Input label="Total cost (Rs.)" type="number" min="0" value={generic.totalCost} onChange={change(setGeneric)('totalCost')} required /><Textarea label="Notes" rows="2" value={generic.notes} onChange={change(setGeneric)('notes')} /><Button type="submit" disabled={saving}>Save activity</Button></form></Card><Table rows={otherRecords} columns={[{ key: 'date', label: 'Date' }, { key: 'type', label: 'Section' }, { key: 'title', label: 'Activity' }, { key: 'quantity', label: 'Quantity', render: row => `${row.quantity || '-'} ${row.unit || ''}` }, { key: 'totalCost', label: 'Cost', render: row => money(row.totalCost) }, { key: 'actions', label: '', render: row => <Button variant="danger" onClick={() => deleteRecord('activities', row.id)}>Delete</Button> }]} emptyMessage="No activity records yet." /></div> : null}
    {tab === 'Harvesting' ? <HarvestingActivity seasonId={seasonId} yields={yields} summary={summary} onSaved={load} /> : null}
    {tab === 'Sales' ? (() => {
      const { totalKg, kaatKg, finalKg, finalQty } = calcKaat(saleForm.quantitySold, saleForm.unit, saleForm.weightPerBag, saleForm.applyKaat, saleForm.kaatDeductionKg, saleForm.kaatPerKg);
      const grossAmount = finalQty * (Number(saleForm.ratePerUnit) || 0);
      return <div className="space-y-6">
        <Card><form className="grid gap-4 md:grid-cols-2" onSubmit={event => save(event, 'sales', { ...saleForm, applyKaat: saleForm.applyKaat }, () => { setSaleForm(saleBlank); setSaleEditingId(null); }, saleEditingId)}>
          <div className="text-lg font-bold md:col-span-2">{saleEditingId ? 'Edit Crop Sale' : 'Add Crop Sale'}</div>
          <Input label="Sale date" type="date" value={saleForm.saleDate} onChange={change(setSaleForm)('saleDate')} required />
          <Input label="Buyer / dealer" value={saleForm.buyerName} onChange={change(setSaleForm)('buyerName')} required />
          <Select label="Sale unit" value={saleForm.unit} onChange={change(setSaleForm)('unit')}><option>Kg</option><option>Maund</option><option>Ton</option><option>Bags</option></Select>
          <Input label={saleForm.unit === 'Bags' ? 'Number of bags' : `Quantity (${saleForm.unit})`} type="number" min="0" step="0.01" value={saleForm.quantitySold} onChange={change(setSaleForm)('quantitySold')} required />
          {saleForm.unit === 'Bags' ? <Input label="Weight per bag (Kg)" type="number" min="0" step="0.01" value={saleForm.weightPerBag} onChange={change(setSaleForm)('weightPerBag')} required /> : null}
          {saleForm.unit !== 'Kg' && saleForm.quantitySold ? <div className="rounded-xl bg-[#f0faf0] p-3 text-sm text-[#3a8a3a] md:col-span-2">= {totalKg.toLocaleString()} Kg total</div> : null}
          <Input label={`Rate per ${saleForm.unit} (Rs.)`} type="number" min="0" step="0.01" value={saleForm.ratePerUnit} onChange={change(setSaleForm)('ratePerUnit')} required />
          <div className="flex items-center gap-3 rounded-xl border border-[#a8d8a8] p-3 md:col-span-2">
            <input type="checkbox" id="applyKaat" checked={saleForm.applyKaat} onChange={e => setSaleForm(f => ({ ...f, applyKaat: e.target.checked }))} className="h-4 w-4 accent-[#001e00]" />
            <label htmlFor="applyKaat" className="text-sm font-medium text-[#001e00] cursor-pointer">Apply Kaat / Weight Deduction</label>
          </div>
          {saleForm.applyKaat ? <>
            <Input label="Deduction (Kg)" type="number" min="0.01" step="0.01" value={saleForm.kaatDeductionKg} onChange={change(setSaleForm)('kaatDeductionKg')} />
            <Input label="Per (Kg)" type="number" min="1" step="1" value={saleForm.kaatPerKg} onChange={change(setSaleForm)('kaatPerKg')} />
            {totalKg > 0 ? <div className="rounded-xl border border-[#d2b45a] bg-[#fffbf0] p-4 md:col-span-2 space-y-1">
              <div className="font-bold text-[#001e00] mb-2">Weight Calculation</div>
              <div className="text-sm text-[#3a8a3a]">Original: <span className="font-semibold text-[#001e00]">{Number(saleForm.quantitySold).toLocaleString()} {saleForm.unit}{saleForm.unit !== 'Kg' ? ` / ${totalKg.toLocaleString()} Kg` : ''}</span></div>
              <div className="text-sm text-[#3a8a3a]">Kaat rule: <span className="font-semibold text-[#001e00]">{saleForm.kaatDeductionKg} Kg per {saleForm.kaatPerKg} Kg</span></div>
              <div className="text-sm text-[#3a8a3a]">Total kaat: <span className="font-semibold text-red-600">{kaatKg.toFixed(2)} Kg</span></div>
              <div className="text-sm font-bold text-[#001e00]">Final weight: {finalKg.toFixed(2)} Kg{saleForm.unit !== 'Kg' ? ` / ${finalQty.toFixed(2)} ${saleForm.unit}` : ''}</div>
            </div> : null}
          </> : null}
          {saleForm.quantitySold && saleForm.ratePerUnit ? <div className="rounded-xl bg-[#001e00] p-4 text-white md:col-span-2">
            <div className="text-xs text-[#a8d8a8]">Gross Sale Amount</div>
            <div className="mt-1 text-2xl font-bold">{money(grossAmount)}</div>
            {saleForm.applyKaat ? <div className="mt-1 text-xs text-[#d2b45a]">Based on {finalQty.toFixed(2)} {saleForm.unit} after kaat</div> : <div className="mt-1 text-xs text-[#a8d8a8]">Based on {Number(saleForm.quantitySold).toLocaleString()} {saleForm.unit} (no kaat)</div>}
          </div> : null}
          <Textarea label="Notes" rows="2" value={saleForm.notes} onChange={change(setSaleForm)('notes')} className="md:col-span-2" />
          <div className="md:col-span-2 flex gap-2"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : saleEditingId ? 'Update sale' : 'Save sale'}</Button>{saleEditingId ? <Button type="button" variant="secondary" onClick={() => { setSaleForm(saleBlank); setSaleEditingId(null); }}>Cancel</Button> : null}</div>
        </form></Card>
        <Table rows={sales} columns={[
          { key: 'saleDate', label: 'Date' },
          { key: 'buyerName', label: 'Buyer' },
          { key: 'quantitySold', label: 'Original Qty', render: row => `${Number(row.quantitySold).toLocaleString()} ${row.unit}` },
          { key: 'kaatKg', label: 'Kaat', render: row => row.applyKaat ? <span className="rounded-full bg-[#fff3cd] px-2 py-0.5 text-xs font-semibold text-[#856404]">{Number(row.kaatKg || 0).toFixed(2)} Kg</span> : <span className="rounded-full bg-[#d6f0d6] px-2 py-0.5 text-xs font-semibold text-[#3a8a3a]">No Kaat</span> },
          { key: 'finalQty', label: 'Final Weight', render: row => row.applyKaat ? `${Number(row.finalQty || 0).toFixed(2)} ${row.unit}` : `${Number(row.quantitySold).toLocaleString()} ${row.unit}` },
          { key: 'ratePerUnit', label: 'Rate', render: row => `${money(row.ratePerUnit)}/${row.unit}` },
          { key: 'netSaleAmount', label: 'Total Amount', render: row => money(row.netSaleAmount) },
          { key: 'actions', label: '', render: row => <div className="flex gap-2"><Button variant="secondary" onClick={() => startEditSale(row)}>Edit</Button><Button variant="danger" onClick={() => deleteRecord('sales', row.id)}>Delete</Button></div> }
        ]} emptyMessage="No sales recorded yet." />
      </div>;
    })() : null}
    {tab === 'Timeline' ? <Card><div className="space-y-4">{timeline.length ? timeline.map(item => <div key={`${item.type}-${item.id}`} className="border-l-2 border-[#a8d8a8] pl-4"><div className="text-xs font-semibold text-[#d2b45a]">{item.date}</div><div className="font-semibold text-[#001e00]">{item.title}</div><div className="text-sm text-[#3a8a3a]">{item.type}{item.detail ? ` · ${item.detail}` : ''}</div></div>) : <div className="py-8 text-center text-[#3a8a3a]">Your crop history will appear here as you add records.</div>}</div></Card> : null}
  </div>;
}
