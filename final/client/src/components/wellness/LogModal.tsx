import { useState, useMemo } from 'react';
import { api } from '@/lib/api';
import type { DailyLog, Mood } from '@/lib/types';
import { MOOD_OPTIONS, SYMPTOM_OPTIONS, MOOD_SUGGESTIONS } from '@/lib/types';
import { todayISO, formatDateLong } from '@/lib/date';
import { X } from 'lucide-react';

export default function LogModal({ existing, onClose, onSaved }: { existing?: DailyLog; onClose: () => void; onSaved: () => void }) {
  const date = existing?.log_date ?? todayISO();
  const [mood, setMood] = useState<Mood | ''>((existing?.mood as Mood) ?? '');
  const [symptoms, setSymptoms] = useState<string[]>(existing?.symptoms ?? []);
  const [energy, setEnergy] = useState(existing?.energy_level ?? 3);
  const [sleep, setSleep] = useState(existing?.sleep_hours?.toString() ?? '');
  const [notes, setNotes] = useState(existing?.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherText, setOtherText] = useState('');

  // Pick a mood-lift suggestion whenever the selected mood changes.
  const moodSuggestion = useMemo(() => {
    if (!mood) return null;
    const options = MOOD_SUGGESTIONS[mood];
    if (!options || options.length === 0) return null;
    return options[Math.floor(Math.random() * options.length)];
  }, [mood]);

  function toggleSymptom(s: string) {
    setSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  }

  function addOtherSymptom() {
    const trimmed = otherText.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms((prev) => [...prev, trimmed]);
    }
    setOtherText('');
    setShowOtherInput(false);
  }

  async function save() {
    setError(null);

    // Sleep can be at most 18 hours.
    if (sleep && parseFloat(sleep) > 18) {
      setError('Sleep hours can not be more than 18.');
      return;
    }

    setSaving(true);
    const payload = {
      log_date: date,
      mood: mood || null,
      symptoms: symptoms.length > 0 ? symptoms : null,
      energy_level: energy,
      sleep_hours: sleep ? parseFloat(sleep) : null,
      notes: notes || null,
    };
    if (existing) {
      try {
        await api.updateDailyLog(existing.id, payload);
      } catch (err) {
        setSaving(false);
        setError((err as Error).message);
        return;
      }
    } else {
      try {
        await api.createDailyLog(payload);
      } catch (err) {
        setSaving(false);
        setError((err as Error).message);
        return;
      }
    }
    setSaving(false);
    onSaved();
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl my-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{existing ? 'Edit Entry' : 'Log Your Day'}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-gray-500" /></button>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
            <div className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500">
              {formatDateLong(date)}
            </div>
            <p className="text-xs text-gray-400 mt-1">Entries are always logged for today.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">How are you feeling?</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {MOOD_OPTIONS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setMood(mood === m.value ? '' : m.value)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-xl transition ${
                    mood === m.value ? 'bg-brand-500 text-white' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span className="text-xs font-medium">{m.label}</span>
                </button>
              ))}
            </div>
            {moodSuggestion && (
              <div className="mt-3 p-3 rounded-xl bg-brand-50 border border-brand-200 text-sm text-gray-700">
                <span className="font-medium">
                  {mood === 'sad' && "Feeling sad? "}
                  {mood === 'anxious' && "Feeling anxious? "}
                  {mood === 'irritable' && "Feeling irritable? "}
                </span>
                {moodSuggestion}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {SYMPTOM_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    symptoms.includes(s) ? 'bg-brand-500 text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {s}
                </button>
              ))}
              {symptoms.filter((s) => !SYMPTOM_OPTIONS.includes(s)).map((s) => (
                <button
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-brand-500 text-white"
                >
                  {s} ✕
                </button>
              ))}
              {showOtherInput ? (
                <input
                  autoFocus
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  onBlur={addOtherSymptom}
                  onKeyDown={(e) => { if (e.key === 'Enter') addOtherSymptom(); }}
                  placeholder="Type a symptom…"
                  className="px-3 py-1.5 rounded-full text-sm border border-brand-300 outline-none focus:ring-2 focus:ring-brand-100"
                />
              ) : (
                <button
                  onClick={() => setShowOtherInput(true)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-50 text-gray-600 hover:bg-gray-100 border border-dashed border-gray-300 transition"
                >
                  + Other
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Energy: {energy}/5</label>
              <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full accent-brand-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sleep (hours)</label>
              <input
                type="number"
                step="0.5"
                min={0}
                max={18}
                value={sleep}
                onChange={(e) => setSleep(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 outline-none ${
                  sleep && parseFloat(sleep) > 18
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                    : 'border-gray-200 focus:border-brand-400 focus:ring-brand-100'
                }`}
                placeholder="7.5"
              />
              {sleep && parseFloat(sleep) > 18 && (
                <p className="text-xs text-red-500 mt-1">Max 18 hours.</p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none resize-none" placeholder="Anything on your mind?" />
          </div>
          {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
          <button onClick={save} disabled={saving} className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Entry'}
          </button>
        </div>
      </div>
    </div>
  );
}
