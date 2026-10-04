import { useState, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { useStage } from '@/lib/stage';
import { useAccess } from '@/lib/access';
import { Activity, Baby, Sparkles, LogOut, CalendarDays, Flower, Lock, Stethoscope, Calendar, Star, House, PlusCircle, FileText } from 'lucide-react';
import AccountPanel from '@/components/AccountPanel';

export type TabId = 'overview' | 'period' | 'fertility' | 'pregnancy' | 'wellness' | 'appointments' | 'health' | 'bookings' | 'prescriptions' | 'reviews' | 'book-appointment';

interface NavItem {
  id: TabId;
  label: string;
  icon: typeof Activity;
}

const NAV: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: CalendarDays },
  { id: 'period', label: 'Period', icon: Activity },
  { id: 'fertility', label: 'Get Pregnant', icon: Flower },
  { id: 'pregnancy', label: 'Pregnancy', icon: Baby },
  { id: 'wellness', label: 'Wellness', icon: Sparkles },
  { id: 'appointments', label: 'Health Log', icon: Stethoscope },
  { id: 'bookings', label: 'My Bookings', icon: Calendar },
  { id: 'prescriptions', label: 'My Prescriptions', icon: FileText },
  { id: 'reviews', label: 'Leave a Review', icon: Star },
  { id: 'book-appointment', label: 'Book Appointment', icon: PlusCircle },
];

export default function DashboardLayout({
  active,
  onTabChange,
  onBackHome,
  children,
}: {
  active: TabId;
  onTabChange: (t: TabId) => void;
  onBackHome: () => void;
  children: ReactNode;
}) {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    onBackHome();
  }
  const { isPregnant } = useStage();
  const { access } = useAccess();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  function isDisabled(id: TabId): boolean {
    if (id === 'period' && (!access.period || isPregnant)) return true;
    if (id === 'fertility' && (!access.fertility || isPregnant)) return true;
    if (id === 'pregnancy' && !access.pregnancy && !isPregnant) return true;
    return false;
  }

  return (
    <div className="min-h-screen bg-brand-50/30 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-brand-100 flex flex-col z-40 transition-transform ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2 px-4 h-16 border-b border-brand-100">
          <button onClick={() => onTabChange('overview')} className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white border border-brand-100 overflow-hidden flex items-center justify-center flex-shrink-0">
              <img src="/navjeevan-logo.jpeg" alt="Navjeevan Clinic logo" className="w-full h-full object-contain" />
            </div>
            <span className="text-xl font-bold text-gray-900 truncate">Navjeevan Clinic</span>
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {NAV.map((item) => {
            const isActive = active === item.id;
            const disabled = isDisabled(item.id);
            return (
              <button
                key={item.id}
                onClick={() => { if (!disabled) { onTabChange(item.id); setMobileOpen(false); } }}
                disabled={disabled}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
                    : disabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-brand-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {disabled && <Lock className="w-3.5 h-3.5 text-gray-300" />}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-brand-100">
          <button onClick={onBackHome} className="w-full flex items-center gap-2 px-4 py-2.5 mb-2 rounded-xl text-brand-700 bg-brand-50 hover:bg-brand-100 transition text-sm font-semibold">
            <House className="w-4 h-4" />
            Back to Home
          </button>
          <button
            onClick={() => setAccountOpen(true)}
            className="w-full flex items-center gap-3 px-2 py-2 mb-2 rounded-xl hover:bg-brand-50 transition text-left"
          >
            <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-semibold">
              {(user?.email ?? '?')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">{user?.email}</p>
              <p className="text-xs text-gray-400">View account</p>
            </div>
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 transition text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-black/20 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-16 bg-white border-b border-brand-100 sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <button onClick={() => onTabChange('overview')} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white border border-brand-100 overflow-hidden flex items-center justify-center">
                <img src="/navjeevan-logo.jpeg" alt="Navjeevan Clinic logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-lg font-bold text-gray-900">Navjeevan Clinic</span>
            </button>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg hover:bg-brand-50"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>

      {accountOpen && <AccountPanel onClose={() => setAccountOpen(false)} />}
    </div>
  );
}
