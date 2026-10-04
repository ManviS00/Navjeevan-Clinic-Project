import { backendRequest } from '@/lib/backendApi';
import type { Patient, ClinicAppointment, Prescription, Report, DoctorProfile, Medicine } from '@/types';


function absoluteFileUrl(fileUrl: string | null): string | null {
  if (!fileUrl) return null;
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const api = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';
  const base = api.replace(/\/api\/?$/, '');
  return `${base}/${fileUrl.replace(/^\//, '')}`;
}

function calculateAge(dateOfBirth: unknown): number | null {
  if (!dateOfBirth) return null;
  const dob = new Date(String(dateOfBirth));
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday = today.getMonth() < dob.getMonth() || (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
}

function mapPatient(p: any): Patient {
  const calculatedAge = calculateAge(p.dateOfBirth ?? p.date_of_birth ?? p.dob);
  return {
    id: String(p.id ?? p._id),
    name: p.name ?? p.fullName ?? 'Patient',
    age: p.age === null || p.age === undefined || p.age === '' ? calculatedAge : Number(p.age),
    gender: p.gender ?? '',
    phone: p.phone ?? null,
    email: p.email ?? null,
    address: p.address ?? null,
    photo_url: absoluteFileUrl(p.photo_url ?? p.profileImage ?? null),
    medical_history: p.medical_history ?? null,
    current_medicines: p.current_medicines ?? null,
    notes: p.notes ?? null,
    last_visit: p.last_visit ?? null,
    created_at: p.created_at ?? p.createdAt ?? new Date().toISOString(),
  };
}

function mapAppointment(a: any): ClinicAppointment {
  return {
    id: String(a._id ?? a.id),
    patient_id: String(a.patient?._id ?? a.patient?.id ?? a.patient),
    appointment_date: a.appointmentDate ?? a.appointment_date,
    appointment_time: a.timeSlot ?? a.appointment_time ?? '',
    reason: a.consultationReason ?? a.reason ?? null,
    appointment_type: a.appointmentType === 'video' ? 'video' : 'clinic',
    service_name: a.service?.name ?? null,
    status: a.status,
    reschedule_count: Number(a.rescheduleCount ?? 0),
    original_date: a.originalAppointmentDate ?? '',
    original_time: a.originalTimeSlot ?? '',
    created_at: a.createdAt ?? a.created_at ?? new Date().toISOString(),
    patient: a.patient ? mapPatient(a.patient) : undefined,
  };
}

export async function getPatients(): Promise<Patient[]> {
  const data = await backendRequest<any[]>('/doctor-patients');
  return data.map(mapPatient);
}

export async function getPatient(id: string): Promise<Patient | null> {
  try { return mapPatient(await backendRequest<any>(`/doctor-patients/${id}`)); }
  catch { return null; }
}

export async function createPatient(p: Omit<Patient, 'id' | 'created_at'>): Promise<Patient> {
  const data = await backendRequest<any>('/doctor-patients', {
    method: 'POST',
    body: JSON.stringify(p),
  });
  return mapPatient(data);
}

export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
  const data = await backendRequest<any>(`/doctor-patients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return mapPatient(data);
}

export async function deletePatient(id: string): Promise<void> {
  await backendRequest(`/doctor-patients/${id}`, { method: 'DELETE' });
}

export async function getAppointments(): Promise<ClinicAppointment[]> {
  const result = await backendRequest<any>('/appointments');
  const data = result.data ?? [];
  return data.map(mapAppointment);
}

export async function createAppointment(a: any): Promise<ClinicAppointment> {
  const result = await backendRequest<any>('/appointments', { method: 'POST', body: JSON.stringify(a) });
  return mapAppointment(result.data ?? result);
}

export async function updateAppointment(id: string, updates: Partial<ClinicAppointment>): Promise<ClinicAppointment> {
  const result = await backendRequest<any>(`/appointments/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: updates.status }),
  });
  return mapAppointment(result.data ?? result);
}

