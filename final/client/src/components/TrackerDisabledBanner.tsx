import { Baby } from 'lucide-react';

export default function TrackerDisabledBanner({ message }: { message: string }) {
  return (
    <div className="bg-gradient-to-br from-brand-100 to-brand-100 rounded-2xl p-8 text-center border border-brand-200">
      <div className="w-16 h-16 rounded-full bg-brand-200 flex items-center justify-center mx-auto mb-4">
        <Baby className="w-8 h-8 text-brand-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">This tracker is paused</h3>
      <p className="text-gray-600 max-w-md mx-auto">{message}</p>
    </div>
  );
}
