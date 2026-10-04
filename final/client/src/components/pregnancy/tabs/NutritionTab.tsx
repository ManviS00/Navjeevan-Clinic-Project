import { useEffect, useState, useCallback } from 'react';
import { Droplet, Pill, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { todayISO, formatDateShort } from '@/lib/date';
import type { NutritionLog } from '@/lib/types';

export default function NutritionTab() {
  const [logs, setLogs] = useState<NutritionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try { setLogs((await api.getNutritionLogs()) as NutritionLog[]); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const todayLog = logs.find((l) => l.log_date === todayISO());

  async function toggle(field: 'prenatal_vitamin' | 'folic_acid' | 'iron_supplement') {
    const current = todayLog || { log_date: todayISO(), water_glasses: 0, prenatal_vitamin: false, folic_acid: false, iron_supplement: false, meals: [] };
    await api.upsertNutritionLog({ ...current, [field]: !current[field] });
    fetchLogs();
  }

  async function setWater(glasses: number) {
    const current = todayLog || { log_date: todayISO(), water_glasses: 0, prenatal_vitamin: false, folic_acid: false, iron_supplement: false, meals: [] };
    await api.upsertNutritionLog({ ...current, water_glasses: glasses });
    fetchLogs();
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Loading…</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Nutrition & Hydration</h2>

      {/* Water tracker */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100">
        <div className="flex items-center gap-2 mb-4">
          <Droplet className="w-5 h-5 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Hydration</h3>
        </div>
        <p className="text-sm text-gray-500 mb-3">Aim for 8–10 glasses of water daily during pregnancy.</p>
        <div className="flex items-center gap-2 flex-wrap">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setWater(n)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition ${
                (todayLog?.water_glasses ?? 0) >= n
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
              }`}
            >
              {n}
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-gray-600">
            {(todayLog?.water_glasses ?? 0)} / 10 glasses
          </span>
        </div>
      </div>

      {/* Supplements */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100">
        <div className="flex items-center gap-2 mb-4">
          <Pill className="w-5 h-5 text-brand-500" />
          <h3 className="font-semibold text-gray-900">Today's Supplements</h3>
        </div>
        <div className="space-y-2">
          {([
            { key: 'prenatal_vitamin' as const, label: 'Prenatal Vitamin' },
            { key: 'folic_acid' as const, label: 'Folic Acid' },
            { key: 'iron_supplement' as const, label: 'Iron Supplement' },
          ]).map((s) => (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 transition"
            >
              <span className="font-medium text-gray-700">{s.label}</span>
              <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                todayLog?.[s.key] ? 'bg-green-500 text-white' : 'border-2 border-gray-200'
              }`}>
                {todayLog?.[s.key] && <CheckCircle2 className="w-4 h-4" />}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* History */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-brand-100">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Logs</h3>
          <div className="space-y-2">
            {logs.slice(0, 14).map((l) => (
              <div key={l.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 transition">
                <div>
                  <p className="font-medium text-gray-900">{formatDateShort(l.log_date)}</p>
                  <p className="text-sm text-gray-400">
                    {l.water_glasses} glasses
                    {l.prenatal_vitamin && ' · Prenatal'}
                    {l.folic_acid && ' · Folic acid'}
                    {l.iron_supplement && ' · Iron'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
