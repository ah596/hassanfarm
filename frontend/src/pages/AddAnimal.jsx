import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Button, Card, Input, Select, SectionHeader, Textarea } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const initial = {
  name: '',
  type: 'Goat',
  gender: 'Male',
  breed: '',
  color: '',
  weight: '',
  dob: '',
  purchaseDate: '',
  purchasePrice: '',
  sellerName: '',
  sellerContact: '',
  status: 'Available',
  notes: '',
  image: '',
  isSelfBreed: false
};

// prefix map — must match backend idGenerator
const TYPE_PREFIX = { Cow: 'C', Goat: 'G', Sheep: 'S', Buffalo: 'B' };

function getNextTag(animals, type) {
  const prefix = TYPE_PREFIX[type] || 'A';
  const nums = animals
    .map(a => a.animalId)
    .filter(id => id && id.startsWith(prefix + '-'))
    .map(id => parseInt(id.split('-')[1], 10))
    .filter(n => !isNaN(n));
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `${prefix}-${String(next).padStart(3, '0')}`;
}

export default function AddAnimal() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [allAnimals, setAllAnimals] = useState([]);
  const [nextTag, setNextTag] = useState('...');
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const navigate = useNavigate();

  // load all animals once to compute next tag
  useEffect(() => {
    api.get('/animals').then(res => setAllAnimals(res.data.animals || [])).catch(() => {});
  }, []);

  // recompute tag whenever type or animal list changes
  useEffect(() => {
    setNextTag(getNextTag(allAnimals, form.type));
  }, [form.type, allAnimals]);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/animals', form);
      toast.success('Animal added successfully!');
      navigate(`/farm/animals/${res.data.animal.id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      Swal.fire({ icon: 'error', title: 'Failed to Add Animal', text: msg, confirmButtonColor: '#001e00' });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Shared hidden file inputs — outside both forms so both can trigger them */}
      <input type="file" accept="image/*" capture="environment" ref={cameraRef}
        onChange={e => { setShowImageOptions(false); handleImageUpload(e); e.target.value = ''; }}
        className="hidden" />
      <input type="file" accept="image/*" ref={galleryRef}
        onChange={e => { setShowImageOptions(false); handleImageUpload(e); e.target.value = ''; }}
        className="hidden" />

      {/* Upload Photo popup — shared */}
      {showImageOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-bold text-[#001e00]">Upload Photo</h3>
            <div className="flex flex-col gap-3">
              <Button type="button" onClick={() => cameraRef.current?.click()} className="w-full justify-center">
                📷 Take Photo
              </Button>
              <Button type="button" variant="secondary" onClick={() => galleryRef.current?.click()} className="w-full justify-center">
                🖼 Choose from Gallery
              </Button>
              <button type="button" onClick={() => setShowImageOptions(false)}
                className="mt-2 w-full rounded-xl py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <form className="add-animal-mobile md:hidden" onSubmit={submit}>
        <div className="add-animal-mobile-top"><button type="button" onClick={() => navigate('/farm/animals')}>←</button><b>Add New Animal</b><span>STEP 1 OF 1</span></div>
        <div className="add-animal-mobile-section"><div className="add-animal-mobile-label">ANIMAL IDENTIFICATION PHOTO <em>Recommended</em></div><div className="add-animal-photo-row">{form.image ? <img src={form.image} alt="Preview" /> : <div className="add-animal-photo-placeholder">🐄</div>}<div><b>Portrait Profile</b><small>Clear ear tag &amp; facial markings</small><button type="button" onClick={() => setShowImageOptions(true)}>▣ Upload Photo</button>{form.image && <button type="button" onClick={() => setForm({...form, image: ''})} style={{color:'#ef4444',fontSize:11,marginTop:4}}>✕ Remove</button>}</div></div></div>
        <div className="add-animal-mobile-section"><h2>⚯ General Attributes</h2><label>ANIMAL TAG / NAME<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Moti, Daisy, or Ear Tag #402" /></label><label>ANIMAL TYPE *</label><div className="add-animal-tile-grid">{['Cow','Goat','Sheep','Buffalo'].map(t => <button key={t} type="button" className={form.type === t ? 'selected' : ''} onClick={() => setForm({ ...form, type: t })}>♣<small>{t}</small></button>)}</div>
        {/* Next tag preview */}
        <div style={{margin:'8px 0 4px',padding:'8px 12px',background:'#f0faf0',borderRadius:8,border:'1px solid #a8d8a8',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <span style={{fontSize:10,fontWeight:700,color:'#3a8a3a',textTransform:'uppercase',letterSpacing:'0.08em'}}>Next Auto Tag</span>
          <span style={{fontSize:14,fontWeight:800,color:'#001e00',letterSpacing:'0.05em'}}>{nextTag}</span>
        </div><label>GENDER *</label><div className="add-animal-choice-row"><button type="button" className={form.gender === 'Female' ? 'selected' : ''} onClick={() => setForm({ ...form, gender: 'Female' })}>♀ Female (Dam)</button><button type="button" className={form.gender === 'Male' ? 'selected' : ''} onClick={() => setForm({ ...form, gender: 'Male' })}>♂ Male (Sire)</button></div><label>BREED *</label><input value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} placeholder="e.g. Jersey Dairy" required /><div className="add-animal-two-fields"><label>WEIGHT (KG)<input type="number" min="0" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} /></label><label>COLOR PATTERN<input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="Golden Brown" /></label></div><label>DATE OF BIRTH / EST. AGE<input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} /></label><label>CURRENT HEALTH STATUS</label><div className="add-animal-status-row">{['Available','Observation','Treatment'].map(status => <button key={status} type="button" className={form.status === status ? 'selected' : ''} onClick={() => setForm({ ...form, status })}>◉ {status === 'Available' ? 'Healthy' : status}</button>)}</div><label>VACCINATION & PHYSICAL NOTES<textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Temperament, distinctive horns, vaccination history..." /></label></div>
        <div className="add-animal-mobile-section add-animal-self"><div><b>◉ Self Breed (Born on Farm)</b><small>Turn ON if born here to hide purchase fields.</small></div><input type="checkbox" checked={form.isSelfBreed} onChange={e => setForm({ ...form, isSelfBreed: e.target.checked })} /></div>
        {!form.isSelfBreed ? <div className="add-animal-mobile-section"><div className="add-animal-mobile-label">▣ ACQUISITION & PROCUREMENT RECORD</div><div className="add-animal-two-fields"><label>PURCHASE DATE<input type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} required /></label><label>COST (PKR)<input type="number" min="0" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} required /></label><label>SELLER NAME<input value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} /></label><label>SELLER CONTACT<input value={form.sellerContact} onChange={e => setForm({ ...form, sellerContact: e.target.value })} /></label></div></div> : null}
        <div className="add-animal-mobile-actions"><button type="button" onClick={() => navigate('/farm/animals')}>Cancel</button><Button type="submit" disabled={loading}>{loading ? 'Saving...' : '▣ Register Animal'}</Button></div>
      </form>

      <div className="hidden md:block">
      <SectionHeader title="Add Animal" subtitle="Register a new cow, goat, or sheep with purchase details." />
      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Input label="Animal Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option>Cow</option>
            <option>Goat</option>
            <option>Sheep</option>
            <option>Buffalo</option>
          </Select>
          {/* Next tag preview */}
          <div className="flex items-center justify-between rounded-xl border border-[#a8d8a8] bg-[#f0faf0] px-4 py-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#3a8a3a]">Next Auto Tag ID</div>
              <div className="text-[11px] text-[#6ab86a]">Auto-assigned on save</div>
            </div>
            <div className="text-xl font-extrabold tracking-widest text-[#001e00]">{nextTag}</div>
          </div>
          <Select label="Gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
          </Select>
          <Input label="Breed" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} required />
          <Input label="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
          <Input label="Weight (kg)" type="number" min="0" step="0.01" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} />
          <Input label="Date of Birth" type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
          
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
              <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} required />
              <Input label="Purchase Price" type="number" min="0" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} required />
              <Input label="Seller Name" value={form.sellerName} onChange={e => setForm({ ...form, sellerName: e.target.value })} />
              <Input label="Seller Contact" value={form.sellerContact} onChange={e => setForm({ ...form, sellerContact: e.target.value })} />
            </>
          )}

          <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
            <option>Available</option>
            <option>Sold</option>
            <option>Dead</option>
            <option>Transferred</option>
          </Select>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
            <div className="flex flex-col items-start gap-2">
              <Button type="button" variant="secondary" onClick={() => setShowImageOptions(true)}>
                Upload Photo
              </Button>
              
              {/* inputs moved outside — see top of component */}
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
          {error ? <div className="md:col-span-2 rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] px-4 py-3 text-sm text-[#2B2B2B]">{error}</div> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save animal'}</Button>
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
}
