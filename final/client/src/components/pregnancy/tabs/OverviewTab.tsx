import { Ruler, Weight, Calendar, Sparkles, Heart } from 'lucide-react';
import { formatDateShort } from '@/lib/date';
import type { PregnancyProfile } from '@/lib/types';
import { TRIMESTER_LABELS } from '../weekData';
import type { PregnancyInfo } from '../utils';

export default function OverviewTab({ info, pregnancy }: { info: PregnancyInfo; pregnancy: PregnancyProfile }) {
  const { weekInfo, clampedWeek } = info;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-brand-100 lg:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-brand-100 text-brand-600 text-xs font-semibold mb-2">
                {TRIMESTER_LABELS[weekInfo.trimester - 1]} · Week {clampedWeek}
              </span>
              <h3 className="text-xl font-bold text-gray-900">Your baby is the size of {weekInfo.sizeCompare}</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
              <Ruler className="w-5 h-5 text-amber-500" />
              <div>
                <p className="text-xs text-gray-500">Length</p>
                <p className="font-semibold text-gray-900">{weekInfo.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50">
              <Weight className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-xs text-gray-500">Weight</p>
                <p className="font-semibold text-gray-900">{weekInfo.weight}</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Baby's development this week</h4>
              <p className="text-gray-600 leading-relaxed">{weekInfo.development}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Your body this week</h4>
              <p className="text-gray-600 leading-relaxed">{weekInfo.maternalChanges}</p>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-brand-50">
              <Sparkles className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
              <p className="text-sm text-brand-700 font-medium">{weekInfo.weeklyTip}</p>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50">
              <Heart className="w-4 h-4 text-brand-500 shrink-0" />
              <p className="text-sm text-amber-700 font-medium">{weekInfo.milestone}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-brand-100">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-brand-500" />
              <h3 className="font-semibold text-gray-900">Timeline</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Weeks pregnant</span>
                <span className="font-semibold text-gray-900">{info.weeksPregnant}w {info.daysIntoWeek}d</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trimester</span>
                <span className="font-semibold text-gray-900">{weekInfo.trimester} of 3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Days remaining</span>
                <span className="font-semibold text-gray-900">{info.daysUntilDue > 0 ? info.daysUntilDue : 'Due!'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Progress</span>
                <span className="font-semibold text-gray-900">{Math.round(info.progress)}%</span>
              </div>
              {pregnancy.lmp_date && (
                <div className="flex justify-between">
                  <span className="text-gray-500">LMP</span>
                  <span className="font-semibold text-gray-900">{formatDateShort(pregnancy.lmp_date)}</span>
                </div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-brand-100">
            <h3 className="font-semibold text-gray-900 mb-2">Baby size</h3>
            <div className="text-center py-4">
              <div className="text-5xl mb-2">👶</div>
              <p className="font-semibold text-gray-900">{weekInfo.size}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Week navigation */}
      <div className="bg-white rounded-2xl p-6 border border-brand-100">
        <h3 className="font-semibold text-gray-900 mb-4">Browse Weeks</h3>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((w) => {
            const isCurrent = w === clampedWeek;
            const isPast = w < clampedWeek;
            return (
              <button
                key={w}
                className={`shrink-0 w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition ${
                  isCurrent ? 'bg-brand-500 text-white shadow-md shadow-brand-200' :
                  isPast ? 'bg-brand-50 text-brand-400' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                }`}
              >
                <span className="text-xs font-medium">Wk</span>
                <span className="text-lg font-bold">{w}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
