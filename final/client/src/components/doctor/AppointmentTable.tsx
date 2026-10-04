import { Link } from 'react-router-dom';
import { Eye, Play, FileText, CheckCircle } from 'lucide-react';
import type { ClinicAppointment } from '@/types';
import { StatusBadge, Spinner, EmptyState } from './ui';
import { CalendarX } from 'lucide-react';

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || 'P';
}

function appointmentStart(date: string, slot: string) {
  const match = String(slot || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours === 12) hours = 0;
  if (match[3].toUpperCase() === 'PM') hours += 12;
  const value = new Date(`${date}T00:00:00`);
  value.setHours(hours, minutes, 0, 0);
  return value;
}

interface Props {
  appointments: ClinicAppointment[];
  loading: boolean;
  onStatusChange: (id: string, status: string) => void;
}

export default function AppointmentTable({ appointments, loading, onStatusChange }: Props) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-7 w-7" />
      </div>
    );
  }

  if (!appointments.length) {
    return <EmptyState icon={CalendarX} title="No appointments today" hint="Schedule one from the Appointments page" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-4 py-3 font-semibold">Time</th>
            <th className="px-4 py-3 font-semibold">Patient</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Age</th>
            <th className="hidden px-4 py-3 font-semibold lg:table-cell">Reason</th>
            <th className="px-4 py-3 font-semibold">Visit Type</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {appointments.map((a) => {
            const start = appointmentStart(a.appointment_date, a.appointment_time);
            const canStart = Boolean(start && start.getTime() <= Date.now() && a.status === 'confirmed');
            return (
            <tr key={a.id} className="group transition hover:bg-slate-50/70">
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-600">
                {a.appointment_date ? new Date(`${a.appointment_date}T00:00:00`).toLocaleDateString('en-IN') : '-'}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold text-slate-700">
                {a.appointment_time}
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/doctor/patients/${a.patient_id}`}
                  className="flex items-center gap-2.5"
                >
                  {a.patient?.photo_url ? (
                    <img src={a.patient.photo_url} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-brand-50 text-brand-700 grid place-items-center text-xs font-bold">
                      {initials(a.patient?.name ?? 'Patient')}
                    </div>
                  )}
                  <span className="font-medium text-slate-800 hover:text-brand-600">
                    {a.patient?.name ?? 'Unknown'}
                  </span>
                </Link>
              </td>
              <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                {a.patient?.age ?? '-'}
              </td>
              <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">
                {a.reason ?? '-'}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <span className={`inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold ${a.appointment_type === 'video' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {a.appointment_type === 'video' ? 'Video Consultation' : 'Clinic Visit'}
                  </span>
                  {a.service_name && <span className="text-[11px] text-slate-400 truncate max-w-[150px]">{a.service_name}</span>}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1"><StatusBadge status={a.status} />{a.reschedule_count ? <span className="text-[10px] font-medium text-indigo-700">{a.reschedule_count === 1 ? 'Rescheduled once' : `Rescheduled ${a.reschedule_count} times`}</span> : null}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  {a.status === 'confirmed' && a.appointment_type === 'video' && (
                    <button
                      onClick={() => {
                        if (!canStart) return;
                        window.location.href = `/doctor/video?appointment=${encodeURIComponent(a.id)}`;
                      }}
                      className="btn-ghost px-2 py-1.5 text-xs"
                      title={!canStart ? `This appointment starts at ${a.appointment_time}` : 'Open video consultation'}
                      disabled={!canStart}
                    >
                      <Play className="h-3.5 w-3.5 text-brand-600" />
                      Start
                    </button>
                  )}
                  {a.status === 'pending' && (
                    <button
                      onClick={() => onStatusChange(a.id, 'confirmed')}
                      className="btn-ghost px-2 py-1.5 text-xs"
                      title="Confirm"
                    >
                      <CheckCircle className="h-3.5 w-3.5 text-brand-600" />
                      Confirm
                    </button>
                  )}
                  {a.status === 'completed' && (
                    <Link
                      to={`/doctor/prescriptions/new?patient=${a.patient_id}&appointment=${a.id}`}
                      className="btn-ghost px-2 py-1.5 text-xs"
                      title="Add prescription"
                    >
                      <FileText className="h-3.5 w-3.5 text-brand-600" />
                      Rx
                    </Link>
                  )}
                  <Link
                    to={`/doctor/patients/${a.patient_id}`}
                    className="btn-ghost px-2 py-1.5 text-xs"
                    title="View profile"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
