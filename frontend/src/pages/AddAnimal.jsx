import { useState, useRef } from 'react';
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

export default function AddAnimal() {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const cameraRef = useRef(null);
  const galleryRef = useRef(null);
  const navigate = useNavigate();

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
      <SectionHeader title="Add Animal" subtitle="Register a new cow, goat, or sheep with purchase details." />
      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={submit}>
          <Input label="Animal Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
            <option>Cow</option>
            <option>Goat</option>
            <option>Sheep</option>
          </Select>
          <Select label="Gender" value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
          </Select>
          <Input label="Breed" value={form.breed} onChange={e => setForm({ ...form, breed: e.target.value })} required />
          <Input label="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} />
          <Input label="Weight" type="number" min="0" step="0.01" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} required />
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
          {error ? <div className="md:col-span-2 rounded-xl border border-[#D4D4D4] bg-[#F7F7F7] px-4 py-3 text-sm text-[#2B2B2B]">{error}</div> : null}
          <div className="md:col-span-2">
            <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save animal'}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
