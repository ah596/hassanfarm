import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
      Swal.fire({ icon: 'error', title: 'Registration Failed', text: msg, confirmButtonColor: '#001e00' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f7f4] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#001e00]">
            <img src="/logo.png" alt="logo" className="h-9 w-9 rounded-xl object-cover" />
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#d2b45a]">Maweshi Farm</div>
          <h1 className="mt-2 text-3xl font-bold text-[#001e00]">Create account</h1>
          <p className="mt-2 text-sm text-[#3a8a3a]">Register to manage the farm dashboard securely.</p>
        </div>
        <div className="rounded-2xl border border-[#a8d8a8] bg-white p-8 shadow-card">
          <form className="space-y-5" onSubmit={submit}>
            <Input label="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />

            <Button className="w-full py-3" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Register'}
            </Button>
          </form>
          <div className="mt-5 border-t border-[#a8d8a8] pt-5 text-center text-sm text-[#3a8a3a]">
            Already have an account?{' '}
            <Link className="font-medium text-[#001e00] hover:underline" to="/login">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
