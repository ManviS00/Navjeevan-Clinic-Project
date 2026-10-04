import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { todayISO } from '@/lib/date';
import type { FertilityLog, CervicalMucus, OPKResult } from '@/lib/types';
import { MUCUS_OPTIONS } from '@/lib/types';

export default function FertilityLogModal({
  existing, onClose, onSaved,
}: {
  existing?: FertilityLog; onClose: () => void; onSaved: () => void;
}) {
  const [date] = useState(existing?.log_date ?? todayISO());
  const [bbt, setBbt] = useState(existing?.bbt_temperature?.toString() ?? '');
  const [mucus, setMucus] = useState<CervicalMucus | ''>((existing?.cervical_mucus as CervicalMucus) ?? '');
  const [opk, setOpk] = useState<OPKResult | ''>((existing?.opk_result as OPKResult) ?? '');
  const [intercourse, setIntercourse] = useState(existing?.had_intercourse ?? false);
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const payload = {
      log_date: date,
      bbt_temperature: bbt ? parseFloat(bbt) : null,
      cervical_mucus: mucus || null,
      opk_result: opk || null,
      had_intercourse: intercourse,
      notes: notes || null,
    };
    try {
      if (existing) await api.updateFertilityLog(existing.id, payload);
      else await api.createFertilityLog(payload);
    } catch (err) {
      setSaving(false);
      setError((err as Error).message);
      return;
    }
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{existing ? 'Edit Fertility Log' : 'Log Fertility Signs'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input type="date" value={date} disabled readOnly className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none" />
            <p className="text-xs text-gray-400 mt-1">Fertility signs are always logged for today.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Basal Body Temperature (°F)</label>
            <input type="number" step="0.1" min={90} max={110} value={bbt} onChange={(e) => setBbt(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none" placeholder="e.g. 97.8" />
            <p className="text-xs text-gray-400 mt-1">Take your temp each morning before getting out of bed.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cervical Mucus</label>
            <div className="flex flex-wrap gap-2">
              {MUCUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setMucus(mucus === opt.value ? '' : opt.value)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition ${
                    mucus === opt.value
                      ? opt.fertility === 'high' ? 'bg-brand-500 text-white' : opt.fertility === 'medium' ? 'bg-amber-400 text-white' : 'bg-gray-400 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ovulation Test (OPK)</label>
            <div className="flex gap-2">
              {(['positive', 'negative'] as OPKResult[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setOpk(opk === r ? '' : r)}
                  className={`flex-1 py-2.5 rounded-xl font-medium capitalize transition ${
                    opk === r
                      ? r === 'positive' ? 'bg-brand-500 text-white' : 'bg-gray-400 text-white'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => setIntercourse(!intercourse)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                  intercourse ? 'bg-brand-500 text-white' : 'border-2 border-gray-200'
                }`}
              >
                {intercourse && <CheckCircle2 className="w-4 h-4" />}
              </button>
              <span className="text-sm font-medium text-gray-700">Had intercourse</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none resize-none" placeholder="Any other observations?" />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
