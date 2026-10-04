import { useState, type FormEvent } from 'react';
import { UserPlus, CheckCircle2, ArrowLeft } from 'lucide-react';
import { backendRequest } from '@/lib/backendApi';

interface AddDoctorProps {
  onCreated: () => void;
}

const initial = {
  fullName: '', email: '', phone: '', password: '', qualification: '',
  specialization: '', experience: '', consultationFee: '', registrationNumber: '', bio: '',
};

export default function AddDoctor({ onCreated }: AddDoctorProps) {
  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const set = (key: keyof typeof initial, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setError('');
    setMessage('');
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      await backendRequest('/doctors', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          experience: Number(form.experience),
          consultationFee: Number(form.consultationFee),
        }),
      });
      setMessage('Doctor account created successfully. The doctor can now log in from the main login page.');
      setForm(initial);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create doctor.');
    } finally { setLoading(false); }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onCreated} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500" title="Back">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-navy-900 font-serif">Add Doctor</h2>
          <p className="text-sm text-gray-400">Create a doctor account from the admin panel.</p>
        </div>
      </div>

      <form onSubmit={submit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        {error && <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</div>}
        {message && <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3"><CheckCircle2 size={17} className="mt-0.5" />{message}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            ['fullName','Full Name'], ['email','Email'], ['phone','Phone'], ['password','Temporary Password'],
            ['qualification','Qualification'], ['specialization','Specialization'], ['experience','Experience (years)'],
            ['consultationFee','Consultation Fee (₹)'], ['registrationNumber','Registration Number'],
          ] as const).map(([key,label]) => (
            <div key={key} className={key === 'registrationNumber' ? 'sm:col-span-2' : ''}>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
              <input required value={form[key]} type={key === 'email' ? 'email' : key === 'password' ? 'password' : key === 'experience' || key === 'consultationFee' ? 'number' : 'text'} onChange={(e) => set(key, e.target.value)} className="admin-input" />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={(e) => set('bio', e.target.value)} rows={4} className="admin-input resize-none" />
        </div>
        <button disabled={loading} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold disabled:opacity-60">
          <UserPlus size={16} />{loading ? 'Creating…' : 'Add Doctor'}
        </button>
      </form>
    </div>
  );
}
