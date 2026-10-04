export type AppPage =
  | 'home'
  | 'services'
  | 'about'
  | 'contact'
  | 'booking'
  | 'dashboard'
  | 'admin';

export interface Service {
  id: string;
  name: string;
  description: string;
  benefit: string;
  category: 'obstetrics' | 'gynaecology' | 'surgical' | 'preventive' | 'wellness';
  hospitalBased?: boolean;
  icon: string;
  videoUrl?: string;
}

export interface Appointment {
  id: string;
  patient_id?: string;
  patient_name: string;
  patient_phone: string;
  patient_email?: string;
  service: string;
  preferred_date: string;
  appointment_time?: string;
  appointment_type?: 'clinic' | 'video';
  meeting_link?: string | null;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  doctor_id?: string;
  reschedule_count?: number;
  rescheduled_at?: string | null;
  original_date?: string;
  original_time?: string;
  doctor_name?: string;
  doctor_specialization?: string;
  consultation_reason?: string;
  created_at: string;
}

export interface Review {
  id: string;
  patient_id?: string;
  appointment_id?: string;
  patient_name: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface PatientProfile {
  id: string;
  full_name: string;
  phone?: string;
  email?: string;
  age?: number;
  address?: {
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
  };
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// Doctor dashboard types (clinic management side)
// `ClinicAppointment` is the doctor-managed visit record, stored in the
// `clinic_appointments` table — distinct from `Appointment` above, which is
// the public booking request submitted by patients from the main site.
// ─────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  age: number | null;
  gender?: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  photo_url: string | null;
  medical_history: string | null;
  current_medicines: string | null;
  notes: string | null;
  last_visit: string | null;
  created_at: string;
}

export interface ClinicAppointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  appointment_type: 'clinic' | 'video';
  service_name: string | null;
  status: string;
  created_at: string;
  patient?: Patient;
  reschedule_count?: number;
  original_date?: string;
  original_time?: string;
}

export interface Medicine {
  name: string;
  morning: boolean;
  afternoon: boolean;
  night: boolean;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  appointment_id?: string;
  diagnosis: string | null;
  medicines: Medicine[];
  tests_recommended: string | null;
  advice: string | null;
  follow_up_date: string | null;
  created_at: string;
  patient?: Patient;
}

export interface Report {
  id: string;
  patient_id: string;
  type: string;
  title: string | null;
  file_url: string | null;
  notes: string | null;
  created_at: string;
  patient?: Patient;
}

export interface DoctorProfile {
  id: string;
  name: string;
  email?: string | null;
  qualification: string | null;
  experience: string | null;
  specialization: string | null;
  working_hours: string | null;
  consultation_fee: number | null;
  profile_picture: string | null;
  bio: string | null;
  created_at: string;
}

export type ClinicAppointmentStatus = 'Waiting' | 'Confirmed' | 'Completed' | 'Cancelled';

// ─────────────────────────────────────────────────────────────
// Admin panel types (site admin at /admin — distinct from the
// doctor portal at /doctor)
// ─────────────────────────────────────────────────────────────

export type AdminSection = 'overview' | 'appointments' | 'doctor' | 'add-doctor' | 'services';

export interface ClinicService {
  id: string;
  name: string;
  description: string;
  consultation_fee: number;
  duration_minutes: number;
  active: boolean;
  created_at: string;
}

export interface AdminDashboardStats {
  totalPatients: number;
  totalAppointments: number;
  pendingAppointments: number;
  todayAppointments: number;
  totalReviews: number;
  pendingReviews: number;
  totalServices: number;
  activeServices: number;
  totalDoctors?: number;
  activeDoctors?: number;
  completedAppointments?: number;
  cancelledAppointments?: number;
  videoConsultations?: number;
  clinicConsultations?: number;
  medicalRecordsCount?: number;
  prescriptionCount?: number;
  averageRating?: number;
  collectedRevenue?: number;
  completionRate?: number;
  cancellationRate?: number;
  videoShare?: number;
  monthlyAppointments: { month: string; count: number }[];
  monthlyPatients: { month: string; patients: number }[];
  revenuePerMonth: { month: string; revenue: number }[];
  serviceDistribution: { name: string; count: number }[];
  appointmentStatusDistribution: { status: string; count: number }[];
  appointmentTypeDistribution: { type: string; count: number }[];
  paymentStatusDistribution: { status: string; count: number }[];
  patientsByAgeGroup: { ageGroup: string; patients: number }[];
  patientsByCity: { city: string; state?: string; patients: number }[];
  doctorWiseAppointments: { doctor: string; specialization?: string; appointments: number }[];
  recentActivity: {
    id: string;
    text: string;
    sub: string;
    time: string;
    kind: 'appointment' | 'review';
  }[];
}
