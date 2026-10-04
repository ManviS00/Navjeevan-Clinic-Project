import { useState } from 'react';
import { getBackendToken } from '../lib/backendApi';
import { User } from 'lucide-react';
import { useAuth as useSiteAuth } from '../context/AuthContext';
import { AuthProvider, useAuth } from '@/lib/auth';
import { StageProvider } from '@/lib/stage';
import { AccessProvider } from '@/lib/access';
import CompleteProfile from '@/components/CompleteProfile';
import DashboardLayout, { type TabId } from '@/components/DashboardLayout';
import Overview from '@/components/Overview';
import PeriodTracker from '@/components/period/PeriodTracker';
import FertilityTracker from '@/components/fertility/FertilityTracker';
import PregnancyTracker from '@/components/pregnancy/PregnancyTracker';
import WellnessTracker from '@/components/wellness/WellnessTracker';
import HealthTab from '@/components/pregnancy/tabs/HealthTab';
import Bookings from '@/components/dashboard-extra/Bookings';
import ReviewForm from '@/components/dashboard-extra/ReviewForm';
import PatientBooking from '@/components/dashboard-extra/PatientBooking';
import PatientPrescriptions from '@/components/dashboard-extra/PatientPrescriptions';
import type { AppPage } from '../types';

interface DashboardPageProps {
  onNavigate: (page: AppPage) => void;
  onOpenLogin: () => void;
}

function Dashboard({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const [tab, setTab] = useState<TabId>('overview');

  return (
    <DashboardLayout active={tab} onTabChange={setTab} onBackHome={() => onNavigate('home')}>
      {tab === 'overview' && <Overview onNavigate={setTab} />}
      {tab === 'period' && <PeriodTracker />}
      {tab === 'fertility' && <FertilityTracker />}
      {tab === 'pregnancy' && <PregnancyTracker onNavigate={setTab} />}
      {tab === 'wellness' && <WellnessTracker />}
      {tab === 'appointments' && <HealthTab />}
      {tab === 'bookings' && <Bookings onBookAppointment={() => setTab('book-appointment')} />}
      {tab === 'prescriptions' && <PatientPrescriptions />}
      {tab === 'reviews' && <ReviewForm />}
      {tab === 'book-appointment' && <PatientBooking onBack={() => setTab('bookings')} />}
    </DashboardLayout>
  );
}

function TrackerGate({ onNavigate }: { onNavigate: (page: AppPage) => void }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="pt-20 min-h-screen bg-brand-50/30 flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  // `user` here is the tracker's own record. If it's missing (e.g. the
  // tracker backend is briefly unreachable) we don't block the whole page —
  // CompleteProfile only needs `date_of_birth`, which is null until set.
  if (!user) {
    return (
      <div className="pt-20 min-h-screen bg-brand-50/30 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-brand-100 max-w-md w-full">
          <p className="text-gray-500">We couldn't reach your health dashboard right now. Please refresh the page in a moment.</p>
        </div>
      </div>
    );
  }

  if (!user.date_of_birth) return <CompleteProfile />;

  return (
    <AccessProvider>
      <StageProvider>
        <Dashboard onNavigate={onNavigate} />
      </StageProvider>
    </AccessProvider>
  );
}

export default function DashboardPage({ onNavigate, onOpenLogin }: DashboardPageProps) {
  const { user: siteUser, loading: siteLoading } = useSiteAuth();
  const backendUserRaw = localStorage.getItem('navjeevan_backend_user');
  let backendUser: { role?: string } | null = null;
  try { backendUser = backendUserRaw ? JSON.parse(backendUserRaw) : null; } catch { backendUser = null; }
  const hasBackendPatientSession = !!getBackendToken() && backendUser?.role === 'patient';
  const isAuthenticatedPatient = !!siteUser || hasBackendPatientSession;

  // Logged-out visitors see the same "please log in" prompt as before,
  // using the site's own login modal — no separate tracker login screen.
  if (!siteLoading && !isAuthenticatedPatient) {
    return (
      <div className="pt-20 min-h-screen bg-cream-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl p-10 text-center shadow-lg border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-5">
            <User size={28} className="text-rose-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-gray-800 mb-2">My Account</h2>
          <p className="text-gray-500 mb-6">Log in to view your health dashboard, appointments, and account settings.</p>
          <button
            onClick={onOpenLogin}
            className="w-full py-3.5 bg-rose-700 text-white rounded-xl font-semibold hover:bg-rose-800 transition-colors mb-3"
          >
            Log In to Continue
          </button>
          <button
            onClick={() => onNavigate('booking')}
            className="w-full py-3 text-rose-700 border border-rose-200 rounded-xl font-medium text-sm hover:bg-rose-50 transition-colors"
          >
            Book Without an Account
          </button>
        </div>
      </div>
    );
  }

  if (siteLoading) {
    return (
      <div className="pt-20 min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-gray-400">Loading…</div>
      </div>
    );
  }

  return (
    <AuthProvider>
      <TrackerGate onNavigate={onNavigate} />
    </AuthProvider>
  );
}
