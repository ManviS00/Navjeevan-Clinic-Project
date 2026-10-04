import { Flower, X } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDateLong } from '@/lib/date';
import type { FertilityLog } from '@/lib/types';
import { mucusFertility } from './types';

export default function FertilityHistory({
  logs, onUpdate,
}: {
  logs: FertilityLog[]; onUpdate: () => void;
}) {
  if (logs.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl p-6 border border-brand-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fertility Log History</h3>
      <div className="space-y-2">
        {logs.slice(0, 14).map((log) => {
          const mf = mucusFertility(log.cervical_mucus);
          return (
            <div key={log.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 transition group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                  <Flower className="w-5 h-5 text-brand-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{formatDateLong(log.log_date)}</p>
                  <p className="text-sm text-gray-400 truncate">
                    {log.bbt_temperature && `BBT ${log.bbt_temperature}°F · `}
                    {log.cervical_mucus && `Mucus: ${log.cervical_mucus} · `}
                    {log.opk_result && `OPK: ${log.opk_result} · `}
                    {log.had_intercourse && 'Tried'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {mf === 'high' && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-100 text-brand-600 font-medium">High</span>}
                {mf === 'medium' && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600 font-medium">Medium</span>}
                {log.opk_result === 'positive' && <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500 text-white font-medium">Peak</span>}
                <button
                  onClick={async () => { await api.deleteFertilityLog(log.id); onUpdate(); }}
                  className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
