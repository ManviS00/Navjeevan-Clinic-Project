import { useEffect, useState, useMemo } from 'react';
import { api } from '@/lib/api';
import { useStage } from '@/lib/stage';
import { useAccess } from '@/lib/access';
import type { PeriodCycle, DailyLog, Appointment } from '@/lib/types';
import { MOOD_OPTIONS } from '@/lib/types';
import { todayISO, parseISODate, addDays, daysBetween, formatDateShort } from '@/lib/date';
import { getPregnancyInfo } from '@/components/pregnancy/utils';
import { Activity, Baby, Sparkles, ArrowRight, Moon, Battery, Flower, Lock, BarChart3, CalendarCheck, CalendarClock, Stethoscope } from 'lucide-react';
import type { TabId } from '@/components/DashboardLayout';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const DEFAULT_CYCLE_LENGTH = 28;
const DEFAULT_PERIOD_LENGTH = 5;

export default function Overview({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const { isPregnant, pregnancy } = useStage();
  const { access } = useAccess();
  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [c, l, a] = await Promise.all([
          api.getPeriodCycles(),
          api.getDailyLogs(30),
          api.getAppointments(),
        ]);
        setCycles(c as PeriodCycle[]);
        setLogs(l as DailyLog[]);
        setAppointments(a as Appointment[]);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const today = useMemo(() => new Date(), []);
  const todayLog = logs.find((l) => l.log_date === todayISO());

  const periodPrediction = useMemo(() => {
    const sorted = [...cycles].sort((a, b) => a.start_date.localeCompare(b.start_date));
    if (sorted.length === 0) return null;
    let avgCycle = DEFAULT_CYCLE_LENGTH;
    if (sorted.length >= 2) {
      const gaps: number[] = [];
      for (let i = 1; i < sorted.length; i++) gaps.push(daysBetween(parseISODate(sorted[i - 1].start_date), parseISODate(sorted[i].start_date)));
      avgCycle = Math.round(gaps.reduce((s, v) => s + v, 0) / gaps.length);
    }
    let avgPeriod = DEFAULT_PERIOD_LENGTH;
    const ended = sorted.filter((c) => c.end_date);
    if (ended.length > 0) avgPeriod = Math.round(ended.reduce((s, c) => s + daysBetween(parseISODate(c.start_date), parseISODate(c.end_date!)) + 1, 0) / ended.length);
    const lastStart = parseISODate(sorted[sorted.length - 1].start_date);
    let nextStart = lastStart;
    while (nextStart <= today) nextStart = addDays(nextStart, avgCycle);
    const ovulation = addDays(nextStart, -14);
    const dayOfCycle = daysBetween(lastStart, today) + 1;
    const daysUntilOvulation = daysBetween(today, ovulation);
    return { nextStart, ovulation, dayOfCycle, avgCycle, avgPeriod, daysUntil: daysBetween(today, nextStart), daysUntilOvulation };
  }, [cycles, today]);

  const pregInfo = pregnancy && !pregnancy.outcome ? getPregnancyInfo(pregnancy.due_date, today) : null;

  // KPI cards
  const totalAppointments = appointments.length;
  const upcomingAppointmentsCount = appointments.filter((a) => !a.completed && a.date >= todayISO()).length;
  const completedAppointments = appointments.filter((a) => a.completed).length;

  // Mood distribution across recent logs
  const moodDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => { if (l.mood) counts[l.mood] = (counts[l.mood] || 0) + 1; });
    return MOOD_OPTIONS
      .map((m) => ({ name: m.label, emoji: m.emoji, value: counts[m.value] || 0 }))
      .filter((m) => m.value > 0);
  }, [logs]);

  // Energy trend over recent logs (oldest to newest)
  const energyTrend = useMemo(() => {
    return [...logs]
      .filter((l) => l.energy_level != null)
      .sort((a, b) => a.log_date.localeCompare(b.log_date))
      .map((l) => ({ date: formatDateShort(l.log_date), energy: l.energy_level }));
  }, [logs]);

  // Average sleep hours across recent logs
  const avgSleepHours = useMemo(() => {
    const withSleep = logs.filter((l) => l.sleep_hours != null);
    if (withSleep.length === 0) return null;
    return withSleep.reduce((s, l) => s + (l.sleep_hours || 0), 0) / withSleep.length;
  }, [logs]);

  const MOOD_COLORS = ['#8b1e3a', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7', '#ef4444'];

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </h1>
        <p className="text-brand-600 text-sm mt-1">Wishing you a gentle, healthy day 🌸</p>
      </div>

      {/* Today's snapshot */}
      {todayLog && (
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl p-6 text-white">
          <p className="text-brand-100 text-sm font-medium uppercase tracking-wide mb-3">Today's Snapshot</p>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl mb-1">{MOOD_OPTIONS.find((m) => m.value === todayLog.mood)?.emoji ?? '🙂'}</div>
              <p className="text-xs text-brand-100 capitalize">{todayLog.mood ?? '—'}</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Battery className="w-6 h-6 mb-1" />
              <p className="font-semibold">{todayLog.energy_level ?? '—'}/5</p>
              <p className="text-xs text-brand-100">Energy</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Moon className="w-6 h-6 mb-1" />
              <p className="font-semibold">{todayLog.sleep_hours ? `${todayLog.sleep_hours}h` : '—'}</p>
              <p className="text-xs text-brand-100">Sleep</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Sparkles className="w-6 h-6 mb-1" />
              <p className="font-semibold">{todayLog.symptoms?.length ?? 0}</p>
              <p className="text-xs text-brand-100">Symptoms</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Period card */}
        <button
          onClick={() => !isPregnant && access.period && onNavigate('period')}
          disabled={isPregnant || !access.period}
          className={`bg-white rounded-2xl p-6 border text-left transition group ${
            isPregnant || !access.period ? 'border-gray-100 opacity-50 cursor-not-allowed' : 'border-brand-100 hover:shadow-lg hover:shadow-brand-100/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-brand-600" />
            </div>
            {isPregnant || !access.period ? <Lock className="w-4 h-4 text-gray-300" /> : <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition" />}
          </div>
          <h3 className="font-semibold text-gray-900">Period Tracker</h3>
          {isPregnant ? (
            <p className="text-sm text-gray-400 mt-2">Paused during pregnancy</p>
          ) : !access.period ? (
            <p className="text-sm text-gray-400 mt-2">Not available for your age group</p>
          ) : periodPrediction ? (
            <div className="mt-2">
              <p className="text-2xl font-bold text-brand-600">
                {periodPrediction.daysUntil <= 0 ? 'Today' : `${periodPrediction.daysUntil} days`}
              </p>
              <p className="text-sm text-gray-500">until next period · Day {periodPrediction.dayOfCycle}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Start tracking your cycle</p>
          )}
        </button>

        {/* Fertility card */}
        <button
          onClick={() => !isPregnant && access.fertility && onNavigate('fertility')}
          disabled={isPregnant || !access.fertility}
          className={`bg-white rounded-2xl p-6 border text-left transition group ${
            isPregnant || !access.fertility ? 'border-gray-100 opacity-50 cursor-not-allowed' : 'border-brand-100 hover:shadow-lg hover:shadow-brand-100/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <Flower className="w-5 h-5 text-brand-600" />
            </div>
            {isPregnant || !access.fertility ? <Lock className="w-4 h-4 text-gray-300" /> : <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition" />}
          </div>
          <h3 className="font-semibold text-gray-900">Get Pregnant</h3>
          {isPregnant ? (
            <p className="text-sm text-gray-400 mt-2">Paused during pregnancy</p>
          ) : !access.fertility ? (
            <p className="text-sm text-gray-400 mt-2">Not available for your age group</p>
          ) : periodPrediction ? (
            <div className="mt-2">
              <p className="text-2xl font-bold text-brand-600">
                {periodPrediction.daysUntilOvulation <= 0 ? 'Ovulating' : `${periodPrediction.daysUntilOvulation}d to ovulation`}
              </p>
              <p className="text-sm text-gray-500">Fertile window tracking</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Track your fertile window</p>
          )}
        </button>

        {/* Pregnancy card */}
        <button
          onClick={() => (access.pregnancy || isPregnant) && onNavigate('pregnancy')}
          disabled={!access.pregnancy && !isPregnant}
          className={`bg-white rounded-2xl p-6 border text-left transition group ${
            !access.pregnancy && !isPregnant ? 'border-gray-100 opacity-50 cursor-not-allowed' : 'border-brand-100 hover:shadow-lg hover:shadow-brand-100/50'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center">
              <Baby className="w-5 h-5 text-brand-600" />
            </div>
            {!access.pregnancy && !isPregnant ? <Lock className="w-4 h-4 text-gray-300" /> : <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition" />}
          </div>
          <h3 className="font-semibold text-gray-900">Pregnancy Tracker</h3>
          {!access.pregnancy && !isPregnant ? (
            <p className="text-sm text-gray-400 mt-2">Not available for your age group</p>
          ) : pregInfo ? (
            <div className="mt-2">
              <p className="text-2xl font-bold text-brand-600">Week {pregInfo.clampedWeek}</p>
              <p className="text-sm text-gray-500">{pregInfo.daysUntilDue} days until due · {pregInfo.weekInfo.size}</p>
            </div>
          ) : pregnancy?.outcome ? (
            <p className="text-sm text-gray-500 mt-2">Pregnancy completed</p>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Set up your pregnancy tracker</p>
          )}
        </button>

        {/* Wellness card */}
        <button
          onClick={() => onNavigate('wellness')}
          className="bg-white rounded-2xl p-6 border border-brand-100 text-left hover:shadow-lg hover:shadow-brand-100/50 transition group"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-600" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-brand-400 transition" />
          </div>
          <h3 className="font-semibold text-gray-900">Daily Wellness</h3>
          {todayLog ? (
            <div className="mt-2">
              <p className="text-2xl font-bold text-amber-600">{MOOD_OPTIONS.find((m) => m.value === todayLog.mood)?.emoji ?? '🙂'}</p>
              <p className="text-sm text-gray-500 capitalize">{todayLog.mood ?? 'Logged'} today</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mt-2">Log how you feel today</p>
          )}
        </button>
      </div>

      {/* Activity dashboard */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-semibold text-gray-900">Your Activity</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-brand-100">
            <h4 className="font-semibold text-gray-900 mb-4">Mood Distribution</h4>
            {moodDistribution.length > 0 ? (
              <div className="flex items-center gap-4">
                <div className="w-32 h-32 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={moodDistribution} dataKey="value" nameKey="name" innerRadius={35} outerRadius={60} paddingAngle={2}>
                        {moodDistribution.map((_, i) => (
                          <Cell key={i} fill={MOOD_COLORS[i % MOOD_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1">
                  {moodDistribution.map((m, i) => (
                    <div key={m.name} className="flex items-center gap-2 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: MOOD_COLORS[i % MOOD_COLORS.length] }} />
                      <span className="text-gray-600">{m.emoji} {m.name}</span>
                      <span className="text-gray-400 ml-auto">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-8 text-center">Log your mood to see trends here.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-100">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" /> Energy Trend
            </h4>
            {energyTrend.length > 1 ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f5d7dd" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                    <YAxis domain={[0, 5]} allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="energy" stroke="#8b1e3a" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-8 text-center">Keep logging to see your energy trend.</p>
            )}
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-100">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-500" /> Average Sleep
            </h4>
            {avgSleepHours != null ? (
              <div className="flex flex-col items-center justify-center py-6">
                <p className="text-4xl font-bold text-gray-900">{avgSleepHours.toFixed(1)}h</p>
                <p className="text-sm text-gray-500 mt-2">average per night</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-8 text-center">Log your sleep to see your average here.</p>
            )}
          </div>
        </div>
      </div>

      {/* Appointment summary */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100">
        <div className="flex items-center gap-2 mb-4">
          <Stethoscope className="w-5 h-5 text-brand-600" />
          <h3 className="text-lg font-semibold text-gray-900">Appointments</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-brand-50/50">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <Stethoscope className="w-5 h-5 text-brand-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900">{totalAppointments}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <CalendarClock className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Upcoming</p>
              <p className="text-xl font-bold text-gray-900">{upcomingAppointmentsCount}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50/50">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
              <CalendarCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Completed</p>
              <p className="text-xl font-bold text-gray-900">{completedAppointments}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
