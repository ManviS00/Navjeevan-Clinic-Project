import { useCallback, useEffect, useMemo, useState } from 'react';
import { Video, ExternalLink, CalendarDays } from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import { EmptyState, ErrorState, Spinner } from '@/components/doctor/ui';
import { getAppointments } from '@/services/doctorApi';
import { getVideoAccess } from '@/lib/backendApi';
import type { ClinicAppointment } from '@/types';

export default function VideoConsultationPage() {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [openingId, setOpeningId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await getAppointments();
        if (mounted) setAppointments(data);
      } catch (e) {
        if (mounted) setError(e instanceof Error ? e.message : 'Failed to load video appointments');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    const refresh = window.setInterval(() => { void load(); }, 30000);
    return () => { mounted = false; window.clearInterval(refresh); };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const videoAppointments = useMemo(() => appointments
    .filter(a => a.appointment_type === 'video' && a.status === 'confirmed')
    // This page is for upcoming video consultations only. Once the scheduled
    // date/time has passed, the appointment is no longer shown here, so an
    // old appointment can never be displayed as "Live now" or "Start & Admit Patient".
    .filter(a => {
      const start = startFor(a);
      return Boolean(start && start.getTime() > now.getTime());
    })
    .sort((a, b) => `${a.appointment_date}${a.appointment_time}`.localeCompare(`${b.appointment_date}${b.appointment_time}`)), [appointments, now]);

  function startFor(a: ClinicAppointment) {
    const match = String(a.appointment_time || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    let hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (hours === 12) hours = 0;
    if (match[3].toUpperCase() === 'PM') hours += 12;
    const d = new Date(`${a.appointment_date}T00:00:00`);
    d.setHours(hours, minutes, 0, 0);
    return d;
  }

  function canStart(a: ClinicAppointment) {
    const start = startFor(a);
    // Doctor can enter up to 10 minutes before the scheduled time.
    return a.status === 'confirmed' && Boolean(start && start.getTime() - 10 * 60 * 1000 <= now.getTime() && start.getTime() > now.getTime());
  }

  function label(a: ClinicAppointment) {
    const start = startFor(a);
    if (!start) return 'Scheduled';
    const diff = start.getTime() - now.getTime();
    const minutes = Math.ceil(diff / 60000);
    if (minutes < 60) return `Starts in ${minutes} min`;
    return `Starts at ${a.appointment_time}`;
  }

  const startVideo = useCallback(async (a: ClinicAppointment) => {
    setOpeningId(a.id);
    setError(null);
    try {
      const result = await getVideoAccess(a.id);
      window.open(result.data.meetingLink, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The video consultation is not available yet.');
    } finally {
      setOpeningId(null);
    }
  }, []);

  return <Layout title="Video Consultation" subtitle="Confirmed video consultations remain available without a fixed session duration">
    {error && <div className="mb-4"><ErrorState message={error} /></div>}
    {loading ? <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div> : videoAppointments.length === 0 ? <div className="card"><EmptyState icon={Video} title="No upcoming video consultations" hint="Confirmed video appointments will appear here automatically." /></div> : <div className="grid gap-4">
      {videoAppointments.map(a => {
        const ready = canStart(a);
        return <div key={a.id} className="card p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-slate-900">{a.patient?.name ?? 'Patient'}</p>
              <span className="badge bg-blue-50 text-blue-700">Video Consultation</span>
            </div>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><CalendarDays className="h-4 w-4" />{a.appointment_date} · {a.appointment_time}</p>
            <p className="text-xs text-slate-400 mt-1">{a.service_name ?? 'Video consultation'} · {a.reason ?? 'Scheduled consultation'}</p>
            <p className={`text-xs mt-2 font-semibold ${ready ? 'text-green-600' : 'text-blue-600'}`}>
              {label(a)}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => startVideo(a)} disabled={!ready || openingId === a.id} className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
              <ExternalLink className="h-4 w-4" />
              {openingId === a.id ? 'Starting…' : ready ? 'Start & Admit Patient' : label(a)}
            </button>
          </div>
        </div>;
      })}
    </div>}
  </Layout>;
}
