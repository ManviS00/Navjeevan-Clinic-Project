import { Activity, Plus } from 'lucide-react';

export default function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
        <Activity className="w-8 h-8 text-brand-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Start tracking your cycle</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Log your first period to unlock predictions for your next period, fertile window, and current cycle phase.
      </p>
      <button onClick={onAdd} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition">
        <Plus className="w-4 h-4" /> Log your first period
      </button>
    </div>
  );
}
