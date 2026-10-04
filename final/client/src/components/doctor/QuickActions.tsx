import { Link } from 'react-router-dom';
import {
  FilePlus,
  FlaskConical,
  History,
  Video,
  MessageCircle,
} from 'lucide-react';

const actions = [
  { label: 'Add Prescription', icon: FilePlus, to: '/doctor/prescriptions/new', tint: 'hover:border-brand-300 hover:bg-brand-50' },
  { label: 'Patient Medical Reports', icon: FlaskConical, to: '/doctor/reports', tint: 'hover:border-amber-300 hover:bg-amber-50' },
  { label: 'View Patient History', icon: History, to: '/doctor/patients', tint: 'hover:border-blue-300 hover:bg-blue-50' },
  { label: 'Start Video Consultation', icon: Video, to: '/doctor/video', tint: 'hover:border-violet-300 hover:bg-violet-50' },
  { label: 'Send WhatsApp Reminder', icon: MessageCircle, to: '/doctor/messages', tint: 'hover:border-teal-300 hover:bg-teal-50' },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {actions.map((a) => (
        <Link
          key={a.label}
          to={a.to}
          className={`flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-medium text-slate-700 transition-all hover:-translate-y-0.5 ${a.tint}`}
        >
          <a.icon className="h-5 w-5 shrink-0" />
          {a.label}
        </Link>
      ))}
    </div>
  );
}
