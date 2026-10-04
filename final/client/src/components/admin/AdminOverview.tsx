import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Activity,
  ArrowDownRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  IndianRupee,
  MonitorPlay,
  RefreshCw,
  ShieldCheck,
  Star,
  Stethoscope,
  Users,
  Video,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { getDashboardStats } from '@/services/adminApi';
import type { AdminDashboardStats } from '@/types';

const NAVY = '#161E3D';
const ROSE = '#C41E3A';
const GREEN = '#16A34A';
const AMBER = '#D97706';
const SLATE = '#64748B';
const GRID = '#E5E7EB';

const tooltipStyle = {
  borderRadius: 12,
  border: '1px solid #E5E7EB',
  boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
  fontSize: 12,
};

function formatCurrency(value: number) {
  return `₹${Math.round(value).toLocaleString('en-IN')}`;
}

function EmptyChart({ message = 'No database data available for this period.' }: { message?: string }) {
  return <div className="h-full min-h-[250px] flex items-center justify-center text-sm text-gray-400">{message}</div>;
}

function SectionCard({
  title,
  subtitle,
  children,
  className = '',
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <h3 className="font-bold text-navy-900 font-serif text-[16px]">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  label,
  value,
  hint,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: ReactNode;
  tone: 'rose' | 'navy' | 'green' | 'amber' | 'blue';
}) {
  const tones = {
    rose: 'bg-rose-50 text-rose-700',
    navy: 'bg-slate-100 text-navy-900',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-blue-50 text-blue-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:-translate-y-0.5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tones[tone]}`}>{icon}</div>
        {hint && <span className="text-[10px] font-semibold text-gray-400 text-right">{hint}</span>}
      </div>
      <p className="text-2xl font-bold text-navy-900 mt-4 leading-none">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-2">{label}</p>
    </div>
  );
}

function AppointmentsTrend({ stats }: { stats: AdminDashboardStats }) {
  const data = stats.monthlyAppointments.map((item, index) => ({
    month: item.month,
    appointments: item.count,
    patients: stats.monthlyPatients[index]?.patients ?? 0,
  }));

  if (!data.some((x) => x.appointments || x.patients)) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height={290}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="appointmentsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ROSE} stopOpacity={0.22} />
            <stop offset="100%" stopColor={ROSE} stopOpacity={0.01} />
          </linearGradient>
          <linearGradient id="patientsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={NAVY} stopOpacity={0.16} />
            <stop offset="100%" stopColor={NAVY} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
        <Area type="monotone" dataKey="appointments" name="Appointments" stroke={ROSE} strokeWidth={2.5} fill="url(#appointmentsFill)" />
        <Area type="monotone" dataKey="patients" name="New patients" stroke={NAVY} strokeWidth={2} fill="url(#patientsFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function StatusChart({ data }: { data: AdminDashboardStats['appointmentStatusDistribution'] }) {
  const colors: Record<string, string> = {
    Pending: AMBER,
    Confirmed: '#2563EB',
    Completed: GREEN,
    Cancelled: '#94A3B8',
  };
  const total = data.reduce((sum, item) => sum + item.count, 0);

  if (!total) return <EmptyChart />;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
      <div className="h-[220px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="count" nameKey="status" innerRadius={58} outerRadius={82} paddingAngle={3} strokeWidth={0}>
              {data.map((item) => <Cell key={item.status} fill={colors[item.status] ?? SLATE} />)}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        </ResponsiveContainer>
        <div className="relative -mt-[145px] text-center pointer-events-none">
          <p className="text-2xl font-bold text-navy-900">{total}</p>
          <p className="text-[10px] text-gray-400">appointments</p>
        </div>
      </div>
      <div className="space-y-3">
        {data.map((item) => (
          <div key={item.status} className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[item.status] ?? SLATE }} />
            <span className="text-xs text-gray-600 flex-1">{item.status}</span>
            <span className="text-sm font-bold text-navy-900">{item.count}</span>
            <span className="text-[10px] text-gray-400 w-9 text-right">{Math.round((item.count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RevenueChart({ stats }: { stats: AdminDashboardStats }) {
  if (!stats.revenuePerMonth.some((x) => x.revenue > 0)) return <EmptyChart message="No paid appointments recorded for this period." />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={stats.revenuePerMonth} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [formatCurrency(value), 'Collected']} />
        <Bar dataKey="revenue" name="Collected revenue" fill={GREEN} radius={[6, 6, 0, 0]} maxBarSize={30} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function HorizontalBars({ data }: { data: AdminDashboardStats['serviceDistribution'] }) {
  if (!data.length) return <EmptyChart />;
  const max = Math.max(...data.map((item) => item.count), 1);
  return (
    <div className="space-y-4">
      {data.map((item, index) => (
        <div key={item.name}>
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="text-xs font-medium text-gray-600 truncate">{index + 1}. {item.name}</span>
            <span className="text-xs font-bold text-navy-900">{item.count}</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-rose-600" style={{ width: `${(item.count / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function AgeChart({ data }: { data: AdminDashboardStats['patientsByAgeGroup'] }) {
  if (!data.some((item) => item.patients)) return <EmptyChart message="Patient DOB data is not available yet." />;
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -15, bottom: 0 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="ageGroup" tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="patients" name="Patients" fill={NAVY} radius={[6, 6, 0, 0]} maxBarSize={38} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function DoctorChart({ data }: { data: AdminDashboardStats['doctorWiseAppointments'] }) {
  if (!data.length) return <EmptyChart message="No doctor appointment data for this period." />;
  const chartData = data.map((item) => ({ ...item, doctor: item.doctor.length > 18 ? `${item.doctor.slice(0, 18)}…` : item.doctor }));
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 10, bottom: 4 }}>
        <CartesianGrid stroke={GRID} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: SLATE }} axisLine={false} tickLine={false} />
        <YAxis dataKey="doctor" type="category" width={105} tick={{ fontSize: 10, fill: SLATE }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="appointments" name="Appointments" fill={ROSE} radius={[0, 6, 6, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function MiniSplit({ title, items }: { title: string; items: { label: string; value: number; color: string }[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-3">{title}</p>
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-100 mb-3">
        {items.map((item) => total > 0 ? <div key={item.label} style={{ width: `${(item.value / total) * 100}%`, background: item.color }} /> : null)}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
            <span className="text-gray-500 flex-1 capitalize">{item.label}</span>
            <span className="font-bold text-navy-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminOverview() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadDashboard = async (selectedYear = year) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardStats(selectedYear);
      setStats(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadDashboard(year); }, [year]);

  const insights = useMemo(() => {
    if (!stats) return [];
    const bestService = stats.serviceDistribution[0];
    const topCity = stats.patientsByCity[0];
    const bestDoctor = stats.doctorWiseAppointments[0];
    return [
      bestService ? `Most booked service: ${bestService.name} (${bestService.count} appointments).` : null,
      topCity ? `Largest patient location: ${topCity.city}${topCity.state ? `, ${topCity.state}` : ''} (${topCity.patients} patients).` : null,
      bestDoctor ? `Highest appointment volume: ${bestDoctor.doctor} (${bestDoctor.appointments}).` : null,
    ].filter(Boolean) as string[];
  }, [stats]);

  if (loading && !stats) {
    return <div className="max-w-7xl mx-auto py-20 text-center text-sm text-gray-400">Loading live clinic analytics…</div>;
  }
  if (error && !stats) {
    return <div className="max-w-7xl mx-auto py-20 text-center text-sm text-red-500">{error}</div>;
  }
  if (!stats) return null;

  const statCards = [
    { label: 'Total Patients', value: stats.totalPatients, hint: 'All registered', icon: <Users size={20} />, tone: 'rose' as const },
    { label: 'Appointments', value: stats.totalAppointments, hint: `${year}`, icon: <CalendarDays size={20} />, tone: 'navy' as const },
    { label: 'Completed', value: stats.completedAppointments ?? 0, hint: `${stats.completionRate ?? 0}% completion`, icon: <CheckCircle2 size={20} />, tone: 'green' as const },
    { label: 'Pending', value: stats.pendingAppointments, hint: 'Needs attention', icon: <Clock3 size={20} />, tone: 'amber' as const },
    { label: 'Collected Revenue', value: formatCurrency(stats.collectedRevenue ?? 0), hint: 'Paid appointments', icon: <IndianRupee size={20} />, tone: 'green' as const },
    { label: 'Average Rating', value: `${stats.averageRating ?? 0}/5`, hint: `${stats.totalReviews} reviews`, icon: <Star size={20} />, tone: 'blue' as const },
    { label: 'Active Doctors', value: '1' , hint: 'Currently active', icon: <Stethoscope size={20} />, tone: 'navy' as const },
    { label: 'Active Services', value: `${stats.activeServices}/${stats.totalServices}`, hint: 'Home catalog', icon: <HeartPulse size={20} />, tone: 'rose' as const },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-5 sm:space-y-6">
      <div className="bg-gradient-to-r from-navy-900 via-[#20294b] to-rose-800 rounded-2xl p-5 sm:p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute right-20 -bottom-24 w-40 h-40 rounded-full bg-rose-400/10" />
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-white/60 text-xs font-semibold uppercase tracking-[0.18em]">Clinic intelligence</p>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif mt-1">Hello admin</h2>
            <p className="text-sm text-white/70 mt-2 max-w-xl">A live operational view of patients, appointments, services, payments and clinic performance.</p>
          </div>
          <div className="flex items-center gap-2">
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2 text-sm outline-none [&>option]:text-gray-900">
              {[currentYear, currentYear + 1].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={() => loadDashboard()} disabled={loading} className="flex items-center gap-2 bg-white text-navy-900 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-gray-100 disabled:opacity-60">
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
        {lastUpdated && <p className="relative text-[10px] text-white/50 mt-4">Last synced {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Data fetched from MongoDB</p>}
      </div>

      {error && <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-xl px-4 py-3 text-xs">{error} — showing the last successfully loaded data.</div>}

      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
        {statCards.map((card) => <MetricCard key={card.label} {...card} />)}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <SectionCard title="Growth & demand" subtitle={`Monthly appointments vs new patient registrations · ${year}`} className="xl:col-span-2">
          <AppointmentsTrend stats={stats} />
        </SectionCard>
        <SectionCard title="Appointment status" subtitle={`Operational mix · ${year}`}>
          <StatusChart data={stats.appointmentStatusDistribution} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <SectionCard title="Collected revenue" subtitle={`Only paid appointments · ${year}`} className="xl:col-span-2">
          <RevenueChart stats={stats} />
        </SectionCard>
        <SectionCard title="Consultation mix" subtitle={`Clinic vs video consultations · ${year}`}>
          <div className="h-[250px] flex items-center justify-center">
            <div className="w-full max-w-[260px] space-y-7">
              <MiniSplit
                title="Appointment type"
                items={[
                  { label: 'Clinic', value: stats.clinicConsultations ?? 0, color: NAVY },
                  { label: 'Video', value: stats.videoConsultations ?? 0, color: ROSE },
                ]}
              />
              <MiniSplit
                title="Payment status"
                items={[
                  { label: 'Paid', value: stats.paymentStatusDistribution.find((x) => x.status === 'paid')?.count ?? 0, color: GREEN },
                  { label: 'Unpaid', value: stats.paymentStatusDistribution.find((x) => x.status === 'unpaid')?.count ?? 0, color: AMBER },
                  { label: 'Failed', value: stats.paymentStatusDistribution.find((x) => x.status === 'failed')?.count ?? 0, color: '#DC2626' },
                ]}
              />
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Most booked services" subtitle="Top services based on real appointment records">
          <HorizontalBars data={stats.serviceDistribution} />
        </SectionCard>
        <SectionCard title="Patient age profile" subtitle="Current registered patients with a date of birth">
          <AgeChart data={stats.patientsByAgeGroup} />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Doctor workload" subtitle={`Appointment volume by active doctor · ${year}`}>
          <DoctorChart data={stats.doctorWiseAppointments} />
        </SectionCard>
        <SectionCard title="Patient geography" subtitle="Top locations from address captured at signup">
          {stats.patientsByCity.length ? (
            <div className="space-y-4">
              {stats.patientsByCity.map((item, index) => {
                const max = stats.patientsByCity[0]?.patients || 1;
                return (
                  <div key={`${item.city}-${item.state ?? ''}`}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-gray-600">{index + 1}. {item.city}{item.state ? `, ${item.state}` : ''}</span>
                      <span className="text-xs font-bold text-navy-900">{item.patients}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-navy-900 rounded-full" style={{ width: `${(item.patients / max) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyChart message="No patient address data available yet." />}
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <SectionCard title="Performance snapshot" subtitle="Calculated from current database records">
          <div className="space-y-4">
            <div className="flex items-center gap-3"><CheckCircle2 size={18} className="text-green-600" /><span className="text-xs text-gray-500 flex-1">Completion rate</span><strong className="text-sm text-navy-900">{stats.completionRate ?? 0}%</strong></div>
            <div className="flex items-center gap-3"><ArrowDownRight size={18} className="text-rose-600" /><span className="text-xs text-gray-500 flex-1">Cancellation rate</span><strong className="text-sm text-navy-900">{stats.cancellationRate ?? 0}%</strong></div>
            <div className="flex items-center gap-3"><Video size={18} className="text-blue-600" /><span className="text-xs text-gray-500 flex-1">Video share</span><strong className="text-sm text-navy-900">{stats.videoShare ?? 0}%</strong></div>
            <div className="flex items-center gap-3"><FileText size={18} className="text-amber-600" /><span className="text-xs text-gray-500 flex-1">Medical records</span><strong className="text-sm text-navy-900">{stats.medicalRecordsCount ?? 0}</strong></div>
            <div className="flex items-center gap-3"><ShieldCheck size={18} className="text-green-600" /><span className="text-xs text-gray-500 flex-1">Prescriptions issued</span><strong className="text-sm text-navy-900">{stats.prescriptionCount ?? 0}</strong></div>
          </div>
        </SectionCard>

        <SectionCard title="Clinic insights" subtitle="Automatically generated from live analytics" className="lg:col-span-2">
          {insights.length ? (
            <div className="grid sm:grid-cols-3 gap-3">
              {insights.map((insight, index) => (
                <div key={insight} className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center mb-3">
                    {index === 0 ? <Activity size={16} /> : index === 1 ? <Users size={16} /> : <Stethoscope size={16} />}
                  </div>
                  <p className="text-xs leading-5 text-gray-600">{insight}</p>
                </div>
              ))}
            </div>
          ) : <EmptyChart message="Insights will appear once appointment and patient data is available." />}
        </SectionCard>
      </div>

      <SectionCard title="Recent appointments" subtitle="Latest records created in the database" action={<MonitorPlay size={16} className="text-gray-300" />}>
        {stats.recentActivity.length ? (
          <div className="divide-y divide-gray-100">
            {stats.recentActivity.map((item) => (
              <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${item.kind === 'appointment' ? 'bg-navy-900' : 'bg-rose-600'}`} />
                <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-navy-900 truncate">{item.text}</p><p className="text-[11px] text-gray-400 truncate">{item.sub}</p></div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{item.time}</span>
              </div>
            ))}
          </div>
        ) : <EmptyChart message="No recent appointments yet." />}
      </SectionCard>
    </div>
  );
}
