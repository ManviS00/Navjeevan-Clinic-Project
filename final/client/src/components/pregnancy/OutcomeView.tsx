import { Baby, Heart, AlertCircle, Activity } from 'lucide-react';
import { formatDateLong, formatDateShort, todayISO } from '@/lib/date';
import type { PregnancyProfile } from '@/lib/types';
import type { TabId } from '@/components/DashboardLayout';

const OUTCOME_INFO: Record<string, { label: string; icon: typeof Baby; color: 'green' | 'amber' | 'gray' }> = {
  live_birth: { label: 'Live Birth', icon: Baby, color: 'green' },
  premature: { label: 'Premature Birth', icon: Baby, color: 'green' },
  miscarriage: { label: 'Miscarriage', icon: Heart, color: 'amber' },
  stillbirth: { label: 'Stillbirth', icon: Heart, color: 'amber' },
  termination: { label: 'Termination', icon: AlertCircle, color: 'gray' },
};

export default function OutcomeView({
  pregnancy, onNavigate, onEditOutcome,
}: {
  pregnancy: PregnancyProfile; onNavigate: (t: TabId) => void; onEditOutcome: () => void;
}) {
  const info = OUTCOME_INFO[pregnancy.outcome ?? ''] ?? OUTCOME_INFO.termination;
  const Icon = info.icon;

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl p-8 text-center border ${
        info.color === 'green' ? 'bg-green-50 border-green-200' :
        info.color === 'amber' ? 'bg-amber-50 border-amber-200' :
        'bg-gray-50 border-gray-200'
      }`}>
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          info.color === 'green' ? 'bg-green-200' :
          info.color === 'amber' ? 'bg-amber-200' : 'bg-gray-200'
        }`}>
          <Icon className={`w-8 h-8 ${
            info.color === 'green' ? 'text-green-600' :
            info.color === 'amber' ? 'text-amber-600' : 'text-gray-600'
          }`} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{info.label}</h3>
        <p className="text-gray-600 mb-1">
          {pregnancy.outcome_date && `Recorded on ${formatDateLong(pregnancy.outcome_date)}`}
        </p>
        <p className="text-gray-500 text-sm">
          Pregnancy tracked from {formatDateShort(pregnancy.lmp_date || pregnancy.due_date)} to {formatDateShort(pregnancy.outcome_date || todayISO())}
        </p>
        <button onClick={onEditOutcome} className="text-xs text-gray-400 hover:text-brand-500 underline mt-3">Edit outcome details</button>
      </div>

      {pregnancy.outcome === 'miscarriage' && (
        <div className="bg-white rounded-2xl p-6 border border-brand-100">
          <h3 className="font-semibold text-gray-900 mb-3">Support Resources</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>We're sorry for your loss. Miscarriage is common and not your fault. Here are some resources that may help:</p>
            <ul className="space-y-2">
              <li className="flex gap-2"><Heart className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" /> Reach out to your healthcare provider for physical recovery guidance.</li>
              <li className="flex gap-2"><Heart className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" /> Consider talking to a counselor or joining a support group for emotional support.</li>
              <li className="flex gap-2"><Heart className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" /> Give yourself time to heal — both physically and emotionally.</li>
            </ul>
          </div>
        </div>
      )}

      {pregnancy.outcome === 'stillbirth' && (
        <div className="bg-white rounded-2xl p-6 border border-brand-100">
          <h3 className="font-semibold text-gray-900 mb-3">Support Resources</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>We're so sorry for your loss. Here are some resources that may help:</p>
            <ul className="space-y-2">
              <li className="flex gap-2"><Heart className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" /> Reach out to your healthcare provider for physical recovery guidance.</li>
              <li className="flex gap-2"><Heart className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" /> Consider talking to a counselor or joining a support group for emotional support.</li>
              <li className="flex gap-2"><Heart className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" /> Give yourself time to heal — both physically and emotionally.</li>
            </ul>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border border-brand-100 text-center">
        <p className="text-gray-600 mb-4">
          {pregnancy.outcome === 'live_birth' || pregnancy.outcome === 'premature'
            ? 'Period tracking is already back on — head there to monitor your postpartum cycle recovery.'
            : 'Period tracking is already back on. Your cycle predictions will restart once you log your next period.'}
        </p>
        <button onClick={() => onNavigate('period')} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition">
          <Activity className="w-5 h-5" /> Go to Period Tracker
        </button>
      </div>
    </div>
  );
}
