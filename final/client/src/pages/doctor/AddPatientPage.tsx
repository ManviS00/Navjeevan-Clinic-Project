import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import { Spinner } from '@/components/doctor/ui';
import { createPatient } from '@/services/doctorApi';

export default function AddPatientPage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    age: '',
    phone: '',
    email: '',
    address: '',
    medical_history: '',
    current_medicines: '',
    notes: '',
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.age) {
      setError('Name and age are required.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createPatient({
        name: form.name.trim(),
        age: Number(form.age),
        phone: form.phone || null,
        email: form.email || null,
        address: form.address || null,
        photo_url: null,
        medical_history: form.medical_history || null,
        current_medicines: form.current_medicines || null,
        notes: form.notes || null,
        last_visit: null,
      });
      navigate(`/doctor/patients/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save patient');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Add New Patient" subtitle="Register a new patient record">
      <button
        onClick={() => navigate('/doctor/patients')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to patients
      </button>

      <form onSubmit={handleSubmit} className="card mx-auto max-w-2xl p-6">
        {error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Full Name *</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Riya Sharma"
            />
          </div>
          <div>
            <label className="label">Age *</label>
            <input
              type="number"
              className="input"
              value={form.age}
              onChange={(e) => set('age', e.target.value)}
              placeholder="27"
            />
          </div>
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="98765 43210"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Email</label>
            <input
              className="input"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="patient@example.com"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input
              className="input"
              value={form.address}
              onChange={(e) => set('address', e.target.value)}
              placeholder="House, street, city"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Medical History</label>
            <textarea
              className="input min-h-[80px]"
              value={form.medical_history}
              onChange={(e) => set('medical_history', e.target.value)}
              placeholder="Known conditions, allergies, past surgeries..."
            />
          </div>
          <div>
            <label className="label">Current Medicines</label>
            <textarea
              className="input min-h-[80px]"
              value={form.current_medicines}
              onChange={(e) => set('current_medicines', e.target.value)}
              placeholder="Metformin 500mg..."
            />
          </div>
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[80px]"
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="Any extra notes..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/doctor/patients')}
            className="btn-outline"
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? <Spinner /> : <Save className="h-4 w-4" />}
            Save Patient
          </button>
        </div>
      </form>
    </Layout>
  );
}
