import { useState } from 'react';
import { X } from 'lucide-react';
import { useStage } from '@/lib/stage';
import { addDays, formatDateLong } from '@/lib/date';
import type { PregnancyProfile } from '@/lib/types';

function addMonths(d: Date, months: number): Date {
  const r = new Date(d);
  r.setMonth(r.getMonth() + months);
  return r;
}

export default function SetupModal({ existing, onClose, onSaved }: { existing?: PregnancyProfile; onClose: () => void; onSaved: () => void }) {
  const { startPregnancy } = useStage();
  const [mode, setMode] = useState<'along' | 'due'>('due');
  const [alongUnit, setAlongUnit] = useState<'weeks' | 'months'>('weeks');
  const [alongValue, setAlongValue] = useState('');
  const [dueDate, setDueDate] = useState(existing?.due_date ?? '');
  const [nickname, setNickname] = useState(existing?.baby_nickname ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const maxDueDate = addMonths(new Date(), 9).toISOString().slice(0, 10);
  const todayISOStr = new Date().toISOString().slice(0, 10);

  // Convert "how far along" into an estimated due date: a full-term
  // pregnancy is ~40 weeks (280 days), so due date = today + (280 - days pregnant so far).
  const alongDaysPregnant = alongValue
    ? Math.round(parseFloat(alongValue) * (alongUnit === 'weeks' ? 7 : 30.44))
    : 0;
  const computedDueFromAlong = alongValue
    ? addDays(new Date(), 280 - alongDaysPregnant).toISOString().slice(0, 10)
    : '';

  async function save() {
    setError(null);

    if (mode === 'along') {
      const maxVal = alongUnit === 'weeks' ? 42 : 9;
      const val = parseFloat(alongValue);
      if (!alongValue || isNaN(val) || val < 0 || val > maxVal) {
        setError(`Please enter a value between 0 and ${maxVal} ${alongUnit}.`);
        return;
      }
    } else if (mode === 'due') {
      if (dueDate && (dueDate < todayISOStr || dueDate > maxDueDate)) {
        setError("Due date can't be more than 9 months from today.");
        return;
      }
    }

    setSaving(true);
    const due = mode === 'along' ? computedDueFromAlong : dueDate;
    if (!due) { setError('Please provide the requested information'); setSaving(false); return; }
    try {
      await startPregnancy(due, undefined, nickname || undefined);
      setSaving(false); onSaved();
    } catch (err) { setSaving(false); setError((err as Error).message); }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{existing ? 'Edit Pregnancy' : 'Set Up Pregnancy Tracker'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => setMode('due')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition ${mode === 'due' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              Due Date
            </button>
            <button
              onClick={() => setMode('along')}
              className={`flex-1 py-2.5 rounded-xl font-medium text-sm transition ${mode === 'along' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
            >
              How Far Along
            </button>
          </div>
          {mode === 'due' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due date</label>
              <input
                type="date"
                min={todayISOStr}
                max={maxDueDate}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              />
              <p className="text-xs text-gray-400 mt-1">Due date can't be more than 9 months from today.</p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">How many {alongUnit} pregnant are you?</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min={0}
                  max={alongUnit === 'weeks' ? 42 : 9}
                  value={alongValue}
                  onChange={(e) => setAlongValue(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                  placeholder="e.g. 12"
                />
                <div className="flex rounded-xl overflow-hidden border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setAlongUnit('weeks')}
                    className={`px-3 text-sm font-medium transition ${alongUnit === 'weeks' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    Weeks
                  </button>
                  <button
                    type="button"
                    onClick={() => setAlongUnit('months')}
                    className={`px-3 text-sm font-medium transition ${alongUnit === 'months' ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}
                  >
                    Months
                  </button>
                </div>
              </div>
              {computedDueFromAlong && (
                <p className="text-sm text-brand-600 mt-2">Estimated due date: <span className="font-semibold">{formatDateLong(computedDueFromAlong)}</span></p>
              )}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Baby nickname (optional)</label>
            <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none" placeholder="Bean, Peanut, etc." />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Start Tracking'}
          </button>
        </div>
      </div>
    </div>
  );
}
