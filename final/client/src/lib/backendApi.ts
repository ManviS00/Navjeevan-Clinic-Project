const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';
const TOKEN_KEY = 'navjeevan_backend_token';

export function getBackendToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setBackendToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearBackendToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function backendRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getBackendToken();
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const text = await response.text();
  let payload: any = {};
  try { payload = text ? JSON.parse(text) : {}; } catch { payload = { message: text }; }

  if (!response.ok) {
    if (response.status === 401) {
      // Do not leave the application in a half-authenticated state when a JWT
      // has expired or was generated with a different server secret.
      clearBackendToken();
      localStorage.removeItem('navjeevan_backend_user');
      window.dispatchEvent(new CustomEvent('navjeevan:auth-expired'));
    }
    throw new Error(payload.message || payload.error || `Request failed (${response.status})`);
  }
  return payload as T;
}

export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'patient' | 'doctor' | 'admin';
  date_of_birth?: string | null;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: BackendUser;
}

export async function backendLogin(identifier: string, password: string) {
  return backendRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });
}

export async function sendBackendOTP(email: string, phone: string) {
  return backendRequest<{ success: boolean; message: string; delivery: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email, phone, delivery: 'email' }),
  });
}

export async function verifyBackendOTP(email: string, phone: string, otp: string) {
  return backendRequest<{ success: boolean; message: string }>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, phone, otp }),
  });
}

export async function registerBackendPatient(data: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  gender?: 'Male' | 'Female' | 'Other';
  address?: { city?: string; state?: string; country?: string; pincode?: string };
  notificationPreference?: 'email';
}) {
  return backendRequest<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export interface BackendService {
  _id: string;
  name: string;
  description?: string;
  consultationFee: number;
  duration: number;
  consultationType: { clinic: boolean; video: boolean };
  isActive: boolean;
}

export interface BackendDoctor {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  qualification: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  registrationNumber: string;
  bio?: string;
  profileImage?: string;
  availableDays: string[];
  availableSlots: string[];
  status: boolean;
  isDeleted: boolean;
}

export interface AppointmentAvailability {
  doctorId: string;
  date: string;
  day: string;
  availableSlots: string[];
}

export interface BackendAppointment {
  _id: string;
  appointmentNumber: string;
  patient: string | { _id: string; fullName: string; phone: string; email: string };
  doctor: BackendDoctor | string;
  service: BackendService | string;
  appointmentDate: string;
  timeSlot: string;
  appointmentType: 'clinic' | 'video';
  hasPreviousMedicalRecords: boolean;
  consultationReason: string;
  notes: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  rescheduleCount?: number;
  createdAt?: string;
}

export async function getActiveServices() {
  const result = await backendRequest<{ success: boolean; data: BackendService[] }>('/services');
  return result.data ?? [];
}

export async function getDoctors() {
  const result = await backendRequest<{ success: boolean; doctors: BackendDoctor[] }>('/doctors');
  return result.doctors ?? [];
}

export async function getVideoAccess(appointmentId: string) {
  return backendRequest<{ success: boolean; data: { appointmentId: string; meetingLink: string; meetingStatus: string; appointmentDate: string; timeSlot: string } }>(`/appointments/${encodeURIComponent(appointmentId)}/video-access`);
}

export async function getDoctorAvailability(doctorId: string, date: string) {
  const result = await backendRequest<{ success: boolean; data: AppointmentAvailability }>(
    `/appointments/availability/${encodeURIComponent(doctorId)}?date=${encodeURIComponent(date)}`
  );
  return result.data;
}

export async function rescheduleBackendAppointment(appointmentId: string, appointmentDate: string, timeSlot: string) {
  const result = await backendRequest<{ success: boolean; data: BackendAppointment }>(`/appointments/${encodeURIComponent(appointmentId)}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ appointmentDate, timeSlot }),
  });
  return result.data;
}

export async function cancelBackendAppointment(appointmentId: string, reason = 'Payment option was not selected.') {
  const result = await backendRequest<{ success: boolean; data: BackendAppointment }>(`/appointments/${encodeURIComponent(appointmentId)}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
  return result.data;
}

export async function createBackendAppointment(data: {
  doctorId: string;
  serviceId: string;
  appointmentDate: string;
  timeSlot: string;
  appointmentType: 'clinic' | 'video';
  consultationReason: string;
  hasPreviousMedicalRecords?: boolean;
  notes?: string;
}) {
  const result = await backendRequest<{ success: boolean; message: string; data: BackendAppointment }>('/appointments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.data;
}

export async function uploadAppointmentMedicalRecord(appointmentId: string, file: File) {
  const formData = new FormData();
  formData.append('medicalRecord', file);
  formData.append('appointmentId', appointmentId);
  formData.append('recordType', 'other');
  formData.append('title', file.name);
  formData.append('description', 'Previous medical record uploaded during video consultation booking.');
  return backendRequest<{ success: boolean; message: string; data: any }>('/medical-records/upload', {
    method: 'POST',
    body: formData,
  });
}
