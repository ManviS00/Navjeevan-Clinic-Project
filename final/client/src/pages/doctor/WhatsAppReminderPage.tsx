import { useEffect, useState } from 'react';
import { MessageCircle, Send, CalendarDays } from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import { EmptyState, ErrorState, Spinner } from '@/components/doctor/ui';
import { getAppointments } from '@/services/doctorApi';
import type { ClinicAppointment } from '@/types';

export default function WhatsAppReminderPage() {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { getAppointments().then(setAppointments).catch(e => setError(e instanceof Error ? e.message : 'Failed to load appointments')).finally(() => setLoading(false)); }, []);
  const upcoming = appointments.filter(a => a.appointment_date >= new Date().toISOString().slice(0,10) && a.status !== 'cancelled').sort((a,b) => `${a.appointment_date}${a.appointment_time}`.localeCompare(`${b.appointment_date}${b.appointment_time}`));
  function send(a: ClinicAppointment) {
    const phone = (a.patient?.phone || '').replace(/\D/g, '');
    if (!phone) { setError('This patient does not have a phone number.'); return; }
    const message = `Hello ${a.patient?.name || 'Patient'}, this is a reminder from Navjeevan Clinic. Your appointment is on ${a.appointment_date} at ${a.appointment_time}. Please arrive on time. Thank you.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  }
  return <Layout title="WhatsApp Reminders" subtitle="Send appointment reminders to patients">
    {error && <div className="mb-4"><ErrorState message={error} /></div>}
    {loading ? <div className="flex justify-center py-20"><Spinner className="h-8 w-8" /></div> : upcoming.length === 0 ? <div className="card"><EmptyState icon={MessageCircle} title="No upcoming appointments" /></div> : <div className="card divide-y divide-slate-100">{upcoming.map(a => <div key={a.id} className="p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold text-slate-900">{a.patient?.name ?? 'Patient'}</p><p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><CalendarDays className="h-4 w-4" />{a.appointment_date} · {a.appointment_time}</p><p className="text-xs text-slate-400">{a.patient?.phone || 'No phone number'}</p></div><button onClick={() => send(a)} className="btn-primary"><Send className="h-4 w-4" /> Send WhatsApp Reminder</button></div>)}</div>}
  </Layout>;
}
