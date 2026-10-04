import { Calendar, Droplet, TrendingUp, Heart, Sparkles } from 'lucide-react';
import StatCard from '@/components/shared/StatCard';
import { toISODate, daysBetween, formatDateShort } from '@/lib/date';
import type { FertilityPrediction } from './types';

export function OvulationHero({ prediction }: { prediction: FertilityPrediction }) {
  return (
    <div className={`rounded-3xl p-8 text-white relative overflow-hidden ${
      prediction.isOvulationDay
        ? 'bg-gradient-to-br from-brand-500 to-brand-600'
        : prediction.inFertileWindow
          ? 'bg-gradient-to-br from-brand-400 to-brand-500'
          : 'bg-gradient-to-br from-brand-500 to-brand-600'
    }`}>
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-12 -left-4 w-32 h-32 rounded-full bg-white/10" />
      <div className="relative">
        {prediction.isOvulationDay ? (
          <>
            <p className="text-brand-100 text-sm font-medium uppercase tracking-wide">Today is Ovulation Day</p>
            <p className="text-4xl font-bold mt-2 flex items-center gap-2">
              <Sparkles className="w-8 h-8" /> Peak Fertility
            </p>
            <p className="text-brand-100 mt-2">Your best chance to conceive is today and tomorrow.</p>
          </>
        ) : prediction.inFertileWindow ? (
          <>
            <p className="text-brand-100 text-sm font-medium uppercase tracking-wide">You're in your fertile window</p>
            <p className="text-4xl font-bold mt-2">{prediction.daysUntilOvulation === 0 ? 'Ovulation today' : `${prediction.daysUntilOvulation} days to ovulation`}</p>
            <p className="text-brand-100 mt-2">Time to try — your chances are highest right now.</p>
          </>
        ) : prediction.daysUntilOvulation > 0 ? (
          <>
            <p className="text-brand-100 text-sm font-medium uppercase tracking-wide">Days Until Ovulation</p>
            <p className="text-6xl font-bold mt-1">{prediction.daysUntilOvulation}</p>
            <p className="text-brand-100 mt-2">Fertile window starts {formatDateShort(toISODate(prediction.fertileStart))}</p>
          </>
        ) : (
          <>
            <p className="text-brand-100 text-sm font-medium uppercase tracking-wide">Past Ovulation</p>
            <p className="text-4xl font-bold mt-2">Luteal phase</p>
            <p className="text-brand-100 mt-2">Next fertile window in ~{prediction.avgCycleLength - prediction.dayOfCycle} days.</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function PredictionCards({ prediction }: { prediction: FertilityPrediction }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={<Calendar className="w-5 h-5" />}
        label="Ovulation Day"
        value={formatDateShort(toISODate(prediction.ovulationDate))}
        sub={prediction.isOvulationDay ? 'Today!' : prediction.daysUntilOvulation > 0 ? `in ${prediction.daysUntilOvulation} days` : `${Math.abs(prediction.daysUntilOvulation)} days ago`}
        color="pink"
      />
      <StatCard
        icon={<Droplet className="w-5 h-5" />}
        label="Fertile Window"
        value={`${daysBetween(prediction.fertileStart, prediction.fertileEnd) + 1} days`}
        sub={`${formatDateShort(toISODate(prediction.fertileStart))} – ${formatDateShort(toISODate(prediction.fertileEnd))}`}
        color="rose"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5" />}
        label="Cycle Day"
        value={`Day ${prediction.dayOfCycle}`}
        sub={`Avg cycle: ${prediction.avgCycleLength} days`}
        color="amber"
      />
      <StatCard
        icon={<Heart className="w-5 h-5" />}
        label="Best Chance"
        value={prediction.inFertileWindow ? 'Now!' : 'Coming up'}
        sub={prediction.inFertileWindow ? 'Try today' : `in ${prediction.daysUntilOvulation > 0 ? prediction.daysUntilOvulation : prediction.avgCycleLength - prediction.dayOfCycle + 14} days`}
        color="indigo"
      />
    </div>
  );
}
