import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Mail, Clock, IndianRupee, GraduationCap, Stethoscope, Save, CheckCircle2 } from 'lucide-react';
import { getDoctorProfile, updateDoctorProfile } from '@/services/doctorApi';
import type { DoctorProfile } from '@/types';

const emptyForm = {
  name: '',
  qualification: '',
  experience: '',
  specialization: '',
  working_hours: '',
  consultation_fee: '',
  bio: '',
};

export default function AdminDoctorProfile() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDoctorProfile()
      .then((p) => {
        setProfile(p);
        if (p) {
          setForm({
            name: p.name ?? '',
            qualification: p.qualification ?? '',
            experience: p.experience ?? '',
            specialization: p.specialization ?? '',
            working_hours: p.working_hours ?? '',
            consultation_fee: p.consultation_fee != null ? String(p.consultation_fee) : '',
            bio: p.bio ?? '',
          });
        }
      })
      .catch((e) => setError(e.message ?? 'Failed to load doctor profile'))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await updateDoctorProfile(profile.id, {
        name: form.name,
        qualification: form.qualification,
        experience: form.experience,
        specialization: form.specialization,
        working_hours: form.working_hours,
        consultation_fee: form.consultation_fee ? Number(form.consultation_fee) : null,
        bio: form.bio,
      });
      setProfile(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-center py-16 text-gray-400">Loading…</div>;

  if (!profile) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100 max-w-2xl mx-auto">
        <Stethoscope size={36} className="mx-auto mb-3 opacity-30" />
        No doctor profile found.
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
          {form.name.replace('Dr. ', '').charAt(0) || 'D'}
        </div>
        <div>
          <h2 className="font-bold text-navy-900 font-serif">{form.name || 'Doctor Profile'}</h2>
          <p className="text-xs text-gray-400">This information appears on the public site and booking page.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <Field label="Full Name">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="admin-input" placeholder="Dr. Aayushi Pal" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Qualification" icon={<GraduationCap size={14} />}>
            <input value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} className="admin-input" placeholder="MBBS, MS (Obs & Gynae)" />
          </Field>
          <Field label="Specialization" icon={<Stethoscope size={14} />}>
            <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className="admin-input" placeholder="Gynaecologist & Obstetrician" />
          </Field>
          <Field label="Experience">
            <input value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className="admin-input" placeholder="15 years" />
          </Field>
          <Field label="Consultation Fee (₹)" icon={<IndianRupee size={14} />}>
            <input type="number" value={form.consultation_fee} onChange={(e) => setForm({ ...form, consultation_fee: e.target.value })} className="admin-input" placeholder="800" />
          </Field>
          <Field label="Working Hours" icon={<Clock size={14} />}>
            <input value={form.working_hours} onChange={(e) => setForm({ ...form, working_hours: e.target.value })} className="admin-input" placeholder="Mon-Sat, 9:00 AM - 5:00 PM" />
          </Field>
          <Field label="Email (read-only)" icon={<Mail size={14} />}>
            <input disabled value={profile.email ?? ""} className="admin-input opacity-60 cursor-not-allowed" />
          </Field>
        </div>

        <Field label="Bio">
          <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={4} className="admin-input resize-none" placeholder="A short bio shown on the About page…" />
        </Field>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-sm font-semibold transition-colors disabled:opacity-60"
          >
            <Save size={16} />
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <CheckCircle2 size={16} /> Saved
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mb-1.5">
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}
