import { useEffect, useState } from 'react';
import AdminLayout from '../components/admin/AdminLayout';
import AdminOverview from '../components/admin/AdminOverview';
import AdminAppointmentsReviews from '../components/admin/AdminAppointmentsReviews';
import AdminDoctorProfile from '../components/admin/AdminDoctorProfile';
import AddDoctor from '../components/admin/AddDoctor';
import AdminServices from '../components/admin/AdminServices';
import type { AppPage, AdminSection } from '../types';
import { getBackendToken } from '../lib/backendApi';
import { useAuth as useSiteAuth } from '../context/AuthContext';

interface AdminPageProps { onNavigate: (page: AppPage) => void; }

export default function AdminPage({ onNavigate }: AdminPageProps) {
  const [section, setSection] = useState<AdminSection>('overview');
  const { signOut: siteSignOut } = useSiteAuth();
  const [user, setUser] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem('navjeevan_backend_user') || 'null'); } catch { return null; }
  });

  useEffect(() => {
    if (!getBackendToken() || user?.role !== 'admin') {
      window.location.href = '/?auth=login';
      return;
    }

    const handleAuthExpired = () => {
      window.location.href = '/?auth=login';
    };
    window.addEventListener('navjeevan:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('navjeevan:auth-expired', handleAuthExpired);
  }, [user]);

  async function logout() {
    await siteSignOut();
    setUser(null);
    onNavigate('home');
  }

  if (!getBackendToken() || user?.role !== 'admin') return null;

  return (
    <AdminLayout
      activeSection={section}
      onSectionChange={setSection}
      adminEmail={user.email}
      onSignOut={logout}
      onBackToSite={() => onNavigate('home')}
    >
      {section === 'overview' && <AdminOverview />}
      {section === 'appointments' && <AdminAppointmentsReviews />}
      {section === 'doctor' && <AdminDoctorProfile />}
      {section === 'add-doctor' && <AddDoctor onCreated={() => setSection('doctor')} />}
      {section === 'services' && <AdminServices />}
    </AdminLayout>
  );
}
