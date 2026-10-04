import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle, Clock3, Filter, Search, Star, Users, XCircle, Eye, X, RefreshCw } from 'lucide-react';
import { getAdminAppointments, getAdminReviews, updateAppointmentStatus, updateReviewStatus } from '@/services/adminApi';
import type { Appointment, Review } from '@/types';

type Tab = 'appointments' | 'reviews';
type AppointmentFilter = 'all' | Appointment['status'];

const STATUS_ORDER: AppointmentFilter[] = ['pending', 'confirmed', 'completed', 'cancelled'];

function isPastAppointment(appt: any) {
  const date = String(appt.preferred_date ?? appt.appointmentDate ?? appt.appointment_date ?? '');
  const slot = String(appt.appointment_time ?? appt.timeSlot ?? '');
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const value = new Date(`${date}T00:00:00`);
  if (Number.isNaN(value.getTime())) return false;
  if (!match) { value.setHours(23, 59, 59, 999); return value.getTime() < Date.now(); }
  let hours = Number(match[1]);
  if (hours === 12) hours = 0;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  value.setHours(hours, Number(match[2]), 0, 0);
  return value.getTime() <= Date.now();
}

function formatDate(d: string) {
  if (!d) return 'Date not available';
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  if (!y || !m || !day) return d;
  return new Date(y, m - 1, day).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getYear(d: string) {
  const year = Number(d?.slice(0, 4));
  return Number.isFinite(year) && year > 1900 ? year : null;
}

function getMonth(d: string) {
  const month = Number(d?.slice(5, 7));
  return Number.isFinite(month) && month >= 1 && month <= 12 ? month : null;
}

const STATUS_META: Record<Exclude<AppointmentFilter, 'all'>, { label: string; icon: typeof Clock3; badge: string; border: string }> = {
  pending: { label: 'Pending', icon: Clock3, badge: 'bg-amber-50 text-amber-700 border-amber-200', border: 'border-l-amber-400' },
  confirmed: { label: 'Confirmed', icon: CheckCircle, badge: 'bg-green-50 text-green-700 border-green-200', border: 'border-l-green-500' },
  completed: { label: 'Completed', icon: CheckCircle, badge: 'bg-blue-50 text-blue-700 border-blue-200', border: 'border-l-blue-500' },
  cancelled: { label: 'Cancelled', icon: XCircle, badge: 'bg-gray-50 text-gray-500 border-gray-200', border: 'border-l-gray-400' },
};

export default function AdminAppointmentsReviews() {
  const [tab, setTab] = useState<Tab>('appointments');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<AppointmentFilter>('all');
  const [month, setMonth] = useState('all');
  const [year, setYear] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    Promise.all([getAdminAppointments(), getAdminReviews()])
      .then(([appts, revs]) => {
        setAppointments(appts);
        setReviews(revs);
      })
      .finally(() => setLoading(false));
  }, []);

  async function refreshAppointments() {
    const data = await getAdminAppointments();
    setAppointments(data);
  }

  async function handleApptStatus(id: string, status: Appointment['status']) {
    await updateAppointmentStatus(id, status);
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  async function handleReviewStatus(id: string, status: Review['status']) {
    await updateReviewStatus(id, status);
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
  }

  const years = useMemo(() => {
    const values = new Set<number>();
    appointments.forEach((a) => {
      const y = getYear(a.preferred_date);
      if (y) values.add(y);
    });
    values.add(new Date().getFullYear());
    return Array.from(values).sort((a, b) => b - a);
  }, [appointments]);

  const counts = useMemo(() => {
    const base = { all: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 } as Record<AppointmentFilter, number>;
    appointments.forEach((a) => {
      const matchesMonth = month === 'all' || String(getMonth(a.preferred_date)) === month;
      const matchesYear = year === 'all' || String(getYear(a.preferred_date)) === year;
      if (matchesMonth && matchesYear) {
        base.all += 1;
        base[a.status] += 1;
      }
    });
    return base;
  }, [appointments, month, year]);

  const filteredAppointments = useMemo(() => {
    const q = search.trim().toLowerCase();
    return appointments.filter((a) => {
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesMonth = month === 'all' || String(getMonth(a.preferred_date)) === month;
      const matchesYear = year === 'all' || String(getYear(a.preferred_date)) === year;
      const matchesSearch = !q || [a.patient_name, a.patient_phone, a.patient_email, a.service, a.notes]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
      return matchesStatus && matchesMonth && matchesYear && matchesSearch;
    }).sort((a, b) => `${a.preferred_date}${a.id}`.localeCompare(`${b.preferred_date}${b.id}`));
  }, [appointments, statusFilter, month, year, search]);

  const pendingReviews = reviews.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex gap-1 bg-gray-200 rounded-xl p-1 mb-6 w-fit">
        {(['appointments', 'reviews'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              tab === t ? 'bg-white text-navy-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t} {t === 'appointments' && counts.pending > 0 && <span className="ml-1 bg-amber-400 text-white text-xs px-1.5 py-0.5 rounded-full">{counts.pending}</span>}
            {t === 'reviews' && pendingReviews > 0 && <span className="ml-1 bg-rose-700 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingReviews}</span>}
          </button>
        ))}
      </div>

      {loading && <div className="text-center py-12 text-gray-400">Loading…</div>}

      {!loading && tab === 'appointments' && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <div className="flex flex-col xl:flex-row xl:items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 shrink-0">
                <Filter size={17} className="text-rose-600" />
                Appointment filters
              </div>
              <div className="flex flex-wrap gap-3 flex-1">
                <select value={month} onChange={(e) => setMonth(e.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-100">
                  <option value="all">All months</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>{new Date(2000, i, 1).toLocaleString('en-IN', { month: 'long' })}</option>
                  ))}
                </select>
                <select value={year} onChange={(e) => setYear(e.target.value)} className="h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-100">
                  <option value="all">All years</option>
                  {years.map((y) => <option key={y} value={String(y)}>{y}</option>)}
                </select>
                <div className="relative flex-1 min-w-[220px]">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient, phone, email or service..." className="h-10 w-full rounded-lg border border-gray-200 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-rose-100" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <button onClick={() => setStatusFilter('all')} className={`rounded-xl border p-4 text-left transition ${statusFilter === 'all' ? 'border-rose-300 bg-rose-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
              <p className="text-xs font-medium text-gray-500">All</p><p className="mt-1 text-2xl font-bold text-gray-900">{counts.all}</p>
            </button>
            {STATUS_ORDER.map((status) => {
              const meta = STATUS_META[status];
              const Icon = meta.icon;
              return (
                <button key={status} onClick={() => setStatusFilter(status)} className={`rounded-xl border p-4 text-left transition ${statusFilter === status ? 'border-rose-300 bg-rose-50 shadow-sm' : 'border-gray-100 bg-white hover:border-gray-200'}`}>
                  <div className="flex items-center justify-between gap-2"><p className="text-xs font-medium text-gray-500">{meta.label}</p><Icon size={16} className="text-gray-400" /></div>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{counts[status]}</p>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {statusFilter === 'all' ? 'All Appointments' : `${STATUS_META[statusFilter].label} Appointments`}
              </h2>
              <p className="text-sm text-gray-500">{filteredAppointments.length} appointment{filteredAppointments.length === 1 ? '' : 's'} matching the selected filters</p>
            </div>
            {(month !== 'all' || year !== 'all' || search || statusFilter !== 'all') && (
              <button onClick={() => { setMonth('all'); setYear('all'); setSearch(''); setStatusFilter('all'); }} className="text-sm font-medium text-rose-600 hover:text-rose-700">Clear filters</button>
            )}
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100">
              <CalendarDays size={36} className="mx-auto mb-3 opacity-30" />
              No appointments match these filters.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appt) => {
                const meta = STATUS_META[appt.status];
                return (
                  <div key={appt.id} onClick={() => setSelectedAppointment(appt)} className={`bg-white rounded-2xl border border-gray-100 border-l-4 ${meta.border} shadow-sm p-5 cursor-pointer hover:shadow-md transition`}>
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${meta.badge}`}>{meta.label}</span>
                          <span className="text-xs text-gray-400 flex items-center gap-1"><CalendarDays size={12} /> {formatDate(appt.preferred_date)}</span>
                          {appt.reschedule_count ? <span className="text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">{appt.reschedule_count === 1 ? 'Rescheduled once' : `Rescheduled ${appt.reschedule_count} times`}</span> : null}
                        </div>
                        <p className="font-semibold text-gray-800">{appt.patient_name}</p>
                        <p className="text-sm text-gray-500">{appt.patient_phone}{appt.patient_email ? ` · ${appt.patient_email}` : ''}</p>
                        <p className="text-sm text-gray-600 mt-1 capitalize">{appt.service.replace(/-/g, ' ')}</p>
                        {appt.notes && <p className="text-xs text-gray-400 italic mt-1">“{appt.notes}”</p>}
                      </div>
                      <div className="flex gap-2 flex-wrap lg:justify-end">
                        {appt.status === 'pending' && !isPastAppointment(appt) && <button onClick={() => handleApptStatus(appt.id, 'confirmed')} className="flex items-center gap-1.5 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600"><CheckCircle size={13} /> Confirm</button>}
                        <button onClick={(e) => { e.stopPropagation(); setSelectedAppointment(appt); }} className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50"><Eye size={13} /> Details</button>
                        {appt.status === 'confirmed' && new Date(`${appt.appointment_date || appt.preferred_date}T${(() => { const m=String(appt.appointment_time||'').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i); if(!m)return '00:00'; let h=Number(m[1]); if(h===12)h=0; if(m[3].toUpperCase()==='PM')h+=12; return `${String(h).padStart(2,'0')}:${m[2]}`; })()}:00`) <= new Date() && <button onClick={(e) => { e.stopPropagation(); handleApptStatus(appt.id, 'completed'); }} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600"><CheckCircle size={13} /> Mark Done</button>}
                        {appt.status !== 'cancelled' && appt.status !== 'completed' && <button onClick={(e) => { e.stopPropagation(); handleApptStatus(appt.id, 'cancelled'); }} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><XCircle size={13} /> Cancel</button>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!loading && tab === 'reviews' && (
        <div className="space-y-3">
          {reviews.length === 0 && <div className="bg-white rounded-2xl p-12 text-center text-gray-400 border border-gray-100"><Star size={36} className="mx-auto mb-3 opacity-30" />No reviews yet.</div>}
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize ${review.status === 'approved' ? 'bg-green-50 text-green-700 border-green-200' : review.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{review.status}</span>
                    <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={11} className={s <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />)}</div>
                  </div>
                  <p className="font-medium text-gray-800 text-sm">{review.patient_name}</p>
                  <p className="text-gray-600 text-sm mt-1">“{review.comment}”</p>
                  <p className="text-xs text-gray-400 mt-1">{new Date(review.created_at).toLocaleDateString('en-IN')}</p>
                </div>
                {review.status === 'pending' && <div className="flex gap-2"><button onClick={() => handleReviewStatus(review.id, 'approved')} className="flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600"><CheckCircle size={12} /> Approve</button><button onClick={() => handleReviewStatus(review.id, 'rejected')} className="flex items-center gap-1 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100"><XCircle size={12} /> Reject</button></div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setSelectedAppointment(null)}>
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div><h3 className="text-lg font-bold text-gray-900">Appointment Details</h3><p className="text-xs text-gray-500">Complete appointment information</p></div>
              <button onClick={() => setSelectedAppointment(null)} className="p-2 rounded-lg hover:bg-gray-100"><X size={20} /></button>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><p className="text-xs text-gray-400">Patient</p><p className="font-semibold text-gray-800">{selectedAppointment.patient_name}</p></div>
              <div><p className="text-xs text-gray-400">Status</p><p className="font-semibold capitalize text-gray-800">{selectedAppointment.status}</p></div>
              <div><p className="text-xs text-gray-400">Phone</p><p>{selectedAppointment.patient_phone || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Email</p><p className="break-all">{selectedAppointment.patient_email || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Service</p><p>{selectedAppointment.service}</p></div>
              <div><p className="text-xs text-gray-400">Visit Type</p><p>{selectedAppointment.appointment_type === 'video' ? 'Video Consultation' : 'Clinic Visit'}</p></div>
              <div><p className="text-xs text-gray-400">Current Date & Time</p><p>{formatDate(selectedAppointment.preferred_date)} · {selectedAppointment.appointment_time || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Doctor</p><p>{selectedAppointment.doctor_name || 'Assigned doctor'}{selectedAppointment.doctor_specialization ? ` · ${selectedAppointment.doctor_specialization}` : ''}</p></div>
              {selectedAppointment.reschedule_count ? <div className="sm:col-span-2 rounded-xl border border-indigo-100 bg-indigo-50 p-3"><p className="font-semibold text-indigo-800">Rescheduled by patient</p><p className="text-indigo-700 mt-1">Original: {selectedAppointment.original_date ? formatDate(selectedAppointment.original_date) : '—'} {selectedAppointment.original_time ? `· ${selectedAppointment.original_time}` : ''}</p><p className="text-indigo-700">Current: {formatDate(selectedAppointment.preferred_date)} · {selectedAppointment.appointment_time || '—'}</p></div> : null}
              <div className="sm:col-span-2"><p className="text-xs text-gray-400">Consultation Reason</p><p className="mt-1 whitespace-pre-wrap">{selectedAppointment.consultation_reason || selectedAppointment.notes || '—'}</p></div>
              <div className="sm:col-span-2"><p className="text-xs text-gray-400">Notes</p><p className="mt-1 whitespace-pre-wrap">{selectedAppointment.notes || '—'}</p></div>
              <div><p className="text-xs text-gray-400">Booked On</p><p>{new Date(selectedAppointment.created_at).toLocaleString('en-IN')}</p></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
