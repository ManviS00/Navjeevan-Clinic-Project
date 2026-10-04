import { Activity } from 'lucide-react';
import { PHASE_INFO, type CyclePrediction } from './types';

export default function PhaseBanner({ prediction }: { prediction: CyclePrediction }) {
  const phase = PHASE_INFO[prediction.currentPhase];
  return (
    <div className="bg-white rounded-2xl p-6 border border-brand-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full ${phase.color} flex items-center justify-center shrink-0`}>
        <Activity className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{phase.label} Phase</h3>
        <p className="text-sm text-gray-500">{phase.desc}</p>
      </div>
    </div>
  );
}
