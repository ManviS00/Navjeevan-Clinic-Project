import { useEffect, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import AppointmentTable from '@/components/doctor/AppointmentTable';
import { Spinner, ErrorState, EmptyState } from '@/components/doctor/ui';
import { getAppointments, getPatients, updateAppointment } from '@/services/doctorApi';
import type { ClinicAppointment, Patient } from '@/types';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'today' | 'upcoming' | 'calendar'>('today');
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  useEffect(() => {
    (async () => {
      try {
        const [a, p] = await Promise.all([getAppointments(), getPatients()]);
        setAppointments(a);
        setPatients(p);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load appointments');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todays = appointments
    .filter((a) => a.appointment_date === todayStr)
    .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
  const upcoming = appointments
    .filter((a) => a.appointment_date > todayStr)
    .sort((a, b) =>
      (a.appointment_date + a.appointment_time).localeCompare(
        b.appointment_date + b.appointment_time
      )
    );

  async function handleStatus(id: string, status: string) {
    try {
      await updateAppointment(id, { status });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  }

  // Calendar logic
  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const apptsByDate = appointments.reduce<Record<string, number>>((acc, a) => {
    acc[a.appointment_date] = (acc[a.appointment_date] ?? 0) + 1;
    return acc;
  }, {});

  function dateStr(d: number) {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return (
    <Layout title="Appointments" subtitle="Manage today's and upcoming visits">
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
          {(['today', 'upcoming', 'calendar'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium capitalize transition ${
                tab === t
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t === 'today' ? "Today's" : t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : tab === 'calendar' ? (
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => setCalMonth(new Date(year, month - 1, 1))}
              className="btn-ghost px-2 py-1"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="font-display text-lg font-bold text-slate-900">
              {calMonth.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCalMonth(new Date(year, month + 1, 1))}
              className="btn-ghost px-2 py-1"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-slate-400">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="py-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((d, i) => {
              if (d === null) return <div key={i} />;
              const ds = dateStr(d);
              const count = apptsByDate[ds] ?? 0;
              const isToday = ds === todayStr;
              return (
                <div
                  key={i}
                  className={`relative min-h-[64px] rounded-lg border p-1.5 text-left transition hover:border-brand-300 ${
                    isToday
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-slate-100 bg-white'
                  }`}
                >
                  <span
                    className={`text-xs font-semibold ${
                      isToday ? 'text-brand-700' : 'text-slate-500'
                    }`}
                  >
                    {d}
                  </span>
                  {count > 0 && (
                    <div className="mt-1">
                      <span className="badge bg-brand-100 text-brand-700 text-[10px]">
                        {count} appt{count > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <CalendarDays className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-base font-bold text-slate-900">
              {tab === 'today' ? "Today's Appointments" : 'Upcoming Appointments'}
            </h2>
          </div>
          {(tab === 'today' ? todays : upcoming).length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title={tab === 'today' ? 'No appointments today' : 'No upcoming appointments'}
              hint="Scheduled visits will appear here"
            />
          ) : (
            <AppointmentTable
              appointments={tab === 'today' ? todays : upcoming}
              loading={false}
              onStatusChange={handleStatus}
            />
          )}
        </div>
      )}
    </Layout>
  );
}
