import { backendRequest } from '@/lib/backendApi';
import type { Appointment, Review, ClinicService, AdminDashboardStats } from '@/types';

function mapAppointment(a: any): Appointment {
  return {
    id: String(a._id ?? a.id),
    patient_id: a.patient?._id ?? a.patient?.id,
    patient_name: a.patient?.fullName ?? 'Patient',
    patient_phone: a.patient?.phone ?? '',
    patient_email: a.patient?.email ?? '',
    service: a.service?.name ?? 'Service',
    preferred_date: a.appointmentDate ?? '',
    appointment_time: a.timeSlot ?? '',
    notes: a.notes ?? a.consultationReason ?? '',
    consultation_reason: a.consultationReason ?? '',
    appointment_type: a.appointmentType === 'video' ? 'video' : 'clinic',
    doctor_id: a.doctor?._id ?? a.doctor?.id ?? a.doctor,
    doctor_name: a.doctor?.fullName ?? '',
    doctor_specialization: a.doctor?.specialization ?? '',
    reschedule_count: Number(a.rescheduleCount ?? 0),
    rescheduled_at: a.rescheduledAt ?? null,
    original_date: a.originalAppointmentDate ?? '',
    original_time: a.originalTimeSlot ?? '',
    status: a.status,
    created_at: a.createdAt ?? a.created_at ?? new Date().toISOString(),
  };
}

function mapService(s: any): ClinicService {
  return {
    id: String(s._id ?? s.id),
    name: s.name,
    description: s.description ?? '',
    consultation_fee: Number(s.consultationFee ?? s.consultation_fee ?? 0),
    duration_minutes: Number(s.duration ?? s.duration_minutes ?? 0),
    active: Boolean(s.isActive ?? s.active),
    created_at: s.createdAt ?? s.created_at ?? new Date().toISOString(),
  };
}

export async function getAdminAppointments(): Promise<Appointment[]> {
  const result = await backendRequest<any>('/appointments');
  return (result.data ?? []).map(mapAppointment);
}

