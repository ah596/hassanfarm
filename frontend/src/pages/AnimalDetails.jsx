import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Card, Input, Select, SectionHeader, Textarea, LoadingState } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const GESTATION_DAYS = { Cow: 283, Goat: 150 };

function estimateBreeding(type, breedingDate) {
  if (!breedingDate || !GESTATION_DAYS[type]) return null;
  const expected = new Date(`${breedingDate}T00:00:00Z`);
  expected.setUTCDate(expected.getUTCDate() + GESTATION_DAYS[type]);
  const expectedBirthDate = expected.toISOString().slice(0, 10);
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const remainingDays = Math.ceil((expected.getTime() - todayUtc) / 86400000);
  return { expectedBirthDate, remainingDays };
}

const displayDate = value => value ? new Date(`${String(value).slice(0, 10)}T00:00:00`).toLocaleDateString() : '—';

export default function AnimalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [animal, setAnimal] = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);
  const [breedingForm, setBreedingForm] = useState({ breedingDate: '', pregnancyNumber: '1', notes: '' });
  const [breedingError, setBreedingError] = useState('');
  const [savingBreeding, setSavingBreeding] = useState(false);
  const [birthDates, setBirthDates] = useState({});
  const [showImageOptions, setShowImageOptions] = useState(false);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const mobileCameraRef = useRef(null);
  const mobileGalleryRef = useRef(null);

  const load = async () => {
    setLoading(true);
    const [animalRes, summaryRes] = await Promise.all([
      api.get(`/animals/${id}`),
      api.get(`/animals/${id}/summary`)
    ]);
    const item = animalRes.data.animal;
    setAnimal(item);
    setSummary(summaryRes.data);
    setForm({
      animalId: item.animalId || '',
      name: item.name || '',
      type: item.type || 'Goat',
      gender: item.gender || 'Male',
      breed: item.breed || '',
      color: item.color || '',
      weight: item.weight || '',
      dob: item.dob ? String(item.dob).slice(0, 10) : '',
      purchaseDate: item.purchaseDate ? String(item.purchaseDate).slice(0, 10) : '',
      purchasePrice: item.purchasePrice || '',
      sellerName: item.sellerName || '',
      sellerContact: item.sellerContact || '',
      status: item.status || 'Available',
      notes: item.notes || '',
      image: item.image || '',
      isSelfBreed: (!item.purchaseDate && !item.purchasePrice)
    });
    setLoading(false);
  };

  useEffect(() => {
    load().catch(err => {
      setError(err.response?.data?.message || err.message);
      setLoading(false);
    });
  }, [id]);

  const save = async e => {
    e.preventDefault();
    try {
      await api.put(`/animals/${id}`, form);
      toast.success('Animal updated successfully!');
      await load();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update Failed', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' });
    }
  };

  const remove = async () => {
    const result = await Swal.fire({ title: 'Delete Animal?', text: 'This action cannot be undone.', icon: 'warning', showCancelButton: true, confirmButtonColor: '#b91c1c', cancelButtonColor: '#001e00', confirmButtonText: 'Yes, delete' });
    if (!result.isConfirmed) return;
    try {
      await api.delete(`/animals/${id}`);
      toast.success('Animal deleted.');
      navigate('/farm/animals');
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || err.message, confirmButtonColor: '#001e00' });
    }
  };

  const saveBreeding = async event => {
    event.preventDefault();
    setSavingBreeding(true);
    setBreedingError('');
    try {
      await api.post(`/animals/${id}/breeding`, breedingForm);
      toast.success('Breeding record saved!');
      setBreedingForm({ breedingDate: '', pregnancyNumber: '1', notes: '' });
      await load();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setBreedingError(msg);
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#001e00' });
    } finally {
      setSavingBreeding(false);
    }
  };

  const saveBirth = async breedingId => {
    const actualBirthDate = birthDates[breedingId];
    if (!actualBirthDate) return;
    setBreedingError('');
    try {
      await api.post(`/animals/${id}/breeding/${breedingId}/birth`, { actualBirthDate });
      toast.success('Birth recorded!');
      setBirthDates(current => ({ ...current, [breedingId]: '' }));
      await load();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setBreedingError(msg);
      Swal.fire({ icon: 'error', title: 'Error', text: msg, confirmButtonColor: '#001e00' });
    }
  };

  if (loading) return <LoadingState label="Loading animal profile..." />;
  if (error) return <Card><div className="text-[#2B2B2B]">{error}</div></Card>;
  if (!animal) return null;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setForm({ ...form, image: dataUrl });
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const setWeight = (change) => setForm(current => ({
    ...current,
    weight: Math.max(0, Number(current.weight || 0) + change)
  }));

  const totalInvestment = Number(summary?.totalInvestment || 0);
  const currentValue = Number(summary?.salePrice || animal.purchasePrice || 0);
  const unrealizedGain = currentValue - totalInvestment;
  const latestBreeding = animal.breedingHistory?.length ? animal.breedingHistory[animal.breedingHistory.length - 1] : null;
  const breedingProgress = latestBreeding && GESTATION_DAYS[animal.type]
    ? Math.min(100, Math.max(5, ((GESTATION_DAYS[animal.type] - Math.max(Number(latestBreeding.remainingDays) || 0, 0)) / GESTATION_DAYS[animal.type]) * 100))
    : 0;

  return (
    <>
      <form className="animal-edit-mobile md:hidden" onSubmit={save}>
        <div className="animal-edit-mobile-top">
          <button type="button" onClick={() => navigate('/farm/animals')} aria-label="Back">←</button>
          <div><span>EDIT ANIMAL · {animal.animalId}</span><b>Edit Animal Details</b></div>
          <button type="button" onClick={() => setShowImageOptions(true)} aria-label="Upload photo">◉</button>
        </div>

        <section className="animal-edit-profile">
          <div className="animal-edit-profile-main">
            {form.image ? <img src={form.image} alt={animal.name || animal.animalId} /> : <div className="animal-edit-photo-placeholder">🐄</div>}
            <div><span className="animal-edit-tag">TAG #{animal.animalId}</span><h1>{form.name || animal.breed || 'Animal profile'}</h1><p>{form.breed || 'Breed not added'} · {form.weight || 0} Kg</p><small>{form.gender} · {form.type}</small></div>
            <button type="button" onClick={remove}>Delete</button>
          </div>
          <div className="animal-edit-profile-actions"><button type="button" onClick={() => setShowImageOptions(true)}>Upload / replace photo</button>{form.image ? <button type="button" className="danger" onClick={() => setForm({ ...form, image: '' })}>Remove photo</button> : null}</div>
        </section>

        <section className="animal-edit-stat-grid">
          {[
            ['Purchase cost', Number(animal.purchasePrice || 0)],
            ['Total invested', totalInvestment],
            ['Current valuation', currentValue],
            ['Unrealized gain', unrealizedGain]
          ].map(([label, value]) => <div key={label} className={label === 'Unrealized gain' ? (value >= 0 ? 'positive' : 'negative') : ''}><span>{label}</span><b>Rs. {value.toLocaleString()}</b></div>)}
        </section>

        <section className="animal-edit-section">
          <h2>Animal identity &amp; specs</h2>
          <label>Animal tag / ID<input value={form.animalId} onChange={e => setForm({ ...form, animalId: e.target.value })} required /></label>
          <label>Animal name<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
          <label>Animal category</label>
          <div className="animal-edit-type-grid">{['Cow', 'Goat', 'Sheep', 'Buffalo'].map(type => <button type="button" key={type} className={form.type === type ? 'selected' : ''} onClick={() => setForm({ ...form, type })}><span>{type === 'Cow' ? '♣' : type === 'Goat' ? '♧' : type === 'Sheep' ? '✦' : '●'}</span>{type}</button>)}</div>
          <label>Gender</label>
          <div className="animal-edit-choice-row"><button type="button" className={form.gender === 'Female' ? 'selected' : ''} onClick={() => setForm({ ...form, gender: 'Female' })}>♀ Female (Dam)</button><button type="button" className={form.gender === 'Male' ? 'selected' : ''} onClick={() => setForm({ ...form, gender: 'Male' })}>♂ Male (Sire)</button></div>
          <div className="animal-edit-two-col"><label>Breed<input value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} required /></label><label>Color pattern<input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></label></div>
          <label>Current weight (Kg)</label>
          <div className="animal-edit-weight"><button type="button" onClick={() => setWeight(-1)}>−</button><input type="number" min="0" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /><button type="button" onClick={() => setWeight(1)}>+</button></div>
          <label>Date of birth / estimated age<input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></label>
          <label>Health condition</label>
          <div className="animal-edit-health-row"><button type="button" className={form.status === 'Available' ? 'selected' : ''} onClick={() => setForm({ ...form, status: 'Available' })}>● Healthy</button><button type="button" className={form.status === 'Observation' ? 'selected' : ''} onClick={() => setForm({ ...form, status: 'Observation' })}>◐ Watch</button><button type="button" className={form.status === 'Treatment' ? 'selected' : ''} onClick={() => setForm({ ...form, status: 'Treatment' })}>✚ Sick</button></div>
          <label>Physical / farm notes<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Medical history, behaviour, vaccinations..." /></label>
        </section>

        <section className="animal-edit-section">
          <h2>Acquisition &amp; lineage</h2>
          <div className="animal-edit-self"><div><b>Self breed (born on farm)</b><small>Hide purchase fields when this animal was born here.</small></div><input type="checkbox" checked={form.isSelfBreed} onChange={e => setForm({ ...form, isSelfBreed: e.target.checked })} /></div>
          {!form.isSelfBreed ? <div className="animal-edit-two-col"><label>Purchase date<input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} /></label><label>Purchase price (Rs.)<input type="number" min="0" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} /></label><label>Seller name<input value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} /></label><label>Seller contact<input value={form.sellerContact} onChange={e => setForm({ ...form, sellerContact: e.target.value })} /></label></div> : null}
        </section>

        {animal.gender === 'Female' && GESTATION_DAYS[animal.type] ? <section className="animal-edit-section animal-edit-breeding"><h2>Breeding &amp; gestation</h2>{latestBreeding ? <><div className="animal-edit-breeding-line"><b>{latestBreeding.status}</b><span>{latestBreeding.remainingDays > 0 ? `${latestBreeding.remainingDays} days remaining` : displayDate(latestBreeding.expectedBirthDate)}</span></div><div className="animal-edit-progress"><i style={{ width: `${breedingProgress}%` }} /></div></> : <p>No breeding record saved yet. Use the desktop breeding section to add one.</p>}</section> : null}

        <section className="animal-edit-section animal-edit-linked"><h2>Cost ledger &amp; linked records</h2><div><span>Feed &amp; supplies</span><b>Rs. {Number(summary?.feedCost || 0).toLocaleString()}</b></div><div><span>Medicine &amp; treatment</span><b>Rs. {Number(summary?.medicineCost || 0).toLocaleString()}</b></div><div><span>Other expenses</span><b>Rs. {Number(summary?.otherCost || 0).toLocaleString()}</b></div><div><span>Record timeline</span><b>{(animal.details?.expenses?.length || 0) + (animal.details?.feed?.length || 0) + (animal.details?.medicine?.length || 0)} records</b></div></section>

        <div className="animal-edit-mobile-actions"><button type="button" onClick={() => navigate('/farm/animals')}>Cancel</button><button type="submit">Save changes</button></div>
        <input type="file" accept="image/*" capture="environment" ref={mobileCameraRef} onChange={handleImageUpload} className="hidden" />
        <input type="file" accept="image/*" ref={mobileGalleryRef} onChange={handleImageUpload} className="hidden" />
      </form>

      {showImageOptions ? <div className="animal-edit-upload-modal md:hidden"><div><h3>Upload photo</h3><button type="button" onClick={() => { setShowImageOptions(false); mobileCameraRef.current?.click(); }}>Take photo</button><button type="button" onClick={() => { setShowImageOptions(false); mobileGalleryRef.current?.click(); }}>Choose from gallery</button><button type="button" onClick={() => setShowImageOptions(false)}>Cancel</button></div></div> : null}

    <div className="hidden md:block space-y-6">
      <SectionHeader
        title={`${animal.animalId} · ${animal.breed}`}
        subtitle={`Status: ${animal.status} · Type: ${animal.type} · Gender: ${animal.gender}${animal.parentAnimalId ? ` · Born to: ${animal.parentName || 'Mother'} (${animal.parentAnimalId})` : ''}`}
        action={<div className="flex gap-2"><Button variant="danger" onClick={remove}>Delete</Button></div>}
      />

      <div className="grid grid-cols-2 gap-2 md:gap-4 xl:grid-cols-4">
        <Card><div className="text-sm text-[#B3B3B3]">Purchase Price</div><div className="mt-2 text-2xl font-bold text-[#2B2B2B]">Rs. {Number(animal.purchasePrice || 0).toLocaleString()}</div></Card>
        <Card><div className="text-sm text-[#B3B3B3]">Total Investment</div><div className="mt-2 text-2xl font-bold text-[#2B2B2B]">Rs. {Number(summary?.totalInvestment || 0).toLocaleString()}</div></Card>
        <Card><div className="text-sm text-[#B3B3B3]">Sale Price</div><div className="mt-2 text-2xl font-bold text-[#2B2B2B]">Rs. {Number(summary?.salePrice || 0).toLocaleString()}</div></Card>
        <Card><div className="text-sm text-[#B3B3B3]">Profit / Loss</div><div className="mt-2 text-2xl font-bold text-[#2B2B2B]">Rs. {Number(summary?.netProfit || 0).toLocaleString()}</div></Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <div className="mb-4 text-lg font-bold text-[#2B2B2B]">Edit Animal</div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={save}>
            <Input label="Tag / Animal ID" value={form.animalId} onChange={e => setForm({ ...form, animalId: e.target.value })} required />
            <Input label="Animal Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>Cow</option><option>Goat</option><option>Sheep</option><option>Buffalo</option>
            </Select>
            <Select label="Gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
              <option>Male</option><option>Female</option>
            </Select>
            <Input label="Breed" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} />
            <Input label="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
            <Input label="Weight" type="number" min="0" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
            <div className="md:col-span-2 flex items-center space-x-2 my-2">
              <input 
                type="checkbox" 
                id="isSelfBreed" 
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-600" 
                checked={form.isSelfBreed} 
                onChange={e => setForm({ ...form, isSelfBreed: e.target.checked })} 
              />
              <label htmlFor="isSelfBreed" className="text-sm font-medium text-gray-700">Self Breed (Born on farm)</label>
            </div>
            {!form.isSelfBreed && (
              <>
                <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} />
                <Input label="Purchase Price" type="number" min="0" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} />
                <Input label="Seller Name" value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} />
                <Input label="Seller Contact" value={form.sellerContact} onChange={e => setForm({ ...form, sellerContact: e.target.value })} />
              </>
            )}
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option>Available</option><option>Observation</option><option>Treatment</option><option>Sold</option><option>Dead</option><option>Transferred</option>
            </Select>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <div className="flex flex-col items-start gap-2">
                <Button type="button" variant="secondary" onClick={() => setShowImageOptions(true)}>
                  Upload Photo
                </Button>
                
                <input type="file" accept="image/*" capture="environment" ref={cameraRef} onChange={(e) => { setShowImageOptions(false); handleImageUpload(e); }} className="hidden" />
                <input type="file" accept="image/*" ref={galleryRef} onChange={(e) => { setShowImageOptions(false); handleImageUpload(e); }} className="hidden" />
                
                {showImageOptions && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                      <h3 className="mb-4 text-lg font-bold text-[#001e00]">Upload Photo</h3>
                      <div className="flex flex-col gap-3">
                        <Button type="button" onClick={() => cameraRef.current?.click()} className="w-full justify-center">
                          Take Photo
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => galleryRef.current?.click()} className="w-full justify-center">
                          Choose from Gallery
                        </Button>
                        <button type="button" onClick={() => setShowImageOptions(false)} className="mt-2 w-full rounded-xl py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition">
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {form.image && (
                 <div className="mt-4 relative inline-block">
                   <img src={form.image} alt="Preview" className="h-32 object-cover rounded-md border" />
                   <button type="button" onClick={() => setForm({...form, image: ''})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs">x</button>
                 </div>
              )}
            </div>
            <div className="md:col-span-2">
              <Textarea label="Notes" rows="4" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="md:col-span-2"><Button type="submit">Save changes</Button></div>
          </form>
        </Card>

        <Card>
          <div className="mb-4 text-lg font-bold text-[#2B2B2B]">Financial Summary</div>
          <div className="space-y-3 text-sm">
            {[
              ['Feed Cost', summary?.feedCost],
              ['Medicine Cost', summary?.medicineCost],
              ['Transport Cost', summary?.transportCost],
              ['Other Cost', summary?.otherCost],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-[#B3B3B3]">{label}</span>
                <span className="font-medium text-[#2B2B2B]">Rs. {Number(val || 0).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-[#D4D4D4] pt-3 flex justify-between font-bold text-[#2B2B2B]">
              <span>Total Investment</span><span>Rs. {Number(summary?.totalInvestment || 0).toLocaleString()}</span>
            </div>
            {[
              ['Sale Price', `Rs. ${Number(summary?.salePrice || 0).toLocaleString()}`],
              ['ROI', `${Number(summary?.roi || 0).toFixed(2)}%`],
              ['Profit Margin', `${Number(summary?.profitMargin || 0).toFixed(2)}%`],
              ['Days Kept', summary?.daysKept || 0],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-[#B3B3B3]">{label}</span>
                <span className="font-medium text-[#2B2B2B]">{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {(animal.gender === 'Female' && GESTATION_DAYS[animal.type]) ? (
        <Card>
          <div className="mb-1 text-lg font-bold text-[#2B2B2B]">Breeding &amp; Expected Birth Date</div>
          <p className="mb-4 text-sm text-[#B3B3B3]">Expected dates are estimates based on a {GESTATION_DAYS[animal.type]}-day {animal.type.toLowerCase()} gestation period.</p>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={saveBreeding}>
            <Input label="Breeding / Crossing Date" type="date" value={breedingForm.breedingDate} onChange={e => setBreedingForm({ ...breedingForm, breedingDate: e.target.value })} required />
            <div className="rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] px-4 py-3 text-sm">
              <div className="text-[#B3B3B3]">Animal Type</div>
              <div className="mt-1 font-semibold text-[#2B2B2B]">{animal.type} · {GESTATION_DAYS[animal.type]} days</div>
            </div>
            <Select label="Pregnancy number" value={breedingForm.pregnancyNumber} onChange={e => setBreedingForm({ ...breedingForm, pregnancyNumber: e.target.value })}>
              <option value="1">First pregnancy</option><option value="2">Second pregnancy</option><option value="3">Third pregnancy</option><option value="4">Fourth pregnancy</option><option value="5">Fifth or later pregnancy</option>
            </Select>
            {estimateBreeding(animal.type, breedingForm.breedingDate) ? (() => {
              const estimate = estimateBreeding(animal.type, breedingForm.breedingDate);
              const status = estimate.remainingDays > 0 ? `Expected Birth in ${estimate.remainingDays} Days` : estimate.remainingDays === 0 ? 'Due Today' : `Overdue by ${Math.abs(estimate.remainingDays)} Days`;
              return (
                <div className="md:col-span-2 rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] p-4 text-sm">
                  <div className="text-[#B3B3B3]">Expected Birth Date: <span className="font-semibold text-[#2B2B2B]">{displayDate(estimate.expectedBirthDate)}</span></div>
                  <div className="mt-1 font-medium text-[#2B2B2B]">Pregnant / Expecting · {status}</div>
                </div>
              );
            })() : null}
            <div className="md:col-span-2"><Textarea label="Breeding Notes" rows="2" value={breedingForm.notes} onChange={e => setBreedingForm({ ...breedingForm, notes: e.target.value })} /></div>
            {breedingError ? <div className="md:col-span-2 rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] px-4 py-3 text-sm text-[#2B2B2B]">{breedingError}</div> : null}
            <div className="md:col-span-2"><Button type="submit" disabled={savingBreeding}>{savingBreeding ? 'Saving...' : 'Save breeding record'}</Button></div>
          </form>

          <div className="mt-7 border-t border-[#D4D4D4] pt-5">
            <div className="mb-3 text-base font-bold text-[#2B2B2B]">Breeding &amp; Birth History</div>
            <div className="space-y-3">
              {animal.breedingHistory?.length ? [...animal.breedingHistory].reverse().map(record => (
                <div key={record.id} className="rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] p-4 text-sm">
                  <div className="grid gap-2 md:grid-cols-4">
                    <div><span className="text-[#B3B3B3]">Breeding Date</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.breedingDate)}</div></div>
                    <div><span className="text-[#B3B3B3]">Animal Type</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{record.animalType}</div></div>
                    <div><span className="text-[#B3B3B3]">Expected Birth</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{displayDate(record.expectedBirthDate)}</div></div>
                    <div><span className="text-[#B3B3B3]">Status</span><div className="mt-0.5 font-medium text-[#2B2B2B]">{record.status}{record.remainingDays > 0 ? ` · ${record.remainingDays} days` : record.remainingDays < 0 ? ` · ${Math.abs(record.remainingDays)} days overdue` : ''}</div></div>
                  </div>
                  {record.notes ? <div className="mt-2 text-[#B3B3B3]">{record.notes}</div> : null}
                  {record.actualBirthDate
                    ? <div className="mt-2 font-medium text-[#2B2B2B]">Birth recorded: {displayDate(record.actualBirthDate)}</div>
                    : <div className="mt-3 flex flex-wrap items-end gap-2">
                        <Input label="Actual Birth Date" type="date" value={birthDates[record.id] || ''} onChange={e => setBirthDates({ ...birthDates, [record.id]: e.target.value })} className="min-w-48" />
                        <Button type="button" variant="secondary" onClick={() => saveBirth(record.id)} disabled={!birthDates[record.id]}>Record birth</Button>
                      </div>
                  }
                </div>
              )) : <div className="text-sm text-[#B3B3B3]">No breeding records yet.</div>}
            </div>
          </div>
        </Card>
      ) : null}

      <Card>
        <div className="mb-4 text-lg font-bold text-[#2B2B2B]">Linked Records</div>
        <div className="grid gap-4 md:grid-cols-3 text-sm">
          {[
            { label: 'Expenses', items: animal.details.expenses, render: item => `${item.category} · Rs. ${Number(item.amount || 0).toLocaleString()}` },
            { label: 'Feed', items: animal.details.feed, render: item => `${item.feedType} · Rs. ${Number(item.totalCost || 0).toLocaleString()}` },
            { label: 'Medicine', items: animal.details.medicine, render: item => `${item.medicineName} · Rs. ${Number(item.cost || 0).toLocaleString()}` },
          ].map(({ label, items, render }) => (
            <div key={label}>
              <div className="mb-2 font-medium text-[#B3B3B3]">{label}</div>
              <div className="space-y-1.5">
                {items.length
                  ? items.map(item => <div key={item.id} className="rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] px-3 py-2 text-[#2B2B2B]">{render(item)}</div>)
                  : <div className="text-[#B3B3B3]">None</div>
                }
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </>
  );
}
