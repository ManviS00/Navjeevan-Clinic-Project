import type { DailyLog } from '@/lib/types';
import { MOOD_OPTIONS } from '@/lib/types';
import { formatDateLong } from '@/lib/date';
import { Battery, Moon, Sparkles, HeartHandshake } from 'lucide-react';

export default function TodaySummary({ log }: { log: DailyLog }) {
  const mood = MOOD_OPTIONS.find((m) => m.value === log.mood);
  return (
    <div className="bg-gradient-to-br from-brand-50 to-brand-50 rounded-2xl p-6 border border-brand-100">
      <h3 className="font-semibold text-gray-900 mb-4">Today, {formatDateLong(log.log_date)}</h3>
      {(log.mood === 'anxious' || log.mood === 'sad' || (log.energy_level ?? 5) <= 2) && (
        <div className="flex items-start gap-2 mb-4 p-4 rounded-xl bg-white/80 border border-brand-200">
          <HeartHandshake className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-semibold text-gray-900 mb-1">A little care for today</p>
            {log.mood === 'sad' && <p>Try a small mood reset: talk to someone you trust, step outside for fresh air, listen to something comforting, or do one easy activity you enjoy.</p>}
            {log.mood === 'anxious' && <p>Slow things down: take 5–10 gentle breaths, relax your shoulders, reduce unnecessary screen time, and try a short walk or calming music.</p>}
            {log.mood !== 'sad' && log.mood !== 'anxious' && (log.energy_level ?? 5) <= 2 && <p>Your energy is low today. Prioritize rest, regular meals, hydration, and a gentle activity if you feel up to it.</p>}
            <p className="text-xs text-gray-400 mt-2">If low mood, anxiety, or very low energy persists or feels severe, speak with a healthcare professional.</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-3xl mb-1">{mood?.emoji ?? '🙂'}</div>
          <p className="text-xs text-gray-500 capitalize">{log.mood ?? '—'}</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Battery className="w-6 h-6 text-amber-500 mb-1" />
          <p className="text-sm font-semibold text-gray-900">{log.energy_level ? `${log.energy_level}/5` : '—'}</p>
          <p className="text-xs text-gray-500">Energy</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Moon className="w-6 h-6 text-indigo-400 mb-1" />
          <p className="text-sm font-semibold text-gray-900">{log.sleep_hours ? `${log.sleep_hours}h` : '—'}</p>
          <p className="text-xs text-gray-500">Sleep</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <Sparkles className="w-6 h-6 text-brand-400 mb-1" />
          <p className="text-sm font-semibold text-gray-900">{log.symptoms?.length ?? 0}</p>
          <p className="text-xs text-gray-500">Symptoms</p>
        </div>
      </div>
    </div>
  );
}
