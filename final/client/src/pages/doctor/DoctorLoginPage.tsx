import { useState } from 'react';
import { Lock, Phone, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { backendLogin, setBackendToken } from '@/lib/backendApi';

export default function DoctorLoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const result = await backendLogin(identifier, password);
      if (result.user.role !== 'doctor') {
        throw new Error('This account is not registered as a doctor.');
      }
      setBackendToken(result.token);
      localStorage.setItem('navjeevan_backend_user', JSON.stringify(result.user));
      navigate('/doctor', { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl border border-slate-100">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600">
          <Lock className="h-7 w-7" />
        </div>
        <h1 className="text-center font-display text-2xl font-bold text-slate-900">Doctor Login</h1>
        <p className="mt-1 text-center text-sm text-slate-500">Sign in to the Navjeevan doctor dashboard</p>

        {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

        <label className="label mt-5">Email or phone</label>
        <div className="relative">
          <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input className="input pl-10" value={identifier} onChange={e => setIdentifier(e.target.value)} placeholder="doctor@example.com or 9000000001" required />
        </div>

        <label className="label mt-4">Password</label>
        <div className="relative">
          <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
          <input className="input pl-10" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>

        <button disabled={loading} className="btn-primary mt-6 w-full">{loading ? 'Signing in…' : 'Sign In'}</button>
      </form>
    </div>
  );
}
