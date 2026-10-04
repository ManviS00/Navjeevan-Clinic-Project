import { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import { useStage } from '@/lib/stage';
import { useAccess } from '@/lib/access';
import type { PeriodCycle } from '@/lib/types';
import TrackerDisabledBanner from '@/components/TrackerDisabledBanner';
import { parseISODate, addDays, sameDay, isBetween } from '@/lib/date';
import { Activity, Plus } from 'lucide-react';

import { computePrediction, DEFAULT_PERIOD_LENGTH, type CalendarDayStatus } from './types';
import EmptyState from './EmptyState';
import PredictionCards from './PredictionCards';
import PhaseBanner from './PhaseBanner';
import PeriodCalendar from './PeriodCalendar';
import PeriodHistory from './PeriodHistory';
import PeriodModal from './PeriodModal';

export default function PeriodTracker() {
  const { isPregnant } = useStage();
  const { access, refresh: refreshAccess } = useAccess();
  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<PeriodCycle | null>(null);
  const [avgPeriodLength, setAvgPeriodLength] = useState(DEFAULT_PERIOD_LENGTH);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  // `today` is memoized once per mount so it stays a stable reference —
  // otherwise `new Date()` on every render would make the prediction
  // useMemo below recompute on every render instead of only when the
  // logged cycles or avg length actually change.
  const today = useMemo(() => new Date(), []);
  const prediction = useMemo(() => computePrediction(cycles, today, avgPeriodLength), [cycles, today, avgPeriodLength]);

  const fetchCycles = useCallback(async () => {
    setLoading(true);
    try {
      const [data, state] = await Promise.all([api.getPeriodCycles(), api.getUserState()]);
      setCycles(data as PeriodCycle[]);
      if (state?.avg_period_length) setAvgPeriodLength(state.avg_period_length);
    } catch { /* ignore */ }
    setLoading(false);
    // Logging/editing/deleting a period can change whether "I'm Pregnant" is
    // currently allowed (you can't confirm a pregnancy during an active
    // period), so keep the shared access/pregnancy-gate info in sync too.
    refreshAccess();
  }, [refreshAccess]);

  useEffect(() => { fetchCycles(); }, [fetchCycles]);

  if (!access.period) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-500" /> Period Tracker
          </h1>
        </div>
        <TrackerDisabledBanner message="Period tracking isn't available for your age group. You can still use Wellness and Appointments." />
      </div>
    );
  }

  if (isPregnant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-500" /> Period Tracker
          </h1>
        </div>
        <TrackerDisabledBanner message="Period tracking is paused while you're pregnant. Once your pregnancy ends, your cycle tracking will resume automatically." />
      </div>
    );
  }

  function getDayStatus(d: Date): CalendarDayStatus {
    // Logged period days
    for (const c of cycles) {
      const s = parseISODate(c.start_date);
      const e = c.end_date ? parseISODate(c.end_date) : addDays(s, (c.period_length || DEFAULT_PERIOD_LENGTH) - 1);
      if (isBetween(d, s, e)) return 'period';
    }
    // Predicted days
    if (prediction) {
      if (isBetween(d, prediction.fertileStart, prediction.fertileEnd)) {
        if (sameDay(d, prediction.ovulationDate)) return 'ovulation';
        return 'fertile';
      }
      if (isBetween(d, prediction.nextPeriodStart, prediction.nextPeriodEnd)) return 'predicted';
    }
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-brand-500" /> Period Tracker
          </h1>
          <p className="text-gray-500 mt-1">Track your cycle and understand your body's rhythm.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition shadow-md shadow-brand-200"
        >
          <Plus className="w-4 h-4" /> Log Period
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : !prediction ? (
        <EmptyState onAdd={() => setShowAdd(true)} />
      ) : (
        <>
          <PredictionCards prediction={prediction} />
          <PhaseBanner prediction={prediction} />
          <PeriodCalendar
            month={calMonth}
            today={today}
            onPrev={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
            onNext={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
            getDayStatus={getDayStatus}
          />
          <PeriodHistory cycles={cycles} onUpdate={fetchCycles} onEdit={(c) => setEditing(c)} />
        </>
      )}

      {showAdd && (
        <PeriodModal
          defaultLength={avgPeriodLength}
          existingCycles={cycles}
          onClose={() => setShowAdd(false)}
          onSaved={() => { setShowAdd(false); fetchCycles(); }}
        />
      )}
      {editing && (
        <PeriodModal
          editingCycle={editing}
          defaultLength={avgPeriodLength}
          existingCycles={cycles}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); fetchCycles(); }}
        />
      )}
    </div>
  );
}
