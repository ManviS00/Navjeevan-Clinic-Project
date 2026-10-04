import type { PeriodCycle } from '@/lib/types';
import { parseISODate, addDays, daysBetween } from '@/lib/date';

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
export type CalendarDayStatus = 'period' | 'fertile' | 'ovulation' | 'predicted' | null;

export interface CyclePrediction {
  nextPeriodStart: Date;
  nextPeriodEnd: Date;
  fertileStart: Date;
  fertileEnd: Date;
  ovulationDate: Date;
  avgCycleLength: number;
  avgPeriodLength: number;
  currentPhase: CyclePhase;
  dayOfCycle: number;
  daysUntilNext: number;
}

export function computePrediction(
  cycles: PeriodCycle[],
  today: Date,
  defaultPeriodLength = DEFAULT_PERIOD_LENGTH,
): CyclePrediction | null {
  const sorted = [...cycles].sort((a, b) => a.start_date.localeCompare(b.start_date));
  if (sorted.length === 0) return null;

  // Average cycle length from gaps between consecutive starts
  let avgCycle = DEFAULT_CYCLE_LENGTH;
  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(daysBetween(parseISODate(sorted[i - 1].start_date), parseISODate(sorted[i].start_date)));
    }
    avgCycle = Math.round(gaps.reduce((s, v) => s + v, 0) / gaps.length);
  }

  // Average period length — prefer each cycle's own recorded length
  // (explicit end_date first, else the length the user logged) over a
  // hardcoded assumption.
  let avgPeriod = defaultPeriodLength;
  const lengths = sorted.map((c) => (c.end_date ? daysBetween(parseISODate(c.start_date), parseISODate(c.end_date)) + 1 : c.period_length));
  if (lengths.length > 0) {
    avgPeriod = Math.round(lengths.reduce((s, v) => s + v, 0) / lengths.length);
  }

  const lastStart = parseISODate(sorted[sorted.length - 1].start_date);
  const dayOfCycle = daysBetween(lastStart, today) + 1;

  // Find the next predicted period start
  let nextStart = lastStart;
  while (nextStart <= today) nextStart = addDays(nextStart, avgCycle);
  const nextEnd = addDays(nextStart, avgPeriod - 1);

  // Ovulation ~14 days before next period
  const ovulation = addDays(nextStart, -14);
  const fertileStart = addDays(ovulation, -5);
  const fertileEnd = addDays(ovulation, 1);

  let phase: CyclePhase;
  if (dayOfCycle <= avgPeriod) phase = 'menstrual';
  else if (dayOfCycle <= avgCycle - 20) phase = 'follicular';
  else if (dayOfCycle <= avgCycle - 12) phase = 'ovulation';
  else phase = 'luteal';

  const daysUntilNext = daysBetween(today, nextStart);

  return {
    nextPeriodStart: nextStart,
    nextPeriodEnd: nextEnd,
    fertileStart,
    fertileEnd,
    ovulationDate: ovulation,
    avgCycleLength: avgCycle,
    avgPeriodLength: avgPeriod,
    currentPhase: phase,
    dayOfCycle,
    daysUntilNext,
  };
}

export const PHASE_INFO: Record<CyclePhase, { label: string; color: string; desc: string }> = {
  menstrual: { label: 'Menstrual', color: 'bg-brand-500', desc: 'Your period is here. Rest and be gentle with yourself.' },
  follicular: { label: 'Follicular', color: 'bg-amber-400', desc: 'Energy rising. A great time for new projects.' },
  ovulation: { label: 'Ovulation', color: 'bg-brand-400', desc: 'Peak fertility. You may feel most confident now.' },
  luteal: { label: 'Luteal', color: 'bg-indigo-400', desc: 'PMS zone. Prioritize self-care and reflection.' },
};
