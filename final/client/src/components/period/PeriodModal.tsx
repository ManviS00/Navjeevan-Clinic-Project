import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { api } from '@/lib/api';
import { todayISO, parseISODate, addDays, toISODate, daysBetween } from '@/lib/date';
import type { PeriodCycle, FlowIntensity } from '@/lib/types';

export default function PeriodModal({
  editingCycle, defaultLength, existingCycles = [], onClose, onSaved,
}: {
  editingCycle?: PeriodCycle;
  defaultLength: number;
  existingCycles?: PeriodCycle[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!editingCycle;
  const minDate = useMemo(() => toISODate(addDays(new Date(), -365)), []);
  const [startDate, setStartDate] = useState(editingCycle?.start_date ?? todayISO());
  const [periodLength, setPeriodLength] = useState(editingCycle?.period_length ?? defaultLength);
  const [flow, setFlow] = useState<FlowIntensity | ''>(editingCycle?.flow_intensity ?? '');
  const [notes, setNotes] = useState(editingCycle?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // End date is derived automatically from the start date + period length —
  // it is never entered manually.
  const endDate = useMemo(
    () => toISODate(addDays(parseISODate(startDate), Math.max(1, periodLength) - 1)),
    [startDate, periodLength]
  );

  async function save() {
    setError(null);

    // Period length must be between 1 and 15 days.
    if (!periodLength || periodLength < 1 || periodLength > 15) {
      setError('Period length must be between 1 and 15 days.');
      return;
    }

    // A period can only be logged from today back to exactly one year ago.
    if (startDate < minDate || startDate > todayISO()) {
      setError('You can only log a period within the past year.');
      return;
    }

    // Minimum gap of 21 days between the start of one period and the start
    // of the next.
    const others = existingCycles.filter((c) => c.id !== editingCycle?.id);
    const tooClose = others.some((c) => {
      const gap = Math.abs(daysBetween(parseISODate(c.start_date), parseISODate(startDate)));
      return gap < 21;
    });
    if (tooClose) {
      setError('Periods must be at least 21 days apart, start date to start date.');
      return;
    }

    setSaving(true);
    const payload = {
      start_date: startDate,
      end_date: endDate,
      period_length: periodLength,
      flow_intensity: flow || null,
      notes: notes || null,
    };
    try {
      if (isEdit) await api.updatePeriodCycle(editingCycle!.id, payload);
      else await api.createPeriodCycle(payload);
    } catch (err) {
      setSaving(false);
      setError((err as Error).message);
      return;
    }
    setSaving(false);
    onSaved();
  }

  async function remove() {
    if (!editingCycle) return;
    setSaving(true);
    try {
      await api.deletePeriodCycle(editingCycle.id);
      onSaved();
    } catch (err) {
      setSaving(false);
      setError((err as Error).message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{isEdit ? 'Edit Period' : 'Log Period'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Start date</label>
            <input
              type="date"
              min={minDate}
              max={todayISO()}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            />
            <p className="text-xs text-gray-400 mt-1">You can log a period from today up to 1 year ago.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Period length (days)</label>
            <input
              type="number"
              min={1}
              max={15}
              value={periodLength}
              onChange={(e) => {
                const raw = e.target.value;
                setPeriodLength(raw === '' ? ('' as unknown as number) : parseInt(raw, 10));
              }}
              className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 outline-none ${
                periodLength && (periodLength < 1 || periodLength > 15)
                  ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                  : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100'
              }`}
            />
            <p className={`text-xs mt-1 ${periodLength && (periodLength < 1 || periodLength > 15) ? 'text-red-500' : 'text-gray-400'}`}>
              How many days you bleed. Must be between 1–15 days.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">End date (calculated automatically)</label>
            <input
              type="date"
              value={endDate}
              disabled
              readOnly
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Flow intensity</label>
            <div className="flex gap-2">
              {(['light', 'medium', 'heavy'] as FlowIntensity[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFlow(flow === f ? '' : f)}
                  className={`flex-1 py-2.5 rounded-xl font-medium capitalize transition ${
                    flow === f ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none resize-none" placeholder="How was this period?" />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          <div className="flex gap-2">
            {isEdit && (
              <button onClick={remove} disabled={saving} className="px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition disabled:opacity-50">
                Delete
              </button>
            )}
            <button onClick={save} disabled={saving} className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
