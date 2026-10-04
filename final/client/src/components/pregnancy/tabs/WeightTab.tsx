import { useEffect, useState, useCallback } from 'react';
import { Plus, TrendingUp, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateLong } from '@/lib/date';
import type { WeightEntry } from '@/lib/types';
import WeightModal from './WeightModal';

export default function WeightTab() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try { setEntries((await api.getWeightEntries()) as WeightEntry[]); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const sorted = [...entries].sort((a, b) => a.log_date.localeCompare(b.log_date));
  const latest = sorted[sorted.length - 1];
  const first = sorted[0];
  const gain = latest && first ? (latest.weight_kg - first.weight_kg).toFixed(1) : '0';

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Weight Tracking</h2>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition shadow-md shadow-brand-200">
          <Plus className="w-4 h-4" /> Log Weight
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="bg-white rounded-2xl border border-brand-100 p-8 text-center">
          <TrendingUp className="w-10 h-10 text-brand-200 mx-auto mb-3" />
          <p className="text-gray-500">No weight entries yet. Start logging to track your pregnancy weight gain.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-brand-100">
              <p className="text-sm text-gray-500">Current</p>
              <p className="text-2xl font-bold text-gray-900">{latest?.weight_kg ?? '—'} kg</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-brand-100">
              <p className="text-sm text-gray-500">Starting</p>
              <p className="text-2xl font-bold text-gray-900">{first?.weight_kg ?? '—'} kg</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-brand-100">
              <p className="text-sm text-gray-500">Total gain</p>
              <p className={`text-2xl font-bold ${parseFloat(gain) >= 0 ? 'text-green-600' : 'text-amber-600'}`}>{parseFloat(gain) >= 0 ? '+' : ''}{gain} kg</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-brand-100">
            <h3 className="font-semibold text-gray-900 mb-4">Weight History</h3>
            <div className="space-y-2">
              {[...entries].sort((a, b) => b.log_date.localeCompare(a.log_date)).map((e) => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 transition group">
                  <div>
                    <p className="font-medium text-gray-900">{formatDateLong(e.log_date)}</p>
                    {e.notes && <p className="text-sm text-gray-400">{e.notes}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{e.weight_kg} kg</span>
                    <button
                      onClick={async () => { await api.deleteWeightEntry(e.id); fetchEntries(); }}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 transition"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showAdd && <WeightModal onClose={() => setShowAdd(false)} onSaved={() => { setShowAdd(false); fetchEntries(); }} />}
    </div>
  );
}
