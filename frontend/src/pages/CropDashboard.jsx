import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useOutletContext, useParams, useSearchParams } from 'react-router-dom';
import api from '../lib/api';
import { Button, Card, Input, LoadingState, Select, Textarea } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import FertilizerActivity from '../components/FertilizerActivity';
import SprayActivity from '../components/SprayActivity';
import PesticideActivity from '../components/PesticideActivity';
import HarvestingActivity from '../components/HarvestingActivity';
import CropOperationsOverview from '../components/CropOperationsOverview';
import SeedingActivity from '../components/SeedingActivity';
import { StageForm, StageHistory, StageSave, StageSection, StageSummary, StageTotal } from '../components/CropStageUI';

const landActivities = ['Haal / Ploughing', 'Rotavator / Roter', 'Disc', 'Khalain / Ridger', 'Laser Leveling', 'Kadu / Cultivator', 'Suhaga / Planker', 'Bed Maker', 'Other / Custom Activity'];
const activityTypes = ['Seed / Sowing', 'Irrigation', 'Labour', 'Machinery', 'Other Expense', 'Harvesting'];
const money = value => `Rs. ${Number(value || 0).toLocaleString()}`;
const genericBlank = { type: 'Seed / Sowing', date: '', title: '', quantity: '', unit: '', totalCost: '', notes: '' };
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
  const { setCropSeason } = useOutletContext() || {};
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const selectedStage = searchParams.get('stage');
  const tab = ['Land Preparation', 'Seeding', 'Fertilizer', 'Spray', 'Pesticide', 'Activities', 'Harvesting', 'Sales', 'Timeline'].includes(selectedStage) ? selectedStage : 'Overview';
  const setTab = value => setSearchParams(current => { const next = new URLSearchParams(current); if (value === 'Overview') next.delete('stage'); else next.set('stage', value); return next; });
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
  useEffect(() => {
    setCropSeason?.(data?.season || null);
    return () => setCropSeason?.(null);
  }, [data?.season, setCropSeason]);
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
  const tabs = ['Overview', 'Land Preparation', 'Seeding', 'Fertilizer', 'Spray', 'Pesticide', 'Activities', 'Harvesting', 'Sales', 'Timeline'];
  const landPayload = { type: 'Land Preparation', date: land.date, title: land.activityName === 'Other / Custom Activity' ? land.customActivity : land.activityName, quantity: land.totalArea, unit: land.areaUnit, totalCost: landCost, notes: land.notes, details: { activityName: land.activityName === 'Other / Custom Activity' ? land.customActivity : land.activityName, totalArea: land.totalArea, areaUnit: land.areaUnit, rounds: land.rounds, hours: land.hours, rateType: land.rateType, rate: land.rate } };

  return <div className={`crop-operations mx-auto max-w-7xl space-y-6 ${tab !== 'Overview' ? 'crop-stage-mode' : ''}`}>
    <div className="crop-ops-season-header"><div><div className="crop-ops-season-title"><h1>{season.cropName} {season.season}</h1><span className="crop-ops-status">{season.status}</span></div><p>{[season.variety, `${season.totalArea} ${season.areaUnit}`, season.fieldName].filter(Boolean).join(' / ')}</p></div><Button onClick={() => setTab('Activities')}><span aria-hidden="true">+</span> Add Entry</Button></div>
    <nav className="crop-operation-tabs" aria-label="Crop operations">{tabs.map(item => <Button key={item} variant={tab === item ? 'primary' : 'secondary'} aria-pressed={tab === item} onClick={() => setTab(item)}>{item}</Button>)}</nav>
    {tab === 'Overview' ? <CropOperationsOverview season={season} summary={summary} activities={activities} timeline={timeline} onTab={setTab}/> : null}
    {tab === 'Land Preparation' ? <div className="crop-stage-screen">
      <StageSummary title="Total land preparation cost" value={money(summary.landPreparation?.totalCost)} hint={`Avg ${money(summary.landPreparation?.costPerAcre)} / Acre`} badge={<>{landRecords.length} operations<small>Recorded this season</small></>} />
      <div className="crop-stage-columns">
        <StageForm title={editingId ? 'Edit Land Preparation' : 'Quick Land Preparation Log'} icon="Land Preparation" onSubmit={event => save(event, 'activities', landPayload, () => setLand(landBlank(season)), editingId)}>
          <StageSection title="Operation & Timing"><div className="crop-stage-field-pair"><Select label="Activity name" required value={land.activityName} onChange={change(setLand)('activityName')}>{landActivities.map(item => <option key={item}>{item}</option>)}</Select><Input label="Date" type="date" value={land.date} onChange={change(setLand)('date')} required /></div>{land.activityName === 'Other / Custom Activity' && <Input label="Custom activity name" value={land.customActivity} onChange={change(setLand)('customActivity')} required />}</StageSection>
          <StageSection title="Area & Calculation"><div className="crop-stage-field-pair"><Input label="Total land area" type="number" min="0" step="0.01" value={land.totalArea} onChange={change(setLand)('totalArea')} required /><Select label="Area unit" value={land.areaUnit} onChange={change(setLand)('areaUnit')}><option>Acre</option><option>Kanal</option><option>Marla</option></Select></div><Select label="Calculation basis" required value={land.rateType} onChange={change(setLand)('rateType')}><option>Per Acre</option><option>Per Round</option><option>Per Hour</option><option>Fixed Price</option></Select>{land.rateType === 'Per Round' && <Input label="Number of rounds" type="number" min="0" step="1" value={land.rounds} onChange={change(setLand)('rounds')} required />}{land.rateType === 'Per Hour' && <Input label="Number of hours" type="number" min="0" step="0.25" value={land.hours} onChange={change(setLand)('hours')} required />}</StageSection>
          <StageSection title="Cost Summary"><Input label={land.rateType === 'Per Hour' ? 'Rate per hour (Rs.)' : land.rateType === 'Per Acre' ? 'Rate per acre (Rs.)' : land.rateType === 'Per Round' ? 'Rate per round (Rs.)' : 'Fixed price (Rs.)'} type="number" min="0" step="0.01" value={land.rate} onChange={change(setLand)('rate')} required /><StageTotal total={landCost} hint={`${land.rateType} / Calculated automatically`} /></StageSection>
          <details className="crop-stage-extras"><summary>Additional notes</summary><Textarea label="Notes" rows="2" value={land.notes} onChange={change(setLand)('notes')} /></details>
          <StageSave saving={saving} editing={editingId} total={landCost} label="Entry" onCancel={() => { setEditingId(null); setLand(landBlank(season)); }} />
        </StageForm>
        <StageHistory title="Land preparation history" rows={landRecords} renderSubtitle={row => `${row.details?.totalArea || 0} ${row.details?.areaUnit || ''}`} renderBreakdown={row => `${row.details?.rateType || 'Fixed Price'} / Rate: ${money(row.details?.rate)}`} onView={viewLand} onEdit={startEditLand} onDelete={id => deleteRecord('activities', id)} emptyMessage="No land preparation records yet." />
      </div>
    </div> : null}
    {tab === 'Seeding' ? <SeedingActivity seasonId={seasonId} activities={activities} acres={summary.acres} onSaved={load} /> : null}
    {tab === 'Fertilizer' ? <FertilizerActivity seasonId={seasonId} activities={activities} summary={summary.fertilizer} acres={summary.acres} onSaved={load} /> : null}
    {tab === 'Spray' ? <SprayActivity seasonId={seasonId} activities={activities} summary={summary.spray} acres={summary.acres} onSaved={load} /> : null}
    {tab === 'Pesticide' ? <PesticideActivity seasonId={seasonId} activities={activities} summary={summary.pesticide} acres={summary.acres} onSaved={load} /> : null}
    {tab === 'Activities' ? <div className="crop-stage-screen">
      <StageSummary title="Crop activities & expenses" value={money(otherRecords.reduce((sum, row) => sum + Number(row.totalCost || 0), 0))} badge={`${otherRecords.length} entries logged`} />
      <div className="crop-stage-columns"><StageForm title="Quick Activity Log" onSubmit={event => save(event, 'activities', { ...generic, details: {} }, () => setGeneric(genericBlank))}>
        <StageSection title="Activity & Timing"><div className="crop-stage-field-pair"><Select label="Section" required value={generic.type} onChange={change(setGeneric)('type')}>{activityTypes.map(type => <option key={type}>{type}</option>)}</Select><Input label="Date" type="date" value={generic.date} onChange={change(setGeneric)('date')} required /></div></StageSection>
        <StageSection title="Product & Quantity"><Input label="Activity / product" value={generic.title} onChange={change(setGeneric)('title')} required /><div className="crop-stage-field-pair"><Input label="Quantity" type="number" min="0" step="0.01" value={generic.quantity} onChange={change(setGeneric)('quantity')} /><Input label="Unit" value={generic.unit} onChange={change(setGeneric)('unit')} /></div></StageSection>
        <StageSection title="Cost Summary"><Input label="Total cost (Rs.)" type="number" min="0" step="0.01" value={generic.totalCost} onChange={change(setGeneric)('totalCost')} required /><StageTotal total={generic.totalCost} hint="Activity / expense" /></StageSection>
        <details className="crop-stage-extras"><summary>Additional notes</summary><Textarea label="Notes" rows="2" value={generic.notes} onChange={change(setGeneric)('notes')} /></details><StageSave saving={saving} total={generic.totalCost} label="Activity" />
      </StageForm><StageHistory title="Past activity history" rows={otherRecords} renderSubtitle={row => row.type} renderBreakdown={row => `${row.quantity || 0} ${row.unit || ''}`} onDelete={id => deleteRecord('activities', id)} emptyMessage="No activity records yet." /></div>
    </div> : null}
    {tab === 'Harvesting' ? <HarvestingActivity seasonId={seasonId} yields={yields} summary={summary} onSaved={load} /> : null}
    {tab === 'Sales' ? (() => {
      const { totalKg, kaatKg, finalKg, finalQty } = calcKaat(saleForm.quantitySold, saleForm.unit, saleForm.weightPerBag, saleForm.applyKaat, saleForm.kaatDeductionKg, saleForm.kaatPerKg);
      const grossAmount = finalQty * (Number(saleForm.ratePerUnit) || 0);
      return <div className="crop-stage-screen">
        <StageSummary title="Total crop sales" value={money(summary.totalRevenue)} badge={`${sales.length} sales logged`} hint="Recorded sale revenue" />
        <div className="crop-stage-columns">
        <StageForm title={saleEditingId ? 'Edit Crop Sale' : 'Quick Sale Log'} icon="finance" onSubmit={event => save(event, 'sales', { ...saleForm, applyKaat: saleForm.applyKaat }, () => { setSaleForm(saleBlank); setSaleEditingId(null); }, saleEditingId)}>
          <StageSection title="Buyer & Timing"><div className="crop-stage-field-pair"><Input label="Buyer / dealer" value={saleForm.buyerName} onChange={change(setSaleForm)('buyerName')} required /><Input label="Sale date" type="date" value={saleForm.saleDate} onChange={change(setSaleForm)('saleDate')} required /></div></StageSection>
          <StageSection title="Quantity & Weight"><div className="crop-stage-field-pair"><Select label="Sale unit" required value={saleForm.unit} onChange={change(setSaleForm)('unit')}><option>Kg</option><option>Maund</option><option>Ton</option><option>Bags</option></Select><Input label={saleForm.unit === 'Bags' ? 'Number of bags' : `Quantity (${saleForm.unit})`} type="number" min="0" step="0.01" value={saleForm.quantitySold} onChange={change(setSaleForm)('quantitySold')} required /></div>{saleForm.unit === 'Bags' && <Input label="Weight per bag (Kg)" type="number" min="0" step="0.01" value={saleForm.weightPerBag} onChange={change(setSaleForm)('weightPerBag')} required />}
            <div className="crop-stage-kaat"><input type="checkbox" id="applyKaat" checked={saleForm.applyKaat} onChange={e => setSaleForm(f => ({ ...f, applyKaat: e.target.checked }))} /><label htmlFor="applyKaat">Apply Kaat / Weight Deduction</label></div>
            {saleForm.applyKaat && <><div className="crop-stage-field-pair"><Input label="Deduction (Kg)" type="number" min="0.01" step="0.01" value={saleForm.kaatDeductionKg} onChange={change(setSaleForm)('kaatDeductionKg')} /><Input label="Per (Kg)" type="number" min="1" step="1" value={saleForm.kaatPerKg} onChange={change(setSaleForm)('kaatPerKg')} /></div>{totalKg > 0 && <div className="crop-stage-weight-summary"><span>Original: {totalKg.toLocaleString()} Kg</span><span>Kaat: {kaatKg.toFixed(2)} Kg</span><strong>Final: {finalKg.toFixed(2)} Kg / {finalQty.toFixed(2)} {saleForm.unit}</strong></div>}</>}
            {!saleForm.applyKaat && saleForm.unit !== 'Kg' && Number(saleForm.quantitySold) > 0 && <div className="crop-stage-weight-summary">{totalKg.toLocaleString()} Kg total</div>}
          </StageSection>
          <StageSection title="Sale Summary"><Input label={`Rate per ${saleForm.unit} (Rs.)`} type="number" min="0" step="0.01" value={saleForm.ratePerUnit} onChange={change(setSaleForm)('ratePerUnit')} required /><StageTotal total={grossAmount} hint={`Sale amount / ${finalQty.toFixed(2)} ${saleForm.unit}${saleForm.applyKaat ? ' after kaat' : ''}`} /></StageSection>
          <details className="crop-stage-extras"><summary>Additional notes</summary><Textarea label="Notes" rows="2" value={saleForm.notes} onChange={change(setSaleForm)('notes')} /></details>
          <StageSave saving={saving} editing={saleEditingId} label="Sale" onCancel={() => { setSaleForm(saleBlank); setSaleEditingId(null); }} />
        </StageForm>
        <StageHistory title="Past sales history" rows={sales.map(row => ({ ...row, date: row.saleDate, title: row.buyerName }))} renderSubtitle={row => `Sold ${Number(row.quantitySold || 0).toLocaleString()} ${row.unit}`} renderBreakdown={row => `${money(row.ratePerUnit)} / ${row.unit}${row.applyKaat ? ` / Kaat: ${Number(row.kaatKg || 0).toFixed(2)} Kg` : ''}`} renderAmount={row => money(row.netSaleAmount)} onEdit={startEditSale} onDelete={id => deleteRecord('sales', id)} emptyMessage="No sales recorded yet." />
        </div>
      </div>;
    })() : null}
    {tab === 'Timeline' ? <Card><div className="space-y-4">{timeline.length ? timeline.map(item => <div key={`${item.type}-${item.id}`} className="border-l-2 border-[#a8d8a8] pl-4"><div className="text-xs font-semibold text-[#d2b45a]">{item.date}</div><div className="font-semibold text-[#001e00]">{item.title}</div><div className="text-sm text-[#3a8a3a]">{item.type}{item.detail ? ` · ${item.detail}` : ''}</div></div>) : <div className="py-8 text-center text-[#3a8a3a]">Your crop history will appear here as you add records.</div>}</div></Card> : null}
  </div>;
}
