import { WEEK_DATA } from './weekData';

export interface PregnancyInfo {
  weeksPregnant: number;
  daysIntoWeek: number;
  daysUntilDue: number;
  progress: number;
  lmp: Date;
  due: Date;
  weekInfo: ReturnType<typeof getWeekInfo>;
  clampedWeek: number;
}

function getWeekInfo(week: number) {
  return WEEK_DATA[week] || WEEK_DATA[40];
}

export function getPregnancyInfo(dueDate: string, today: Date = new Date()): PregnancyInfo {
  const due = new Date(dueDate + 'T00:00:00');
  const lmp = new Date(due);
  lmp.setDate(lmp.getDate() - 280);
  const daysSinceLMP = Math.floor((today.getTime() - lmp.getTime()) / 86400000);
  const weeksPregnant = Math.floor(daysSinceLMP / 7);
  const daysIntoWeek = daysSinceLMP % 7;
  const daysUntilDue = Math.floor((due.getTime() - today.getTime()) / 86400000);
  const totalDays = 280;
  const progress = Math.min(100, Math.max(0, (daysSinceLMP / totalDays) * 100));
  const clampedWeek = Math.max(1, Math.min(40, weeksPregnant));
  const weekInfo = getWeekInfo(clampedWeek);
  return { weeksPregnant, daysIntoWeek, daysUntilDue, progress, lmp, due, weekInfo, clampedWeek };
}
