import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { Appointment } from '@/lib/types';
import { todayISO } from '@/lib/date';
import { Plus, X, CheckCircle2, Stethoscope, Video } from 'lucide-react';
import AppointmentModal from './AppointmentModal';

// Appointment booking is available to every signed-in user regardless of age
// or reproductive stage — it must stay reachable even when Period, Get
// Pregnant, and Pregnancy are all disabled for the account.
export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try { setAppointments((await api.getAppointments()) as Appointment[]); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

  const upcoming = appointments.filter((a) => !a.completed && a.date >= todayISO()).sort((a, b) => a.date.localeCompare(b.date));
  const past = appointments.filter((a) => a.completed || a.date < todayISO()).sort((a, b) => b.date.localeCompare(a.date));

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
          <p className="text-xl sm:text-2xl text-brand-600 font-semibold mt-1">Taking care of yourself is always worth the visit 💗</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition shadow-md shadow-brand-200">
          <Plus className="w-4 h-4" /> Add Appointment
        </button>
      </div>

      {upcoming.length === 0 && past.length === 0 && (
        <div className="bg-white rounded-2xl border border-brand-100 p-8 text-center">
          <Stethoscope className="w-10 h-10 text-brand-200 mx-auto mb-3" />
          <p className="text-gray-500">No appointments yet. Add your next visit to get reminders.</p>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Upcoming</h3>
          {upcoming.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl p-4 border border-brand-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs text-brand-400">{new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</span>
                <span className="text-lg font-bold text-brand-600">{new Date(a.date + 'T00:00:00').getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{a.title}</p>
                <p className="text-sm text-gray-400 flex items-center gap-1">
                  {a.time && `${a.time} · `}
                  {a.location === 'Video Call' ? (
                    <span className="inline-flex items-center gap-1"><Video className="w-3.5 h-3.5" /> Video Call</span>
                  ) : a.location === 'Physical Visit' ? (
                    <span className="inline-flex items-center gap-1"><Stethoscope className="w-3.5 h-3.5" /> Physical Visit</span>
                  ) : (
                    a.location || 'No mode set'
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={async () => { await api.updateAppointment(a.id, { completed: true }); fetchAppointments(); }}
                  className="p-2 rounded-lg text-green-500 hover:bg-green-50 transition"
                  title="Mark complete"
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <button
                  onClick={async () => { await api.deleteAppointment(a.id); fetchAppointments(); }}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Past</h3>
          {past.slice(0, 10).map((a) => (
            <div key={a.id} className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 opacity-60">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs text-gray-400">{new Date(a.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</span>
                <span className="text-lg font-bold text-gray-500">{new Date(a.date + 'T00:00:00').getDate()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-700 line-through">{a.title}</p>
                <p className="text-sm text-gray-400">{a.location || ''}</p>
              </div>
              {a.completed && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
              <button
                onClick={async () => { await api.deleteAppointment(a.id); fetchAppointments(); }}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AppointmentModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); fetchAppointments(); }} />}
    </div>
  );
}
