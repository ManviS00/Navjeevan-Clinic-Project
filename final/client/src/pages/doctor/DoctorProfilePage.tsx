import { useEffect, useState } from 'react';
import {
  GraduationCap,
  Briefcase,
  Stethoscope,
  Clock,
  IndianRupee,
  Save,
  Award,
} from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import { Spinner, ErrorState } from '@/components/doctor/ui';
import { getDoctorProfile, updateDoctorProfile } from '@/services/doctorApi';
import type { DoctorProfile } from '@/types';

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<DoctorProfile>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getDoctorProfile();
        setProfile(data);
        setForm(data ?? {});
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    try {
      const updated = await updateDoctorProfile(profile.id, form);
      setProfile(updated);
      setEditing(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Layout title="Doctor Profile">
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      </Layout>
    );
  }

  if (error || !profile) {
    return (
      <Layout title="Doctor Profile">
        <ErrorState message={error ?? 'Profile not found'} />
      </Layout>
    );
  }

  const infoItems = [
    { icon: GraduationCap, label: 'Qualification', value: profile.qualification },
    { icon: Briefcase, label: 'Experience', value: profile.experience },
    { icon: Stethoscope, label: 'Specialization', value: profile.specialization },
    { icon: Clock, label: 'Working Hours', value: profile.working_hours },
    {
      icon: IndianRupee,
      label: 'Consultation Fee',
      value: `₹${profile.consultation_fee ?? 0}`,
    },
  ];

  return (
    <Layout title="Doctor Profile" subtitle="Your professional information">
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <div className="card p-6 text-center">
          <div className="relative mx-auto h-28 w-28">
            <img src={profile.profile_picture || "/doctor/doctor.jpeg"}
                  alt={profile.name}
                  className="w-full h-full object-cover"/>
            <div className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white ring-4 ring-white">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-slate-900">
            {profile.name}
          </h2>
          <p className="text-sm text-brand-600 font-medium">
            {profile.specialization}
          </p>
          <p className="mt-2 text-sm text-slate-500">{profile.bio}</p>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="btn-outline mt-4 w-full"
            >
              Edit Profile
            </button>
          )}
        </div>

        {/* Details / Edit form */}
        <div className="lg:col-span-2">
          {editing ? (
            <form onSubmit={handleSave} className="card p-6">
              <h3 className="mb-4 font-display text-base font-bold text-slate-900">
                Edit Profile
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Name</label>
                  <input
                    className="input"
                    value={form.name ?? ''}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Qualification</label>
                  <input
                    className="input"
                    value={form.qualification ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, qualification: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Experience</label>
                  <input
                    className="input"
                    value={form.experience ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, experience: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Specialization</label>
                  <input
                    className="input"
                    value={form.specialization ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, specialization: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Working Hours</label>
                  <input
                    className="input"
                    value={form.working_hours ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, working_hours: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="label">Consultation Fee (₹)</label>
                  <input
                    type="number"
                    className="input"
                    value={form.consultation_fee ?? 0}
                    onChange={(e) =>
                      setForm({ ...form, consultation_fee: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Bio</label>
                  <textarea
                    className="input min-h-[80px]"
                    value={form.bio ?? ''}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-5 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setForm(profile);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Spinner /> : <Save className="h-4 w-4" />}
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="card p-6">
              <h3 className="mb-4 font-display text-base font-bold text-slate-900">
                Professional Details
              </h3>
              <dl className="grid gap-4 sm:grid-cols-2">
                {infoItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-3.5"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <dt className="text-xs font-medium text-slate-400">
                        {item.label}
                      </dt>
                      <dd className="text-sm font-semibold text-slate-800">
                        {item.value ?? '—'}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
