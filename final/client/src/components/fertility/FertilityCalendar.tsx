import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { sameDay, monthName } from '@/lib/date';
import type { FertilityDayStatus } from './types';

const STATUS_STYLES: Record<string, string> = {
  fertile: 'bg-brand-100 text-brand-700',
  ovulation: 'bg-purple-500 text-white',
  peak: 'bg-amber-500 text-white',
  intercourse: 'bg-indigo-100 text-indigo-700',
};

const LEGEND = [
  { label: 'Fertile', cls: 'bg-brand-100' },
  { label: 'Ovulation', cls: 'bg-purple-500' },
  { label: 'Peak (OPK+)', cls: 'bg-amber-500' },
  { label: 'Tried', cls: 'bg-indigo-100' },
];

export default function FertilityCalendar({
  month, today, onPrev, onNext, getDayStatus,
}: {
  month: Date; today: Date; onPrev: () => void; onNext: () => void;
  getDayStatus: (d: Date) => FertilityDayStatus;
}) {
  const year = month.getFullYear();
  const m = month.getMonth();
  const firstDay = new Date(year, m, 1);
  const lastDay = new Date(year, m + 1, 0);
  const startPad = firstDay.getDay();
  const totalDays = lastDay.getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(new Date(year, m, d));
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-white rounded-2xl p-6 border border-brand-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{monthName(m)} {year}</h3>
        <div className="flex gap-1">
          <button onClick={onPrev} className="p-2 rounded-lg hover:bg-brand-50 text-gray-600"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={onNext} className="p-2 rounded-lg hover:bg-brand-50 text-gray-600"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const status = getDayStatus(d);
          const isToday = sameDay(d, today);
          const base = 'aspect-square flex items-center justify-center rounded-lg text-sm transition relative';
          let cls = 'text-gray-700 hover:bg-gray-50';
          if (status) cls = STATUS_STYLES[status] || cls;
          if (isToday) cls += ' ring-2 ring-brand-400 ring-offset-1';
          return (
            <div key={i} className={`${base} ${cls}`} title={[status, isToday ? 'today' : null].filter(Boolean).join(' · ') || undefined}>
              {d.getDate()}
              {status === 'intercourse' && <CheckCircle2 className="w-3 h-3 absolute bottom-0.5 right-0.5 text-indigo-400" />}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className={`w-3 h-3 rounded ${l.cls}`} />
            <span className="text-xs text-gray-500">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
