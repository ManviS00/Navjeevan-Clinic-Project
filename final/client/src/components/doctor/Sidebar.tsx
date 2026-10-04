import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Pill,
  FlaskConical,
  Stethoscope,
  Home,
  LogOut,
  X,
} from 'lucide-react';

const nav = [
  { to: '/doctor', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/doctor/patients', label: 'Patients', icon: Users },
  { to: '/doctor/appointments', label: 'Appointments', icon: CalendarDays },
  { to: '/doctor/prescriptions', label: 'Prescriptions', icon: Pill },
  { to: '/doctor/reports', label: 'Reports', icon: FlaskConical },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:static z-40 h-full w-72 shrink-0 transform bg-white border-r border-slate-200 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 px-6 py-5 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl overflow-hidden bg-white border border-slate-100 shadow-md flex items-center justify-center">
                <img src="/navjeevan-logo.jpeg" alt="Navjeevan Clinic logo" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="font-display text-base font-extrabold text-slate-900 leading-tight">
                  Navjeevan Clinic
                </p>
                <p className="text-xs text-slate-400">Management Suite</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/"
              onClick={onClose}
              className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <Home className="h-4 w-4 shrink-0" />
              Back to Home
            </NavLink>
          </nav>

          <div className="border-t border-slate-100 p-4">
            <button
              type="button"
              onClick={() => {
                localStorage.removeItem('navjeevan_backend_token');
                localStorage.removeItem('navjeevan_backend_user');
                localStorage.removeItem('lumina_user');
                window.location.href = '/';
              }}
              className="mb-2 flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              Sign Out
            </button>
            <NavLink
              to="/doctor/profile"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 transition hover:bg-brand-50"
            >
             <img src="/doctor/doctor.jpeg"
                  alt="Dr. Aayushi Pal"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-brand-100"/>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800">
                  Dr. Aayushi Pal
                </p>
                <p className="truncate text-xs text-slate-400">Gynaecologist</p>
              </div>
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
