import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { CalendarDays, Users, Zap, TrendingUp, Activity } from 'lucide-react';
import Layout from '@/components/doctor/Layout';
import AppointmentTable from '@/components/doctor/AppointmentTable';
import PatientList from '@/components/doctor/PatientList';
import QuickActions from '@/components/doctor/QuickActions';
import { ErrorState } from '@/components/doctor/ui';
import { getAppointments, updateAppointment, getPatients, getPrescriptions } from '@/services/doctorApi';
import type { ClinicAppointment, Patient, Prescription } from '@/types';

const PIE_COLORS = ['#c41e3a', '#212c53', '#f9607f', '#5c6da8', '#ff93a8', '#8a9bc9'];

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<ClinicAppointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [appts, pats, rx] = await Promise.all([getAppointments(), getPatients(), getPrescriptions()]);
        setAppointments(appts);
        setPatients(pats);
        setPrescriptions(rx);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const upcomingAppointments = appointments
    .filter((a) => a.appointment_date >= todayStr && a.status !== 'cancelled')
    .sort((a, b) => `${a.appointment_date}${a.appointment_time}`.localeCompare(`${b.appointment_date}${b.appointment_time}`))
    .slice(0, 5);

  const recentPatients = patients.slice(0, 6);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthlyData = monthNames.slice(0, new Date().getMonth() + 1).map((month, index) => {
    const monthKey = `${new Date().getFullYear()}-${String(index + 1).padStart(2, '0')}`;
    const monthAppointments = appointments.filter(a => a.appointment_date.startsWith(monthKey));
    const patientIds = new Set(monthAppointments.map(a => a.patient_id));
    return { month, patients: patientIds.size, appointments: monthAppointments.length };
  });

  const ageBuckets = [
    { range: '10-17', min: 10, max: 17 }, { range: '18-25', min: 18, max: 25 },
    { range: '26-30', min: 26, max: 30 }, { range: '31-35', min: 31, max: 35 },
    { range: '36-40', min: 36, max: 40 }, { range: '41-50', min: 41, max: 50 }, { range: '51+', min: 51, max: 200 },
  ];
  const ageDistribution = ageBuckets.map(b => ({ range: b.range, count: patients.filter(p => p.age != null && p.age >= b.min && p.age <= b.max).length }));

  const diseaseMap = new Map<string, number>();
  prescriptions.forEach(rx => {
    const key = (rx.diagnosis || 'Other').trim() || 'Other';
    diseaseMap.set(key, (diseaseMap.get(key) || 0) + 1);
  });
  const commonDiseases = Array.from(diseaseMap.entries()).sort((a,b) => b[1]-a[1]).slice(0,6).map(([name,value]) => ({name,value}));
  if (!commonDiseases.length) commonDiseases.push({ name: 'No prescriptions yet', value: 1 });

  const statusData = [
    { name: 'Pending', value: appointments.filter(a => a.status === 'pending').length },
    { name: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length },
    { name: 'Completed', value: appointments.filter(a => a.status === 'completed').length },
    { name: 'Cancelled', value: appointments.filter(a => a.status === 'cancelled').length },
  ];

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

  const stats = [
    {
      label: 'Total Patients',
      value: patients.length,
      icon: Users,
      tint: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'Total Appointments',
      value: appointments.length,
      icon: TrendingUp,
      tint: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Follow-up Rate',
      value: '86%',
      icon: Activity,
      tint: 'bg-teal-50 text-teal-600',
    },
  ];

  return (
    <Layout title="Welcome Dr. Aayushi Pal" subtitle="Live clinic data from your database">
      {error && (
        <div className="mb-4">
          <ErrorState message={error} />
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`mb-3 grid h-10 w-10 place-items-center rounded-lg ${s.tint}`}>
              <s.icon className="h-5 w-5" />
            </div>
            <p className="font-display text-2xl font-extrabold text-slate-900">
              {s.value}
            </p>
            <p className="text-xs text-slate-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-brand-600" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Upcoming Appointments
              </h2>
            </div>
            <span className="badge bg-brand-50 text-brand-700">
              {upcomingAppointments.length} upcoming
            </span>
          </div>
          <AppointmentTable
            appointments={upcomingAppointments}
            loading={loading}
            onStatusChange={handleStatus}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="card lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-brand-600" />
              <h2 className="font-display text-base font-bold text-slate-900">
                Recent Patients
              </h2>
            </div>
          </div>
          <PatientList patients={recentPatients} />
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
            <Zap className="h-5 w-5 text-brand-600" />
            <h2 className="font-display text-base font-bold text-slate-900">
              Quick Actions
            </h2>
          </div>
          <div className="p-4">
            <QuickActions />
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-base font-bold text-slate-900">
          Clinic Analytics
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <h3 className="mb-4 font-display text-base font-bold text-slate-900">
              Monthly Patients & Appointments
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="patients" fill="#c41e3a" radius={[6, 6, 0, 0]} />
                <Bar dataKey="appointments" fill="#ffc2cd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-display text-base font-bold text-slate-900">
              Patient Age Distribution
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ageDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="range"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={60}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="count" fill="#212c53" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="mb-4 font-display text-base font-bold text-slate-900">
              Most Common Diseases
            </h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={commonDiseases}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {commonDiseases.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5 lg:col-span-1">
            <h3 className="mb-4 font-display text-base font-bold text-slate-900">
              Appointment Status
            </h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </Layout>
  );
}
