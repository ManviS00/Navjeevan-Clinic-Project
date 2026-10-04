import { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/lib/api';
import { useStage } from '@/lib/stage';
import { useAccess, pregnancyGateMessage } from '@/lib/access';
import type { PeriodCycle, FertilityLog } from '@/lib/types';
import TrackerDisabledBanner from '@/components/TrackerDisabledBanner';
import { todayISO, toISODate, sameDay, isBetween } from '@/lib/date';
import { Flower, Plus, Baby } from 'lucide-react';

import { computeFertility, type FertilityDayStatus } from './types';
import EmptyState from './EmptyState';
import PredictionCards, { OvulationHero } from './PredictionCards';
import FertilityTips from './FertilityTips';
import FertilityCalendar from './FertilityCalendar';
import FertilityHistory from './FertilityHistory';
import FertilityLogModal from './FertilityLogModal';
import PregnantConfirmModal from './PregnantConfirmModal';

export default function FertilityTracker() {
  const { isPregnant } = useStage();
  const { access, pregnancyGate, refresh: refreshAccess } = useAccess();
  const [cycles, setCycles] = useState<PeriodCycle[]>([]);
  const [logs, setLogs] = useState<FertilityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);
  const [showPregnantPrompt, setShowPregnantPrompt] = useState(false);
  const [calMonth, setCalMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });

  // Bug fix: `new Date()` produces a new object reference every render, which
  // made this useMemo below recompute (and re-run computeFertility) on every
  // single render instead of only when cycles actually changed. Memoizing
  // "today" so it's stable within a render cycle fixes that.
  const today = useMemo(() => new Date(), []);
  const prediction = useMemo(() => computeFertility(cycles, today), [cycles, today]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [c, f] = await Promise.all([
        api.getPeriodCycles(),
        api.getFertilityLogs(60),
      ]);
      setCycles(c as PeriodCycle[]);
      setLogs(f as FertilityLog[]);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!access.fertility) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flower className="w-6 h-6 text-brand-500" /> Get Pregnant
          </h1>
        </div>
        <TrackerDisabledBanner message="This feature isn't available for your age group. You can still use Wellness and Appointments." />
      </div>
    );
  }

  if (isPregnant) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flower className="w-6 h-6 text-brand-500" /> Get Pregnant
          </h1>
        </div>
        <TrackerDisabledBanner message="Fertility tracking is paused while you're pregnant. Your pregnancy tracker is now active — head there to follow your baby's journey." />
      </div>
    );
  }

  const todayLog = logs.find((l) => l.log_date === todayISO());

  function getDayStatus(d: Date): FertilityDayStatus {
    let status: FertilityDayStatus = null;
    if (prediction) {
      if (sameDay(d, prediction.ovulationDate)) status = 'ovulation';
      else if (isBetween(d, prediction.fertileStart, prediction.fertileEnd)) status = 'fertile';
    }
    const log = logs.find((l) => l.log_date === toISODate(d));
    if (log) {
      if (log.opk_result === 'positive') status = 'peak';
      if (log.had_intercourse) status = status === 'peak' ? 'peak' : (status ?? 'intercourse');
    }
    return status;
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  if (!prediction) return <EmptyState />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flower className="w-6 h-6 text-brand-500" /> Get Pregnant
          </h1>
          <p className="text-gray-500 mt-1">Track your fertile window and maximize your chances.</p>
        </div>
        <button
          onClick={() => setShowLog(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition shadow-md shadow-brand-200"
        >
          <Plus className="w-4 h-4" /> {todayLog ? 'Update Today' : 'Log Fertility Signs'}
        </button>
        <button
          onClick={() => setShowPregnantPrompt(true)}
          disabled={!pregnancyGate.canConfirmPregnant}
          title={pregnancyGate.canConfirmPregnant ? undefined : pregnancyGateMessage(pregnancyGate.reason, pregnancyGate.until)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-100 hover:bg-brand-200 text-brand-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-brand-100"
        >
          <Baby className="w-4 h-4" /> I'm Pregnant!
        </button>
      </div>

      {!pregnancyGate.canConfirmPregnant && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3">
          {pregnancyGateMessage(pregnancyGate.reason, pregnancyGate.until)}
        </div>
      )}

      <OvulationHero prediction={prediction} />
      <PredictionCards prediction={prediction} />
      <FertilityTips />
      <FertilityCalendar
        month={calMonth}
        today={today}
        onPrev={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
        onNext={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
        getDayStatus={getDayStatus}
      />
      <FertilityHistory logs={logs} onUpdate={fetchData} />

      {showLog && (
        <FertilityLogModal
          existing={todayLog}
          onClose={() => setShowLog(false)}
          onSaved={() => { setShowLog(false); fetchData(); }}
        />
      )}
      {showPregnantPrompt && (
        <PregnantConfirmModal
          onClose={() => setShowPregnantPrompt(false)}
          onConfirmed={async () => {
            await refreshAccess();
            setShowPregnantPrompt(false);
          }}
        />
      )}
    </div>
  );
}
