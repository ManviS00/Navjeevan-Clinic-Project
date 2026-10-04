import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import type { DailyLog } from '@/lib/types';
import { todayISO } from '@/lib/date';
import { Sparkles, Plus } from 'lucide-react';

import TodaySummary from './TodaySummary';
import Insights from './Insights';
import LogRow from './LogRow';
import LogModal from './LogModal';

export default function WellnessTracker() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLog, setShowLog] = useState(false);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getDailyLogs(30);
      setLogs(data as DailyLog[]);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const todayLog = logs.find((l) => l.log_date === todayISO());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-brand-500" /> Daily Wellness
          </h1>
          <p className="text-gray-500 mt-1">Log how you feel and spot patterns over time.</p>
        </div>
        <button
          onClick={() => setShowLog(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition shadow-md shadow-brand-200"
        >
          <Plus className="w-4 h-4" /> {todayLog ? 'Update Today' : 'Log Today'}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading…</div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Start your wellness journal</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Track your mood, symptoms, sleep, and energy daily to discover what makes you feel your best.
          </p>
          <button onClick={() => setShowLog(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition">
            <Plus className="w-4 h-4" /> Log your first day
          </button>
        </div>
      ) : (
        <>
          {todayLog && <TodaySummary log={todayLog} />}
          {logs.length >= 3 && <Insights logs={logs} />}

          <div className="bg-white rounded-2xl p-6 border border-brand-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Entries</h3>
            <div className="space-y-2">
              {logs.map((log) => (
                <LogRow key={log.id} log={log} onUpdate={fetchLogs} />
              ))}
            </div>
          </div>
        </>
      )}

      {showLog && (
        <LogModal
          existing={todayLog}
          onClose={() => setShowLog(false)}
          onSaved={() => { setShowLog(false); fetchLogs(); }}
        />
      )}
    </div>
  );
}
