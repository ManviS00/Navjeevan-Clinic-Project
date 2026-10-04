import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Pill,
  History,
  FileText,
  FlaskConical,
  CalendarClock,
  StickyNote,
  User,
} from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import { Spinner, ErrorState, EmptyState } from '@/components/doctor/ui';
import {
  getPatient,
  getPrescriptionsByPatient,
  getReportsByPatient,
} from '@/services/doctorApi';
import type { Patient, Prescription, Report } from '@/types';

export default function PatientProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [p, rx, reps] = await Promise.all([
          getPatient(id),
          getPrescriptionsByPatient(id),
          getReportsByPatient(id),
        ]);
        setPatient(p);
        setPrescriptions(rx);
        setReports(reps);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load patient');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <Layout title="Patient Profile">
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      </Layout>
    );
  }

  if (error || !patient) {
    return (
      <Layout title="Patient Profile">
        <ErrorState message={error ?? 'Patient not found'} />
      </Layout>
    );
  }

  const info = [
    { icon: Phone, label: 'Phone', value: patient.phone },
    { icon: Mail, label: 'Email', value: patient.email },
    { icon: MapPin, label: 'Address', value: patient.address },
  ];

  return (
    <Layout title={patient.name} subtitle={patient.age != null ? `Age ${patient.age} years` : "Age not available"}>
      <Link to="/doctor/patients" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-600">
        <ArrowLeft className="h-4 w-4" />
        Back to patients
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: profile card */}
        <div className="space-y-6">
          <div className="card p-5 text-center">
            <div
              className="mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-brand-50 text-3xl font-bold uppercase text-brand-700 ring-4 ring-brand-50"
              aria-label={`Profile initials for ${patient.name}`}
            >
              {(patient.name?.trim().charAt(0) || 'P').toUpperCase()}
            </div>
            <h2 className="mt-4 font-display text-lg font-bold text-slate-900">
              {patient.name}
            </h2>
            <p className="text-sm text-slate-400">
              {patient.age != null ? `Age: ${patient.age} years` : 'Age not available'}
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                to={`/doctor/prescriptions/new?patient=${patient.id}`}
                className="btn-primary flex-1 text-xs"
              >
                <Pill className="h-3.5 w-3.5" />
                Prescribe
              </Link>
              <Link
                to={`/doctor/reports?patient=${patient.id}`}
                className="btn-outline flex-1 text-xs"
              >
                <FlaskConical className="h-3.5 w-3.5" />
                Reports
              </Link>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <User className="h-4 w-4 text-brand-600" />
              Contact Details
            </h3>
            <dl className="space-y-3">
              {info.map((i) => (
                <div key={i.label} className="flex items-start gap-2.5 text-sm">
                  <i.icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div>
                    <dt className="text-xs text-slate-400">{i.label}</dt>
                    <dd className="font-medium text-slate-700">{i.value ?? '—'}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-700">
              <StickyNote className="h-4 w-4 text-brand-600" />
              Notes
            </h3>
            <p className="text-sm text-slate-600">{patient.notes ?? 'No notes recorded.'}</p>
          </div>
        </div>

        {/* Right: medical info */}
        <div className="space-y-6 lg:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <History className="h-4 w-4 text-brand-600" />
                Medical History
              </h3>
              <p className="text-sm text-slate-600">
                {patient.medical_history ?? 'No history recorded.'}
              </p>
            </div>
            <div className="card p-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                <Pill className="h-4 w-4 text-brand-600" />
                Current Medicines
              </h3>
              <p className="text-sm text-slate-600">
                {patient.current_medicines ?? 'No current medicines.'}
              </p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <FileText className="h-4 w-4 text-brand-600" />
                Previous Prescriptions
              </h3>
              <span className="badge bg-slate-100 text-slate-600">
                {prescriptions.length}
              </span>
            </div>
            {prescriptions.length === 0 ? (
              <EmptyState icon={FileText} title="No prescriptions yet" />
            ) : (
              <div className="divide-y divide-slate-50">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">
                        {rx.diagnosis ?? 'Untitled'}
                      </p>
                      <span className="text-xs text-slate-400">
                        {new Date(rx.created_at).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {rx.medicines?.map((m, i) => (
                        <span
                          key={i}
                          className="badge bg-brand-50 text-brand-700"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                    {rx.follow_up_date && (
                      <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-400">
                        <CalendarClock className="h-3 w-3" />
                        Follow-up: {rx.follow_up_date}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <FlaskConical className="h-4 w-4 text-brand-600" />
                Lab Reports
              </h3>
              <span className="badge bg-slate-100 text-slate-600">
                {reports.length}
              </span>
            </div>
            {reports.length === 0 ? (
              <EmptyState icon={FlaskConical} title="No reports uploaded" />
            ) : (
              <div className="divide-y divide-slate-50">
                {reports.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {r.title ?? r.type}
                      </p>
                      <p className="text-xs text-slate-400">
                        {r.type} · {new Date(r.created_at).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                    {r.file_url && (
                      <a
                        href={r.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost text-xs"
                      >
                        Download
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
