import { useState } from 'react';
import { Baby, Heart, AlertCircle, X } from 'lucide-react';
import { todayISO } from '@/lib/date';
import type { PregnancyOutcome } from '@/lib/types';

export default function OutcomeModal({ onClose, onConfirm, existingOutcome }: { onClose: () => void; onConfirm: (outcome: PregnancyOutcome, date: string) => void; existingOutcome?: PregnancyOutcome | null }) {
  const [outcome, setOutcome] = useState<PregnancyOutcome | ''>(existingOutcome ?? '');
  const [date, setDate] = useState(todayISO());
  const [saving, setSaving] = useState(false);

  const OUTCOMES: { value: PregnancyOutcome; label: string; desc: string; icon: typeof Baby }[] = [
    { value: 'live_birth', label: 'Live Birth', desc: 'Your baby was born', icon: Baby },
    { value: 'premature', label: 'Premature Birth', desc: 'Your baby was born before 37 weeks', icon: Baby },
    { value: 'miscarriage', label: 'Miscarriage', desc: 'Pregnancy loss before 20 weeks', icon: Heart },
    { value: 'stillbirth', label: 'Stillbirth', desc: 'Pregnancy loss after 20 weeks', icon: Heart },
    { value: 'termination', label: 'Termination', desc: 'Pregnancy was terminated', icon: AlertCircle },
  ];

  async function confirm() {
    if (!outcome) return;
    setSaving(true);
    await onConfirm(outcome, date);
    setSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Record Pregnancy Outcome</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            {OUTCOMES.map((o) => (
              <button
                key={o.value}
                onClick={() => setOutcome(o.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                  outcome === o.value ? 'bg-brand-50 border-2 border-brand-300' : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  outcome === o.value ? 'bg-brand-500 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  <o.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{o.label}</p>
                  <p className="text-sm text-gray-400">{o.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none" />
          </div>
          {outcome === 'miscarriage' && (
            <div className="p-3 rounded-xl bg-amber-50 text-sm text-amber-700">
              <p className="font-medium mb-1">We're sorry for your loss.</p>
              <p>After recording, you'll be able to resume period tracking. Your cycles will restart once you log your next period. Be gentle with yourself and reach out to your healthcare provider for support.</p>
            </div>
          )}
          {outcome === 'stillbirth' && (
            <div className="p-3 rounded-xl bg-amber-50 text-sm text-amber-700">
              <p className="font-medium mb-1">We're so sorry for your loss.</p>
              <p>After recording, you'll be able to resume period tracking. Please reach out to your healthcare provider and loved ones for support during this time.</p>
            </div>
          )}
          {outcome === 'termination' && (
            <div className="p-3 rounded-xl bg-gray-50 text-sm text-gray-600">
              <p className="font-medium mb-1">Your decision has been recorded.</p>
              <p>After recording, you'll be able to resume period tracking. Take the time you need to recover, and reach out to your healthcare provider with any questions.</p>
            </div>
          )}
          {outcome === 'live_birth' && (
            <div className="p-3 rounded-xl bg-green-50 text-sm text-green-700">
              <p className="font-medium mb-1">Congratulations on your baby!</p>
              <p>After recording, you can return to period tracking to monitor postpartum cycle recovery.</p>
            </div>
          )}
          {outcome === 'premature' && (
            <div className="p-3 rounded-xl bg-blue-50 text-sm text-blue-700">
              <p className="font-medium mb-1">Congratulations on your baby's early arrival!</p>
              <p>Premature babies often need extra care — stay close with your healthcare provider. After recording, you can return to period tracking to monitor postpartum cycle recovery.</p>
            </div>
          )}
          <button onClick={confirm} disabled={saving || !outcome} className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Confirm Outcome'}
          </button>
        </div>
      </div>
    </div>
  );
}
