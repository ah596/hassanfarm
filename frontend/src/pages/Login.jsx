import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Login successful! Welcome back.');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      setError(msg);
      Swal.fire({ icon: 'error', title: 'Login Failed', text: msg, confirmButtonColor: '#001e00' });
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
          <h1 className="mt-2 text-3xl font-bold text-[#001e00]">Sign in</h1>
          <p className="mt-2 text-sm text-[#3a8a3a]">Access animals, expenses, sales, and profit calculations.</p>
        </div>
        <div className="rounded-2xl border border-[#a8d8a8] bg-white p-8 shadow-card">
          <form className="space-y-5" onSubmit={submit}>
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            <div>
              <div className="mb-1.5 text-sm font-medium text-[#001e00]">Password</div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-xl border border-[#a8d8a8] bg-white px-4 py-2.5 pr-11 text-sm text-[#001e00] outline-none transition placeholder:text-[#6ab86a] focus:border-[#001e00] focus:ring-1 focus:ring-[#001e00]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a8a3a] hover:text-[#001e00]"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <Button className="w-full py-3" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
          <div className="mt-5 border-t border-[#a8d8a8] pt-5 text-center text-sm text-[#3a8a3a]">
            Don't have an account?{' '}
            <Link className="font-medium text-[#001e00] hover:underline" to="/register">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
