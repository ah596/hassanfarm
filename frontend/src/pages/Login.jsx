import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
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
          <div className="text-xs font-semibold uppercase tracking-[0.3em] text-[#d2b45a]">Goat Farm</div>
          <h1 className="mt-2 text-3xl font-bold text-[#001e00]">Sign in</h1>
          <p className="mt-2 text-sm text-[#3a8a3a]">Access animals, expenses, sales, and profit calculations.</p>
        </div>
        <div className="rounded-2xl border border-[#a8d8a8] bg-white p-8 shadow-card">
          <form className="space-y-5" onSubmit={submit}>
            <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
            <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" required />
            {error ? (
              <div className="rounded-xl border border-[#a8d8a8] bg-[#f0faf0] px-4 py-3 text-sm text-[#001e00]">{error}</div>
            ) : null}
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
