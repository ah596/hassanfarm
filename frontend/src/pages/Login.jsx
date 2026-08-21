import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      Swal.fire({ icon: 'error', title: 'Login Failed', text: msg, confirmButtonColor: '#001e00' });
    } finally {
      setLoading(false);
    }
  };

  const eyeOff = <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>;
  const eyeOn  = <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

  const formSection = (
    <div className="w-full max-w-sm">
      <h1 className="text-2xl font-bold text-[#001e00]">Sign in</h1>
      <p className="mt-1 text-sm text-[#3a8a3a]">Enter your credentials to continue.</p>
      <form className="mt-7 space-y-4" onSubmit={submit}>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#001e00]">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required
            className="w-full rounded-xl border border-[#a8d8a8] bg-[#f8fdf8] px-4 py-3 text-sm text-[#001e00] outline-none transition placeholder:text-[#6ab86a] focus:border-[#001e00] focus:ring-1 focus:ring-[#001e00]" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[#001e00]">Password</label>
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required
              className="w-full rounded-xl border border-[#a8d8a8] bg-[#f8fdf8] px-4 py-3 pr-11 text-sm text-[#001e00] outline-none transition placeholder:text-[#6ab86a] focus:border-[#001e00] focus:ring-1 focus:ring-[#001e00]" />
            <button type="button" onClick={() => setShowPassword(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a8a3a] hover:text-[#001e00]">
              {showPassword ? eyeOff : eyeOn}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-[#001e00] py-3 text-sm font-semibold text-white transition hover:bg-[#0f3d0f] disabled:opacity-60">
          {loading ? 'Signing in...' : 'Sign in →'}
        </button>
      </form>
      <p className="mt-5 text-center text-sm text-[#3a8a3a]">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-[#001e00] hover:underline">Create account</Link>
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f4f0]">
      {/* ── MOBILE (< lg) ── */}
      <div className="flex min-h-screen flex-col lg:hidden">
        <div className="bg-[#001e00] px-6 py-8 text-center">
          <div className="mx-auto flex w-fit items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-12 w-12 object-contain" />
            <div className="text-left">
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d2b45a]">Maweshi Farm</div>
              <div className="text-lg font-bold text-white">Management System</div>
            </div>
          </div>
          <p className="mt-3 text-xs text-[#a8d8a8]">Animals · Crops · Dairy · Profit</p>
        </div>
        <div className="flex flex-1 items-start justify-center px-4 py-8">
          <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-lg">{formSection}</div>
        </div>
        <footer className="bg-[#001e00] px-6 py-4 text-center text-xs text-[#a8d8a8]">© 2026 Maweshi Farm Management</footer>
      </div>

      {/* ── DESKTOP (lg+) ── */}
      <div className="hidden min-h-screen lg:flex">
        {/* Left branding */}
        <div className="flex w-5/12 flex-col justify-between bg-[#001e00] p-12">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="logo" className="h-11 w-11 object-contain" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d2b45a]">Maweshi Farm</div>
              <div className="text-base font-bold text-white">Management System</div>
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-bold leading-tight text-white">Manage your farm<br />with confidence.</h2>
            <p className="mt-4 text-sm leading-6 text-[#a8d8a8]">Track animals, crops, dairy, expenses, sales and profit — all in one place.</p>
            <div className="mt-10 grid grid-cols-2 gap-4">
              {[['🐄','Animals & Livestock'],['🌾','Crop Management'],['🥛','Dairy Collection'],['📊','Profit Reports']].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5">
                  <span className="text-lg">{icon}</span>
                  <span className="text-xs font-medium text-[#a8d8a8]">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-xs text-[#a8d8a8]/60">© 2026 Maweshi Farm Management</div>
        </div>
        {/* Right form */}
        <div className="flex flex-1 items-center justify-center bg-[#f0f4f0] px-12">
          {formSection}
        </div>
      </div>
    </div>
  );
}
