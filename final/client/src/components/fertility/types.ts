import type { PeriodCycle, CervicalMucus } from '@/lib/types';
import { MUCUS_OPTIONS } from '@/lib/types';
import { parseISODate, addDays, daysBetween, sameDay, isBetween } from '@/lib/date';

export const DEFAULT_CYCLE_LENGTH = 28;

export type FertilityDayStatus = 'fertile' | 'ovulation' | 'peak' | 'intercourse' | null;

export interface FertilityPrediction {
  nextPeriodStart: Date;
  ovulationDate: Date;
  fertileStart: Date;
  fertileEnd: Date;
  avgCycleLength: number;
  dayOfCycle: number;
  daysUntilOvulation: number;
  inFertileWindow: boolean;
  isOvulationDay: boolean;
}

export function computeFertility(cycles: PeriodCycle[], today: Date): FertilityPrediction | null {
  const sorted = [...cycles].sort((a, b) => a.start_date.localeCompare(b.start_date));
  if (sorted.length === 0) return null;

  let avgCycle = DEFAULT_CYCLE_LENGTH;
  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(daysBetween(parseISODate(sorted[i - 1].start_date), parseISODate(sorted[i].start_date)));
    }
    avgCycle = Math.round(gaps.reduce((s, v) => s + v, 0) / gaps.length);
  }

  const lastStart = parseISODate(sorted[sorted.length - 1].start_date);
  const dayOfCycle = daysBetween(lastStart, today) + 1;

  let nextStart = lastStart;
  while (nextStart <= today) nextStart = addDays(nextStart, avgCycle);
  const ovulation = addDays(nextStart, -14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);

  const daysUntilOvulation = daysBetween(today, ovulation);
  const inFertileWindow = isBetween(today, fertileStart, fertileEnd);
  const isOvulationDay = sameDay(today, ovulation);

  return {
    nextPeriodStart: nextStart,
    ovulationDate: ovulation,
    fertileStart,
    fertileEnd,
    avgCycleLength: avgCycle,
    dayOfCycle,
    daysUntilOvulation,
    inFertileWindow,
    isOvulationDay,
  };
}

export function mucusFertility(m: CervicalMucus | null): 'low' | 'medium' | 'high' | null {
  if (!m) return null;
  return MUCUS_OPTIONS.find((o) => o.value === m)?.fertility ?? null;
}
