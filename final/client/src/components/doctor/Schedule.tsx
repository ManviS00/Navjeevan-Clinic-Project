import { Clock, Stethoscope, Baby, Scissors } from 'lucide-react';

const schedule = [
  { time: '9:00 AM', title: 'Consultation', icon: Stethoscope, tint: 'text-brand-600 bg-brand-50' },
  { time: '11:00 AM', title: 'ANC Checkup', icon: Baby, tint: 'text-pink-600 bg-pink-50' },
  { time: '2:00 PM', title: 'Surgery', icon: Scissors, tint: 'text-rose-600 bg-rose-50' },
];

export default function Schedule() {
  return (
    <div className="space-y-2">
      {schedule.map((s) => (
        <div
          key={s.time}
          className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-brand-200 hover:bg-brand-50/30"
        >
          <div className={`grid h-10 w-10 place-items-center rounded-lg ${s.tint}`}>
            <s.icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-800">{s.title}</p>
            <p className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              {s.time}
            </p>
          </div>
          <div className="h-2 w-2 rounded-full bg-brand-400" />
        </div>
      ))}
    </div>
  );
}
