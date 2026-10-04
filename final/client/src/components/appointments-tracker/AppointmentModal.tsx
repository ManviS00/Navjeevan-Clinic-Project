import { useMemo, useState } from 'react';
import { X, Video, Stethoscope } from 'lucide-react';
import { api } from '@/lib/api';
import { todayISO, toISODate, addDays, parseISODate } from '@/lib/date';

const APPOINTMENT_TYPES = [
  'Prenatal Checkup',
  'Ultrasound Screening',
  'Blood Test / Lab Screening',
  'Glucose Screening',
  'Vaccination',
  'Postpartum Checkup',
  'Gynecology Consultation',
  'Other',
];

// Half-hour slots from 9:00 AM to 1:00 PM (last bookable slot is 12:30).
const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'];

function formatTimeLabel(t: string) {
  const [h, m] = t.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function AppointmentModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const minDate = todayISO();
  const maxDate = useMemo(() => toISODate(addDays(new Date(), 7)), []);

  const [type, setType] = useState('');
  const [date, setDate] = useState(minDate);
  const [time, setTime] = useState('');
  const [mode, setMode] = useState<'video' | 'physical' | ''>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Appointments can only be booked Monday–Saturday (not Sunday).
  const isSunday = parseISODate(date).getDay() === 0;

  async function save() {
    setError(null);
    if (!type) { setError('Please select the type of appointment.'); return; }
    if (date < minDate || date > maxDate) { setError('Appointments can only be booked within the next week.'); return; }
    if (isSunday) { setError('Appointments are only available Monday through Saturday.'); return; }
    if (!time) { setError('Please select a time between 9 AM and 1 PM.'); return; }
    if (!mode) { setError('Please choose video call or physical visit.'); return; }

    setSaving(true);
    try {
      await api.createAppointment({
        title: type,
        date,
        time,
        location: mode === 'video' ? 'Video Call' : 'Physical Visit',
        notes: null,
        completed: false,
      });
      setSaving(false);
      onSaved();
    } catch (err) {
      setSaving(false);
      setError((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Add Appointment</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type of appointment</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none bg-white"
            >
              <option value="">Select type…</option>
              {APPOINTMENT_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              />
              {isSunday && <p className="text-xs text-red-500 mt-1">Not available on Sundays.</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none bg-white"
              >
                <option value="">Select time…</option>
                {TIME_SLOTS.map((t) => (
                  <option key={t} value={t}>{formatTimeLabel(t)}</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-xs text-gray-400 -mt-2">You can book up to 1 week ahead, Monday–Saturday, 9 AM–1 PM.</p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Mode</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('video')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition ${
                  mode === 'video' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Video className="w-4 h-4" /> Video Call
              </button>
              <button
                type="button"
                onClick={() => setMode('physical')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-medium text-sm transition ${
                  mode === 'physical' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Stethoscope className="w-4 h-4" /> Physical Visit
              </button>
            </div>
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
