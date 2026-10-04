import { Link } from 'react-router-dom';
import { Menu, Video, CalendarClock } from 'lucide-react';

interface TopbarProps {
  onMenuClick: () => void;
  title: string;
  subtitle?: string;
}

export default function Topbar({ onMenuClick, title, subtitle }: TopbarProps) {
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-4 py-3.5 lg:px-8">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-slate-500 hover:text-slate-700"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="font-display text-lg font-bold text-slate-900 truncate lg:text-xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-xs text-slate-400 truncate">{subtitle}</p>
        ) : (
          <p className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarClock className="h-3.5 w-3.5" />
            {today}
          </p>
        )}
      </div>



      <Link
        to="/doctor/video"
        className="btn-primary hidden sm:inline-flex px-3 py-2 text-xs sm:text-sm"
      >
        <Video className="h-4 w-4" />
        <span className="hidden sm:inline">Video Consultation</span>
      </Link>
      <Link to="/doctor/video" className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 transition sm:hidden">
        <Video className="h-5 w-5" />
      </Link>

    </header>
  );
}