export async function updateAppointmentStatus(id: string, status: Appointment['status']): Promise<void> {
  if (status === 'cancelled') {
    await backendRequest(`/appointments/${id}/cancel`, { method: 'PATCH', body: JSON.stringify({ reason: 'Cancelled by admin' }) });
  } else {
    await backendRequest(`/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
  }
}

export async function getAdminReviews(): Promise<Review[]> {
  const result = await backendRequest<any>('/reviews');
  return (result.data ?? []).map((r: any) => ({
    id: String(r._id ?? r.id),
    patient_id: r.patient?._id ?? r.patient_id,
    appointment_id: r.appointment?._id ?? r.appointment_id,
    patient_name: r.patient?.fullName ?? r.patientName ?? 'Patient',
    rating: Number(r.rating ?? 0),
    comment: r.comment ?? '',
    status: r.status ?? 'pending',
    created_at: r.createdAt ?? r.created_at ?? new Date().toISOString(),
  }));
}
export async function updateReviewStatus(id: string, status: Review['status']): Promise<void> {
  await backendRequest(`/reviews/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

export async function getServices(): Promise<ClinicService[]> {
  const result = await backendRequest<any>('/services/all');
  return (result.data ?? []).map(mapService);
}
export async function createService(s: Omit<ClinicService, 'id' | 'created_at'>): Promise<ClinicService> {
  const result = await backendRequest<any>('/services', {
    method: 'POST',
    body: JSON.stringify({
      name: s.name,
      description: s.description,
      consultationFee: s.consultation_fee,
      duration: s.duration_minutes,
      isActive: s.active,
    }),
  });
  return mapService(result.data ?? result);
}
export async function updateService(id: string, updates: Partial<Omit<ClinicService, 'id' | 'created_at'>>): Promise<ClinicService> {
  const result = await backendRequest<any>(`/services/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      ...(updates.name !== undefined ? { name: updates.name } : {}),
      ...(updates.description !== undefined ? { description: updates.description } : {}),
      ...(updates.consultation_fee !== undefined ? { consultationFee: updates.consultation_fee } : {}),
      ...(updates.duration_minutes !== undefined ? { duration: updates.duration_minutes } : {}),
      ...(updates.active !== undefined ? { isActive: updates.active } : {}),
    }),
  });
  return mapService(result.data ?? result);
}
export async function deleteService(id: string): Promise<void> {
  await backendRequest(`/services/${id}`, { method: 'DELETE' });
}

export async function getDashboardStats(year?: number): Promise<AdminDashboardStats> {
  const query = year ? `?year=${year}` : '';
  const result = await backendRequest<any>(`/dashboard/admin${query}`);
  const d = result.data ?? {};
  const c = d.cards ?? {};
  const charts = d.charts ?? {};
  const recent = d.tables?.recentAppointments ?? [];
  return {
    totalPatients: Number(c.totalPatients ?? 0),
    totalDoctors: Number(c.totalDoctors ?? 0),
    activeDoctors: Number(c.activeDoctors ?? 0),
    totalAppointments: Number(c.totalAppointments ?? 0),
    pendingAppointments: Number(c.pendingAppointments ?? 0),
    todayAppointments: Number(c.todayAppointments ?? 0),
    totalReviews: Number(c.totalReviews ?? 0),
    pendingReviews: Number(c.pendingReviews ?? 0),
    totalServices: Number(c.totalServices ?? 0),
    activeServices: Number(c.activeServices ?? 0),
    completedAppointments: Number(c.completedAppointments ?? 0),
    cancelledAppointments: Number(c.cancelledAppointments ?? 0),
    videoConsultations: Number(c.videoConsultations ?? 0),
    clinicConsultations: Number(c.clinicConsultations ?? 0),
    medicalRecordsCount: Number(c.medicalRecordsCount ?? 0),
    prescriptionCount: Number(c.prescriptionCount ?? 0),
    averageRating: Number(c.averageRating ?? 0),
    collectedRevenue: Number(c.collectedRevenue ?? 0),
    completionRate: Number(c.completionRate ?? 0),
    cancellationRate: Number(c.cancellationRate ?? 0),
    videoShare: Number(c.videoShare ?? 0),
    monthlyAppointments: (charts.appointmentsPerMonth ?? []).map((x: any) => ({ month: x.month ?? x.label ?? '', count: Number(x.appointments ?? x.count ?? 0) })),
    serviceDistribution: (charts.mostBookedServices ?? []).map((x: any) => ({ name: x.name ?? x.service ?? '', count: Number(x.appointments ?? x.count ?? 0) })),
    monthlyPatients: (charts.patientsPerMonth ?? []).map((x: any) => ({ month: x.month ?? '', patients: Number(x.patients ?? 0) })),
    revenuePerMonth: (charts.revenuePerMonth ?? []).map((x: any) => ({ month: x.month ?? '', revenue: Number(x.revenue ?? 0) })),
    appointmentStatusDistribution: (charts.appointmentStatusDistribution ?? []).map((x: any) => ({ status: x.status ?? '', count: Number(x.count ?? 0) })),
    appointmentTypeDistribution: (charts.appointmentTypeDistribution ?? []).map((x: any) => ({ type: x.type ?? '', count: Number(x.count ?? 0) })),
    paymentStatusDistribution: (charts.paymentStatusDistribution ?? []).map((x: any) => ({ status: x.status ?? '', count: Number(x.count ?? 0) })),
    patientsByAgeGroup: (charts.patientsByAgeGroup ?? []).map((x: any) => ({ ageGroup: x.ageGroup ?? '', patients: Number(x.patients ?? 0) })),
    doctorWiseAppointments: (charts.doctorWiseAppointments ?? []).map((x: any) => ({ doctor: x.doctor ?? 'Doctor', specialization: x.specialization ?? '', appointments: Number(x.appointments ?? 0) })),
    patientsByCity: (charts.patientsByCity ?? []).map((x: any) => ({ city: x.city ?? '', state: x.state ?? '', patients: Number(x.patients ?? 0) })),
    recentActivity: recent.slice(0, 6).map((a: any) => ({
      id: String(a._id ?? a.id ?? a.appointmentNumber),
      text: `${a.appointmentNumber ?? 'Appointment'} · ${a.status ?? ''}`,
      sub: `${a.patientName ?? 'Patient'} · ${a.serviceName ?? 'Service'}`,
      time: `${a.appointmentDate ?? ''}${a.timeSlot ? ` · ${a.timeSlot}` : ''}`,
      kind: 'appointment' as const,
    })),
  };
}
