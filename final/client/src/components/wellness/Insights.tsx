import type { DailyLog } from '@/lib/types';
import { MOOD_OPTIONS } from '@/lib/types';
import { TrendingUp } from 'lucide-react';

export default function Insights({ logs }: { logs: DailyLog[] }) {
  const moodCounts: Record<string, number> = {};
  logs.forEach((l) => { if (l.mood) moodCounts[l.mood] = (moodCounts[l.mood] || 0) + 1; });
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];
  const avgEnergy = logs.filter((l) => l.energy_level).reduce((s, l) => s + (l.energy_level || 0), 0) / (logs.filter((l) => l.energy_level).length || 1);
  const avgSleep = logs.filter((l) => l.sleep_hours).reduce((s, l) => s + (l.sleep_hours || 0), 0) / (logs.filter((l) => l.sleep_hours).length || 1);
  const symptomCounts: Record<string, number> = {};
  logs.forEach((l) => l.symptoms?.forEach((s) => { symptomCounts[s] = (symptomCounts[s] || 0) + 1; }));
  const topSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="bg-white rounded-2xl p-6 border border-brand-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-brand-500" /> Your Patterns
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <InsightCard label="Most common mood" value={topMood ? topMood[0] : '—'} emoji={topMood ? MOOD_OPTIONS.find((m) => m.value === topMood[0])?.emoji : '—'} />
        <InsightCard label="Avg energy" value={avgEnergy ? `${avgEnergy.toFixed(1)}/5` : '—'} />
        <InsightCard label="Avg sleep" value={avgSleep ? `${avgSleep.toFixed(1)}h` : '—'} />
        <InsightCard label="Top symptom" value={topSymptom ? topSymptom[0] : '—'} />
      </div>
    </div>
  );
}

function InsightCard({ label, value, emoji }: { label: string; value: string; emoji?: string }) {
  return (
    <div className="p-4 rounded-xl bg-brand-50/50">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-gray-900 capitalize">{emoji ? `${emoji} ` : ''}{value}</p>
    </div>
  );
}