export async function deleteAppointment(id: string): Promise<void> {
  await backendRequest(`/appointments/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason: 'Deleted by staff' }) });
}

function mapPrescription(p: any): Prescription {
  return {
    id: String(p._id ?? p.id),
    patient_id: String(p.patient?._id ?? p.patient?.id ?? p.patient),
    diagnosis: p.diagnosis ?? null,
    medicines: (p.medicines ?? []).map((m: any) => ({
      name: m.medicineName ?? m.name ?? '',
      morning: /morning|1.*day|once/i.test(`${m.frequency ?? ''}`),
      afternoon: /afternoon|noon|twice|2.*day/i.test(`${m.frequency ?? ''}`),
      night: /night|bedtime|evening/i.test(`${m.frequency ?? ''}`),
      dosage: m.dosage ?? '', frequency: m.frequency ?? '', duration: m.duration ?? '', instructions: m.instructions ?? '',
    })),
    tests_recommended: (p.recommendedTests ?? []).join(', '),
    advice: p.advice ?? null,
    follow_up_date: p.followUpDate ?? null,
    created_at: p.createdAt ?? p.created_at ?? new Date().toISOString(),
    patient: p.patient ? mapPatient(p.patient) : undefined,
  };
}

export async function getPrescriptions(): Promise<Prescription[]> {
  const result = await backendRequest<any>('/prescriptions');
  return (result.data ?? []).map(mapPrescription);
}
export async function getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
  const result = await backendRequest<any>(`/prescriptions/patient/${patientId}`);
  return (result.data ?? []).map(mapPrescription);
}
export async function createPrescription(p: Omit<Prescription, 'id' | 'created_at' | 'patient'> & { medicines: Array<Medicine & { medicineName?: string }> }): Promise<Prescription> {
  const result = await backendRequest<any>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify({
      appointmentId: (p as any).appointment_id ?? (p as any).appointment,
      patient: p.patient_id,
      diagnosis: p.diagnosis,
      medicines: p.medicines,
      recommendedTests: p.tests_recommended ? String(p.tests_recommended).split(',').map(s => s.trim()).filter(Boolean) : [],
      advice: p.advice ?? '',
      followUpDate: p.follow_up_date ?? null,
    }),
  });
  return mapPrescription(result.data ?? result);
}

export async function getReports(): Promise<Report[]> {
  const result = await backendRequest<any>('/medical-records');
  return (result.data ?? []).map((r: any) => ({
    id: String(r._id ?? r.id),
    patient_id: String(r.patient?._id ?? r.patient?.id ?? r.patient),
    type: r.recordType ?? 'other',
    title: r.title ?? null,
    file_url: absoluteFileUrl(r.fileUrl ?? null),
    notes: r.description ?? null,
    created_at: r.createdAt ?? r.created_at ?? new Date().toISOString(),
    patient: r.patient ? mapPatient(r.patient) : undefined,
  }));
}
export async function getReportsByPatient(patientId: string): Promise<Report[]> {
  const result = await backendRequest<any>(`/medical-records?patientId=${encodeURIComponent(patientId)}`);
  return (result.data ?? []).map((r: any) => ({
    id: String(r._id ?? r.id),
    patient_id: String(r.patient?._id ?? r.patient?.id ?? r.patient),
    type: r.recordType ?? 'other',
    title: r.title ?? null,
    file_url: absoluteFileUrl(r.fileUrl ?? null),
    notes: r.description ?? null,
    created_at: r.createdAt ?? r.created_at ?? new Date().toISOString(),
    patient: r.patient ? mapPatient(r.patient) : undefined,
  }));
}
export async function createReport(_r: any): Promise<Report> {
  throw new Error('Medical reports must be uploaded through the medical-record upload form.');
}
export async function deleteReport(id: string): Promise<void> {
  await backendRequest(`/medical-records/${id}`, { method: 'DELETE' });
}

export async function getDoctorProfile(): Promise<DoctorProfile | null> {
  const result = await backendRequest<any>('/doctors/me');
  const d = result.doctor ?? result.data ?? result;
  if (!d) return null;
  return {
    id: String(d._id ?? d.id),
    name: d.fullName ?? d.name,
    email: d.email ?? null,
    qualification: d.qualification ?? null,
    experience: d.experience != null ? String(d.experience) : null,
    specialization: d.specialization ?? null,
    working_hours: d.availableDays?.length ? `${d.availableDays.join(', ')}` : null,
    consultation_fee: d.consultationFee ?? null,
    profile_picture: d.profileImage ?? null,
    bio: d.bio ?? null,
    created_at: d.createdAt ?? new Date().toISOString(),
  };
}

export async function updateDoctorProfile(id: string, updates: Partial<DoctorProfile>): Promise<DoctorProfile> {
  const body = {
    fullName: updates.name,
    qualification: updates.qualification,
    experience: updates.experience ? Number(String(updates.experience).replace(/\D/g, '')) : undefined,
    specialization: updates.specialization,
    consultationFee: updates.consultation_fee ?? undefined,
    bio: updates.bio,
    availableDays: updates.working_hours ? String(updates.working_hours).split(',').map((v) => v.trim()).filter(Boolean) : undefined,
  };
  const result = await backendRequest<any>(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(body) });
  const d = result.doctor ?? result.data ?? result;
  return {
    id: String(d._id ?? d.id),
    name: d.fullName ?? d.name,
    email: d.email ?? null,
    qualification: d.qualification ?? null,
    experience: d.experience != null ? String(d.experience) : null,
    specialization: d.specialization ?? null,
    working_hours: d.availableDays?.length ? d.availableDays.join(', ') : null,
    consultation_fee: d.consultationFee ?? null,
    profile_picture: d.profileImage ?? null,
    bio: d.bio ?? null,
    created_at: d.createdAt ?? new Date().toISOString(),
  };
}
