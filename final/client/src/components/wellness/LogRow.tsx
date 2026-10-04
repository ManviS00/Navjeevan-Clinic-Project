import { api } from '@/lib/api';
import type { DailyLog } from '@/lib/types';
import { MOOD_OPTIONS } from '@/lib/types';
import { formatDateLong } from '@/lib/date';
import { X } from 'lucide-react';

export default function LogRow({ log, onUpdate }: { log: DailyLog; onUpdate: () => void }) {
  const mood = MOOD_OPTIONS.find((m) => m.value === log.mood);
  async function del() {
    await api.deleteDailyLog(log.id);
    onUpdate();
  }
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 transition group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-2xl">{mood?.emoji ?? '🙂'}</div>
        <div className="min-w-0">
          <p className="font-medium text-gray-900">{formatDateLong(log.log_date)}</p>
          <p className="text-sm text-gray-400 truncate">
            {log.symptoms && log.symptoms.length > 0 ? log.symptoms.join(', ') : 'No symptoms logged'}
            {log.energy_level && ` · Energy ${log.energy_level}/5`}
            {log.sleep_hours && ` · ${log.sleep_hours}h sleep`}
          </p>
        </div>
      </div>
      <button onClick={del} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 transition shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
