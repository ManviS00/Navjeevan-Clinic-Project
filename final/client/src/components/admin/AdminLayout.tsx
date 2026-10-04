import { useState, type ReactNode } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  UserPlus,
  HeartPulse,
  LogOut,
  Menu,
  X,
  Heart,
  ChevronRight,
} from 'lucide-react';
import type { AdminSection } from '@/types';

interface AdminLayoutProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
  adminEmail: string;
  onSignOut: () => void;
  onBackToSite: () => void;
  children: ReactNode;
}

const navItems: { id: AdminSection; label: string; icon: ReactNode }[] = [
  { id: 'overview', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { id: 'appointments', label: 'Appointments & Reviews', icon: <CalendarCheck size={20} /> },
  { id: 'doctor', label: 'Doctor Profile', icon: <Stethoscope size={20} /> },
  { id: 'add-doctor', label: 'Add Doctor', icon: <UserPlus size={20} /> },
  { id: 'services', label: 'Service Management', icon: <HeartPulse size={20} /> },
];

export default function AdminLayout({
  activeSection,
  onSectionChange,
  adminEmail,
  onSignOut,
  onBackToSite,
  children,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const activeLabel = navItems.find((n) => n.id === activeSection)?.label;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-navy-900 flex flex-col z-30
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex
        `}
      >
        <button onClick={onBackToSite} className="flex items-center gap-3 px-6 py-5 border-b border-white/10 text-left">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
            <img src="/navjeevan-logo.jpeg" alt="Navjeevan Clinic logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight font-serif">Navjeevan Clinic</p>
            <p className="text-rose-400 text-xs font-medium">Admin Panel</p>
          </div>
          <span
            className="ml-auto lg:hidden text-white/60 hover:text-white"
            onClick={(e) => { e.stopPropagation(); setSidebarOpen(false); }}
          >
            <X size={18} />
          </span>
        </button>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const active = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                  ${active ? 'bg-rose-700 text-white shadow-lg shadow-rose-700/30' : 'text-white/60 hover:text-white hover:bg-white/10'}
                `}
              >
                {item.icon}
                <span>{item.label}</span>
                {active && <ChevronRight size={15} className="ml-auto" />}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-6">
          <div className="bg-white/5 rounded-xl p-4 mb-3">
            <p className="text-white/50 text-xs font-medium">Logged in as</p>
            <p className="text-white text-sm font-semibold mt-0.5 truncate">{adminEmail}</p>
          </div>
          <button
            onClick={onBackToSite}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all mb-1"
          >
            <Heart size={18} />
            <span>Back to Home</span>
          </button>
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white hover:bg-white/10 transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <div className="flex items-center gap-3">
              <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
                <Menu size={22} />
              </button>
              <div>
                <h1 className="text-base font-bold text-navy-900 font-serif">{activeLabel}</h1>
                <p className="text-xs text-gray-400 hidden sm:block">Navjeevan Clinic &rsaquo; {activeLabel}</p>
              </div>
            </div>
            <div className="w-9 h-9 bg-rose-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
