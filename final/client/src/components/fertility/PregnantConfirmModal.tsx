import { useState } from 'react';
import { Baby } from 'lucide-react';
import SetupModal from '@/components/pregnancy/SetupModal';

export default function PregnantConfirmModal({
  onClose, onConfirmed,
}: {
  onClose: () => void; onConfirmed: () => void;
}) {
  const [step, setStep] = useState<'confirm' | 'details'>('confirm');

  if (step === 'confirm') {
    return (
      <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-400 to-brand-500 flex items-center justify-center mx-auto mb-6">
            <Baby className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h3>
          <p className="text-gray-600 mb-6">You're pregnant. Start tracking your pregnancy now to follow your baby's journey week by week.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition">Not yet</button>
            <button onClick={() => setStep('details')} className="flex-1 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition">Start Pregnancy Tracker</button>
          </div>
        </div>
      </div>
    );
  }

  // Same setup form used by the Pregnancy Tracker, so due-date / how-far-along
  // limits and validation stay identical everywhere pregnancy tracking starts.
  return <SetupModal onClose={onClose} onSaved={onConfirmed} />;
}
