import { useState } from 'react';
import { useStage } from '@/lib/stage';
import type { TabId } from '@/components/DashboardLayout';
import { Baby, Plus } from 'lucide-react';

import { getPregnancyInfo } from './utils';
import SetupModal from './SetupModal';
import OutcomeModal from './OutcomeModal';
import OutcomeView from './OutcomeView';
import OverviewTab from './tabs/OverviewTab';

type SubTab = 'overview';

const SUB_TABS: { id: SubTab; label: string; icon: typeof Baby }[] = [
  { id: 'overview', label: 'Overview', icon: Baby },
];

export default function PregnancyTracker({ onNavigate }: { onNavigate: (t: TabId) => void }) {
  const { pregnancy, loading, endPregnancy } = useStage();
  const [showSetup, setShowSetup] = useState(false);
  const [subTab, setSubTab] = useState<SubTab>('overview');
  const [showOutcome, setShowOutcome] = useState(false);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading…</div>;

  if (!pregnancy) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Baby className="w-6 h-6 text-brand-500" /> Pregnancy Tracker
          </h1>
          <p className="text-gray-500 mt-1">Follow your baby's growth week by week.</p>
        </div>
        <div className="bg-white rounded-2xl border border-brand-100 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-brand-100 flex items-center justify-center mx-auto mb-4">
            <Baby className="w-8 h-8 text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Set up your pregnancy tracker</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Enter your due date or last menstrual period to start tracking your baby's development week by week.
          </p>
          <button onClick={() => setShowSetup(true)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition">
            <Plus className="w-4 h-4" /> Get started
          </button>
        </div>
        {showSetup && <SetupModal onClose={() => setShowSetup(false)} onSaved={() => setShowSetup(false)} />}
      </div>
    );
  }

  if (pregnancy.outcome) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Baby className="w-6 h-6 text-brand-500" /> Pregnancy Tracker
          </h1>
        </div>
        <OutcomeView pregnancy={pregnancy} onNavigate={onNavigate} onEditOutcome={() => setShowOutcome(true)} />
        {showOutcome && (
          <OutcomeModal
            onClose={() => setShowOutcome(false)}
            onConfirm={async (outcome, date) => { await endPregnancy(outcome, date); setShowOutcome(false); }}
            existingOutcome={pregnancy.outcome}
          />
        )}
      </div>
    );
  }

  const info = getPregnancyInfo(pregnancy.due_date);
  const { clampedWeek } = info;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Baby className="w-6 h-6 text-brand-500" /> Pregnancy Tracker
          </h1>
          <p className="text-gray-500 mt-1">
            {pregnancy.baby_nickname ? `Baby ${pregnancy.baby_nickname}` : 'Your baby'} · Week {clampedWeek}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowSetup(true)} className="text-sm text-brand-600 hover:underline font-medium">Edit due date</button>
          <button onClick={() => setShowOutcome(true)} className="text-sm text-gray-400 hover:text-brand-500 font-medium">Record outcome</button>
        </div>
      </div>

      {/* Hero countdown */}
      <div className="bg-gradient-to-br from-brand-500 to-brand-600 rounded-3xl p-8 text-white relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -left-4 w-32 h-32 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-brand-100 text-sm font-medium uppercase tracking-wide">Days Until Due Date</p>
          <p className="text-6xl font-bold mt-1">{info.daysUntilDue > 0 ? info.daysUntilDue : '0'}</p>
          <p className="text-brand-100 mt-2">
            Due {new Date(pregnancy.due_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-brand-100 mb-1">
              <span>Week {clampedWeek} of 40</span>
              <span>{Math.round(info.progress)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/20 overflow-hidden">
              <div className="h-full rounded-full bg-white transition-all duration-500" style={{ width: `${info.progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm whitespace-nowrap transition ${
              subTab === tab.id ? 'bg-brand-500 text-white shadow-md shadow-brand-200' : 'bg-white text-gray-600 hover:bg-brand-50 border border-brand-100'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {subTab === 'overview' && <OverviewTab info={info} pregnancy={pregnancy} />}
      
      {showSetup && <SetupModal existing={pregnancy} onClose={() => setShowSetup(false)} onSaved={() => setShowSetup(false)} />}
      {showOutcome && (
        <OutcomeModal
          onClose={() => setShowOutcome(false)}
          onConfirm={async (outcome, date) => { await endPregnancy(outcome, date); setShowOutcome(false); }}
        />
      )}
    </div>
  );
}
