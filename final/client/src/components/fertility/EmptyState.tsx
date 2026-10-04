import { Flower } from 'lucide-react';

export default function EmptyState() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Flower className="w-6 h-6 text-brand-500" /> Get Pregnant
        </h1>
        <p className="text-gray-500 mt-1">Track your fertile window and maximize your chances.</p>
      </div>
      <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
          <Flower className="w-8 h-8 text-brand-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Log your period first</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          Head to the Period Tracker and log at least one period. We use your cycle history
          to predict your fertile window and ovulation day.
        </p>
      </div>
    </div>
  );
}
