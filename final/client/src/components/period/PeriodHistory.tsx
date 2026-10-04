import { Droplet, X } from 'lucide-react';
import { api } from '@/lib/api';
import { parseISODate, daysBetween, formatDateLong } from '@/lib/date';
import type { PeriodCycle } from '@/lib/types';

export default function PeriodHistory({
  cycles, onUpdate, onEdit,
}: {
  cycles: PeriodCycle[]; onUpdate: () => void; onEdit: (c: PeriodCycle) => void;
}) {
  async function deleteCycle(id: string) {
    await api.deletePeriodCycle(id);
    onUpdate();
  }

  if (cycles.length === 0) return null;
  return (
    <div className="bg-white rounded-2xl p-6 border border-brand-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cycle History</h3>
      <div className="space-y-2">
        {[...cycles].sort((a, b) => b.start_date.localeCompare(a.start_date)).map((c) => {
          const start = parseISODate(c.start_date);
          const end = c.end_date ? parseISODate(c.end_date) : null;
          const length = end ? daysBetween(start, end) + 1 : c.period_length;
          return (
            <div key={c.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-brand-50/50 transition group">
              <button className="flex items-center gap-3 text-left flex-1 min-w-0" onClick={() => onEdit(c)}>
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
                  <Droplet className="w-5 h-5 text-brand-500" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900">{formatDateLong(c.start_date)}</p>
                  <p className="text-sm text-gray-400">
                    {length ? `${length} days` : 'Ongoing'}{!end && ' (estimated)'}
                    {c.flow_intensity && ` · ${c.flow_intensity} flow`}
                  </p>
                </div>
              </button>
              <button
                onClick={() => deleteCycle(c.id)}
                className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-gray-400 hover:text-red-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3">Tap an entry to edit it.</p>
    </div>
  );
}
