import { Routes, Route, Navigate } from 'react-router-dom';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import PatientsPage from './pages/doctor/PatientsPage';
import PatientProfilePage from './pages/doctor/PatientProfilePage';
import AddPatientPage from './pages/doctor/AddPatientPage';
import AppointmentsPage from './pages/doctor/AppointmentsPage';
import PrescriptionsPage from './pages/doctor/PrescriptionsPage';
import PrescriptionFormPage from './pages/doctor/PrescriptionFormPage';
import ReportsPage from './pages/doctor/ReportsPage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';
import PlaceholderPage from './pages/doctor/PlaceholderPage';
import VideoConsultationPage from './pages/doctor/VideoConsultationPage';
import WhatsAppReminderPage from './pages/doctor/WhatsAppReminderPage';
import { getBackendToken } from './lib/backendApi';
import DoctorLoginPage from './pages/doctor/DoctorLoginPage';

function Guard() {
  const token = getBackendToken();
  let user: { role?: string } | null = null;
  try { user = JSON.parse(localStorage.getItem('navjeevan_backend_user') || 'null'); } catch { user = null; }
  if (!token || user?.role !== 'doctor') return <Navigate to="/?auth=login" replace />;
  return (
    <div className="doctor-portal">
      <Routes>
        <Route index element={<DoctorDashboard />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/new" element={<AddPatientPage />} />
        <Route path="patients/:id" element={<PatientProfilePage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
        <Route path="prescriptions" element={<PrescriptionsPage />} />
        <Route path="prescriptions/new" element={<PrescriptionFormPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="profile" element={<DoctorProfilePage />} />
        <Route path="video" element={<VideoConsultationPage />} />
        <Route path="messages" element={<WhatsAppReminderPage />} />
        <Route path="*" element={<Navigate to="/doctor" replace />} />
      </Routes>
    </div>
  );
}

export default function DoctorApp() {
  return (
    <Routes>
      <Route path="login" element={<DoctorLoginPage />} />
      <Route path="*" element={<Guard />} />
    </Routes>
  );
}
