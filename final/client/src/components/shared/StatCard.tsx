import type { ReactNode } from 'react';

export type StatCardColor = 'rose' | 'pink' | 'amber' | 'indigo';

const COLOR_CLASSES: Record<StatCardColor, string> = {
  rose: 'bg-brand-50 text-brand-600',
  pink: 'bg-brand-50 text-brand-600',
  amber: 'bg-amber-50 text-amber-600',
  indigo: 'bg-indigo-50 text-indigo-600',
};

export default function StatCard({
  icon, label, value, sub, color,
}: {
  icon: ReactNode; label: string; value: string; sub: string; color: StatCardColor;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-brand-100">
      <div className={`w-10 h-10 rounded-xl ${COLOR_CLASSES[color]} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
