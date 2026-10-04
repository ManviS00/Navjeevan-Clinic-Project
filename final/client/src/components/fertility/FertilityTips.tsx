import { Calendar, Droplet, Heart, Thermometer } from 'lucide-react';

const TIPS = [
  { icon: Calendar, title: 'Track ovulation', desc: 'Use OPKs and BBT to pinpoint your most fertile days.' },
  { icon: Droplet, title: 'Watch cervical mucus', desc: 'Egg-white discharge signals approaching ovulation.' },
  { icon: Heart, title: 'Try every 2–3 days', desc: 'Regular intercourse through your window maximizes odds.' },
  { icon: Thermometer, title: 'Measure BBT', desc: 'A sustained temp rise confirms ovulation occurred.' },
];

export default function FertilityTips() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-brand-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips to Conceive Faster</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TIPS.map((tip) => (
          <div key={tip.title} className="flex gap-3 p-3 rounded-xl bg-brand-50/50">
            <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center shrink-0">
              <tip.icon className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 text-sm">{tip.title}</p>
              <p className="text-xs text-gray-500">{tip.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
