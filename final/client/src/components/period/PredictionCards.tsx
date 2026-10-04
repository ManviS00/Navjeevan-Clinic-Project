import { Calendar, Droplet, TrendingUp, Activity } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import { toISODate, daysBetween, formatDateShort } from '@/lib/date';
import { PHASE_INFO, type CyclePrediction } from './types';

export default function PredictionCards({ prediction }: { prediction: CyclePrediction }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Calendar className="w-5 h-5" />}
        label="Next Period"
        value={prediction.daysUntilNext <= 0 ? 'Today' : `in ${prediction.daysUntilNext} days`}
        sub={formatDateShort(toISODate(prediction.nextPeriodStart))}
        color="rose"
      />
      <StatCard
        icon={<Droplet className="w-5 h-5" />}
        label="Fertile Window"
        value={`${daysBetween(prediction.fertileStart, prediction.fertileEnd) + 1} days`}
        sub={`${formatDateShort(toISODate(prediction.fertileStart))} – ${formatDateShort(toISODate(prediction.fertileEnd))}`}
        color="pink"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Cycle Day"
        value={`Day ${prediction.dayOfCycle}`}
        sub={`Avg cycle: ${prediction.avgCycleLength} days`}
        color="amber"
      />
      <StatCard
        icon={<Activity className="w-5 h-5" />}
        label="Current Phase"
        value={PHASE_INFO[prediction.currentPhase].label}
        sub={`Avg period: ${prediction.avgPeriodLength} days`}
        color="indigo"
      />
    </div>
  );
}
