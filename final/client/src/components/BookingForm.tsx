import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Clock, Lock, Upload, FileText } from 'lucide-react';
import PaymentModal from './PaymentModal';
import { useAuth } from '../context/AuthContext';
import { SERVICES } from '../data/services';
import {
  createBackendAppointment,
  cancelBackendAppointment,
  getBackendToken,
  getDoctorAvailability,
  getDoctors,
  getActiveServices,
  uploadAppointmentMedicalRecord,
  type BackendDoctor,
  type BackendService,
} from '../lib/backendApi';

interface BookingFormProps {
  preselectedService?: string;
  onOpenLogin?: () => void;
}

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  date: string;
  doctorId: string;
  serviceId: string;
  timeSlot: string;
  appointmentType: 'clinic' | 'video';
  consultationReason: string;
  hasPreviousMedicalRecords: boolean;
  notes: string;
}

interface BookingResult {
  appointmentNumber: string;
  date: string;
  timeSlot: string;
  doctorName: string;
  serviceName: string;
  appointmentType: 'clinic' | 'video';
}

const INITIAL: FormData = {
  fullName: '',
  phone: '',
  email: '',
  date: '',
  doctorId: '',
  serviceId: '',
  timeSlot: '',
  appointmentType: 'clinic',
  consultationReason: '',
  hasPreviousMedicalRecords: false,
  notes: '',
};

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BookingForm({ preselectedService, onOpenLogin }: BookingFormProps) {
  const { user, profile } = useAuth();
  const [form, setForm] = useState<FormData>({
    ...INITIAL,
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    email: profile?.email ?? user?.email ?? '',
  });
  const [doctors, setDoctors] = useState<BackendDoctor[]>([]);
  const [services, setServices] = useState<BackendService[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingResult | null>(null);
  const [paymentAppointmentId, setPaymentAppointmentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'paid' | 'pay_at_clinic'>('unpaid');
  const [serverError, setServerError] = useState('');
  const [medicalRecordFile, setMedicalRecordFile] = useState<File | null>(null);

  const backendUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('navjeevan_backend_user') || 'null') as {
        fullName?: string;
        phone?: string;
        email?: string;
        role?: string;
      } | null;
    } catch {
      return null;
    }
  }, []);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayString = today.toISOString().split('T')[0];
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 14);
  const maxDateString = maxDate.toISOString().split('T')[0];

  const selectedService = services.find((service) => service._id === form.serviceId);
  const selectedDoctor = doctors.find((doctor) => doctor._id === form.doctorId);
  const isBackendPatient = getBackendToken() && backendUser?.role === 'patient';

  useEffect(() => {
    if (backendUser?.role === 'patient') {
      setForm((current) => ({
        ...current,
        fullName: backendUser.fullName || current.fullName || '',
        phone: backendUser.phone || current.phone || '',
        email: backendUser.email || current.email || '',
      }));
    }
  }, [backendUser]);

  useEffect(() => {
    let cancelled = false;
    async function loadBookingData() {
      setLoadingData(true);
      setServerError('');
      try {
        const [serviceData, doctorData] = await Promise.all([getActiveServices(), getDoctors()]);
        if (cancelled) return;
        // The Home page service catalog is the single source of truth for patient booking.
        // Backend services are still used for real IDs/pricing, but unrelated services
        // are never exposed in the booking form.
        const homeServiceNames = new Set(SERVICES.map((service) => slug(service.name)));
        const orderedServices = serviceData
          .filter((service) => homeServiceNames.has(slug(service.name)))
          .sort((a, b) => {
            const ai = SERVICES.findIndex((service) => slug(service.name) === slug(a.name));
            const bi = SERVICES.findIndex((service) => slug(service.name) === slug(b.name));
            return ai - bi;
          });
        setServices(orderedServices);
        const activeDoctors = doctorData.filter((doctor) => doctor.status && !doctor.isDeleted);
        const primaryDoctor = activeDoctors.find((doctor) => /aayushi\s+pal/i.test(doctor.fullName));
        // The current clinic has only Dr. Aayushi Pal. If an accidental/test doctor
        // is present in the database, do not expose that record to patients.
        // Once additional real doctors are intentionally added alongside Dr. Pal,
        // the normal active-doctor list can be used again.
        const bookableDoctors = primaryDoctor && activeDoctors.length <= 2
          ? (activeDoctors.length === 1 ? activeDoctors : [primaryDoctor])
          : activeDoctors;
        setDoctors(bookableDoctors);
        if (!bookableDoctors.length) {
          setServerError('No active doctor is currently available for online booking.');
        }

        if (preselectedService && orderedServices.length) {
          const match = orderedServices.find(
            (service) => service._id === preselectedService || slug(service.name) === slug(preselectedService),
          );
          if (match) {
            setForm((current) => ({ ...current, serviceId: match._id }));
          }
        }
      } catch (error) {
        if (!cancelled) setServerError((error as Error).message || 'Unable to load doctors and services.');
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    }
    void loadBookingData();
    return () => { cancelled = true; };
  }, [preselectedService]);

  useEffect(() => {
    if (!form.date || !form.doctorId) {
      setAvailableSlots([]);
      return;
    }

    let cancelled = false;
    async function loadSlots() {
      setLoadingSlots(true);
      setErrors((current) => ({ ...current, date: '', timeSlot: '' }));
      try {
        const availability = await getDoctorAvailability(form.doctorId, form.date);
        if (!cancelled) {
          const slots = availability.availableSlots ?? [];
          const now = new Date();
          const todayLocal = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
          const toMinutes = (slot: string) => {
            const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
            if (!match) return null;
            let hours = Number(match[1]);
            const minutes = Number(match[2]);
            if (hours === 12) hours = 0;
            if (match[3].toUpperCase() === 'PM') hours += 12;
            return hours * 60 + minutes;
          };
          const filteredSlots = form.date === todayLocal
            ? slots.filter((slot) => {
                const minutes = toMinutes(slot);
                return minutes === null || minutes > now.getHours() * 60 + now.getMinutes();
              })
            : slots;
          setAvailableSlots(filteredSlots);
          setForm((current) => ({
            ...current,
            timeSlot: filteredSlots.includes(current.timeSlot) ? current.timeSlot : '',
          }));
        }
      } catch (error) {
        if (!cancelled) {
          setAvailableSlots([]);
          setErrors((current) => ({ ...current, date: (error as Error).message || 'Doctor is unavailable on this date.' }));
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    }
    void loadSlots();
    return () => { cancelled = true; };
  }, [form.date, form.doctorId]);

  // Keep the selected consultation type aligned with the service's real capabilities.
  useEffect(() => {
    if (!selectedService) return;
    const { clinic, video } = selectedService.consultationType;
    if (!clinic && video && form.appointmentType !== 'video') {
      setForm((current) => ({ ...current, appointmentType: 'video' }));
    } else if (clinic && !video && form.appointmentType !== 'clinic') {
      setForm((current) => ({ ...current, appointmentType: 'clinic', hasPreviousMedicalRecords: false }));
    } else if (!clinic && !video) {
      setErrors((current) => ({ ...current, serviceId: 'This service currently has no available consultation type.' }));
    }
  }, [selectedService, form.appointmentType]);

  function setField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: '' }));
    setServerError('');
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!isBackendPatient) next.auth = 'Please log in as a patient before booking an appointment.';
    if (!form.fullName.trim()) next.fullName = 'Full name is required.';
    if (!/^\d{10}$/.test(form.phone)) next.phone = 'Enter a valid 10-digit phone number.';
    if (!form.date) next.date = 'Please select an appointment date.';
    if (form.date && (form.date < todayString || form.date > maxDateString)) {
      next.date = 'Appointments can only be booked for today through the next 14 days.';
    }
    if (form.date && new Date(`${form.date}T00:00:00`).getDay() === 0) {
      next.date = 'Navjeevan Clinic is closed on Sundays. Please select Monday to Saturday.';
    }
    if (!form.doctorId) next.doctorId = 'Please select a doctor.';
    if (!form.serviceId) next.serviceId = 'Please select a service.';
    if (!form.timeSlot) next.timeSlot = 'Please select an available time slot.';
    if (!form.appointmentType) next.appointmentType = 'Please select a consultation type.';
    if (form.appointmentType === 'video' && !selectedService?.consultationType.video) {
      next.appointmentType = 'Video consultation is not available for this service.';
    }
    if (form.appointmentType === 'clinic' && selectedService && !selectedService.consultationType.clinic) {
      next.appointmentType = 'Clinic consultation is not available for this service.';
    }
    if (form.appointmentType === 'video' && form.hasPreviousMedicalRecords && !medicalRecordFile) {
      next.medicalRecord = 'Please upload your previous medical record (PDF, PNG or JPG).';
    }
    if (form.consultationReason.trim().length < 10) {
      next.consultationReason = 'Please describe your reason for consultation in at least 10 characters.';
    }
    if (form.consultationReason.trim().length > 1000) {
      next.consultationReason = 'Consultation reason cannot exceed 1000 characters.';
    }
    return next;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setServerError('');
    try {
      const appointment = await createBackendAppointment({
        doctorId: form.doctorId,
        serviceId: form.serviceId,
        appointmentDate: form.date,
        timeSlot: form.timeSlot,
        appointmentType: form.appointmentType,
        consultationReason: form.consultationReason.trim(),
        hasPreviousMedicalRecords: form.appointmentType === 'video' ? form.hasPreviousMedicalRecords : false,
        notes: form.notes.trim(),
      });

      if (form.appointmentType === 'video' && form.hasPreviousMedicalRecords && medicalRecordFile) {
        await uploadAppointmentMedicalRecord(appointment._id, medicalRecordFile);
      }

      setBooking({
        appointmentNumber: appointment.appointmentNumber,
        date: appointment.appointmentDate,
        timeSlot: appointment.timeSlot,
        doctorName: selectedDoctor?.fullName ?? 'Doctor',
        serviceName: selectedService?.name ?? 'Consultation',
        appointmentType: appointment.appointmentType,
      });
      setPaymentAppointmentId(appointment._id);
    } catch (error) {
      setServerError((error as Error).message || 'Unable to book the appointment. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setForm((current) => ({
      ...INITIAL,
      fullName: current.fullName,
      phone: current.phone,
      email: current.email,
      serviceId: current.serviceId,
    }));
    setAvailableSlots([]);
    setErrors({});
    setServerError('');
    setBooking(null);
    setPaymentAppointmentId(null);
    setPaymentStatus('unpaid');
    setMedicalRecordFile(null);
  }

  if (booking) {
    const onlineOnly = booking.appointmentType === 'video';
    const clinicPaymentAllowed = booking.appointmentType === 'clinic';
    const isConfirmed = paymentStatus === 'paid' || paymentStatus === 'pay_at_clinic';

    return (
      <>
        <div className="text-center py-8">
          <div className={`w-16 h-16 rounded-full ${isConfirmed ? 'bg-green-100' : 'bg-amber-100'} flex items-center justify-center mx-auto mb-4`}>
            <CheckCircle size={32} className={isConfirmed ? 'text-green-600' : 'text-amber-600'} />
          </div>
          <h3 className="font-serif text-2xl font-bold text-gray-800 mb-2">
            {isConfirmed ? 'Appointment Confirmed!' : 'Payment Required to Confirm'}
          </h3>
          <p className="text-gray-500 text-sm mb-5">
            {isConfirmed
              ? (paymentStatus === 'paid' ? 'Your payment was verified and your appointment is confirmed.' : 'Your clinic-visit slot is reserved and your appointment is confirmed.')
              : onlineOnly
                ? 'Video consultations require successful online payment before the appointment can be confirmed.'
                : 'Please choose a payment option below. Closing this window without choosing an option will cancel the pending appointment.'}
          </p>
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 text-left max-w-md mx-auto space-y-2 text-sm">
            <div className="flex justify-between gap-4"><span className="text-gray-500">Appointment No.</span><strong>{booking.appointmentNumber}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Doctor</span><strong>{booking.doctorName}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Service</span><strong>{booking.serviceName}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Consultation</span><strong>{booking.appointmentType === 'video' ? 'Video Consultation' : 'Clinic Visit'}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Date</span><strong>{formatDate(booking.date)}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Time</span><strong>{booking.timeSlot}</strong></div>
            <div className="flex justify-between gap-4"><span className="text-gray-500">Payment</span><strong className={isConfirmed ? 'text-green-600' : 'text-amber-600'}>{paymentStatus === 'paid' ? 'Paid & Confirmed' : paymentStatus === 'pay_at_clinic' ? 'Pay at Clinic · Confirmed' : 'Action Required'}</strong></div>
          </div>
          {isConfirmed && (
            <button
              onClick={reset}
              className="mt-6 px-6 py-3 border-2 border-rose-700 text-rose-700 rounded-xl font-semibold text-sm hover:bg-rose-700 hover:text-white transition-all"
            >
              Book Another Appointment
            </button>
          )}
        </div>
        {paymentAppointmentId && (
          <PaymentModal
            appointmentId={paymentAppointmentId}
            patientName={form.fullName}
            service={booking.serviceName}
            preferredDate={booking.date}
            allowOnlinePayment
            allowPayAtClinic={clinicPaymentAllowed}
            onClose={async () => {
              // If the user dismisses the payment modal before choosing any payment method,
              // cancel the pending appointment so it can never look confirmed by accident.
              try {
                await cancelBackendAppointment(paymentAppointmentId, 'Payment option was not selected.');
              } catch (error) {
                setServerError(error instanceof Error ? error.message : 'Unable to cancel the unpaid appointment.');
                return;
              }
              setPaymentAppointmentId(null);
              setBooking(null);
              setPaymentStatus('unpaid');
    setMedicalRecordFile(null);
            }}
            onPaymentComplete={(method) => {
              setPaymentStatus(method === 'pay_at_clinic' ? 'pay_at_clinic' : 'paid');
              setPaymentAppointmentId(null);
            }}
          />
        )}
      </>
    );
  }

  if (!isBackendPatient) {
    return (
      <div className="text-center py-10">
        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={26} className="text-blue-600" />
        </div>
        <h3 className="font-serif text-xl font-bold text-gray-800 mb-2">Please log in to book</h3>
        <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
          Appointments are linked to your patient account so you can view and manage them from your dashboard.
        </p>
        {onOpenLogin && (
          <button
            onClick={onOpenLogin}
            className="px-6 py-3 bg-rose-700 text-white rounded-xl font-semibold text-sm hover:bg-rose-800 transition"
          >
            Log in
          </button>
        )}
      </div>
    );
  }

  const videoAvailable = selectedService?.consultationType.video ?? false;
  const clinicAvailable = selectedService?.consultationType.clinic ?? false;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {serverError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
          <input value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} className={`w-full px-4 py-3 border rounded-xl text-sm ${errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
          {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number *</label>
          <input type="tel" value={form.phone} onChange={(e) => setField('phone', e.target.value.replace(/\D/g, ''))} maxLength={10} className={`w-full px-4 py-3 border rounded-xl text-sm ${errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
          {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
        <input type="email" value={form.email} disabled className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500" />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Service *</label>
          <select value={form.serviceId} onChange={(e) => setField('serviceId', e.target.value)} disabled={loadingData} className={`w-full px-4 py-3 border rounded-xl text-sm bg-white ${errors.serviceId ? 'border-red-300' : 'border-gray-200'}`}>
            <option value="">{loadingData ? 'Loading services...' : 'Select a service...'}</option>
            {services.map((service) => (
              <option key={service._id} value={service._id}>{service.name} — ₹{service.consultationFee}</option>
            ))}
          </select>
          {errors.serviceId && <p className="text-xs text-red-600 mt-1">{errors.serviceId}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor *</label>
          <select value={form.doctorId} onChange={(e) => { setField('doctorId', e.target.value); setField('timeSlot', ''); }} disabled={loadingData} className={`w-full px-4 py-3 border rounded-xl text-sm bg-white ${errors.doctorId ? 'border-red-300' : 'border-gray-200'}`}>
            <option value="">{loadingData ? 'Loading doctors...' : 'Select a doctor...'}</option>
            {doctors.map((doctor) => (
              <option key={doctor._id} value={doctor._id}>{doctor.fullName} — {doctor.specialization}</option>
            ))}
          </select>
          {errors.doctorId && <p className="text-xs text-red-600 mt-1">{errors.doctorId}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointment Date *</label>
          <input type="date" value={form.date} min={todayString} max={maxDateString} onChange={(e) => { const value = e.target.value; setField('date', value); setField('timeSlot', ''); if (value && new Date(`${value}T00:00:00`).getDay() === 0) { setErrors((current) => ({ ...current, date: 'Navjeevan Clinic is closed on Sundays. Please select Monday to Saturday.' })); } }} className={`w-full px-4 py-3 border rounded-xl text-sm ${errors.date ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
          <p className="text-xs text-gray-400 mt-1">Bookings are available up to 14 days ahead.</p>
          {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Available Time *</label>
          <select value={form.timeSlot} onChange={(e) => setField('timeSlot', e.target.value)} disabled={!form.date || !form.doctorId || loadingSlots} className={`w-full px-4 py-3 border rounded-xl text-sm bg-white ${errors.timeSlot ? 'border-red-300' : 'border-gray-200'}`}>
            <option value="">{loadingSlots ? 'Checking availability...' : !form.date || !form.doctorId ? 'Select doctor & date first' : availableSlots.length ? 'Select a time slot...' : form.date === todayString ? 'No later slots available today' : 'No slots available'}</option>
            {availableSlots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
          </select>
          {errors.timeSlot && <p className="text-xs text-red-600 mt-1">{errors.timeSlot}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Type *</label>
        <div className="grid sm:grid-cols-2 gap-3">
          <button type="button" disabled={!clinicAvailable} onClick={() => setField('appointmentType', 'clinic')} className={`p-4 rounded-xl border-2 text-left ${form.appointmentType === 'clinic' && clinicAvailable ? 'border-rose-600 bg-rose-50' : 'border-gray-200'} ${!clinicAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <p className="font-semibold text-sm text-gray-800">Clinic Visit</p>
            <p className="text-xs text-gray-500 mt-1">In-person consultation</p>
          </button>
          {videoAvailable && (
            <button type="button" onClick={() => setField('appointmentType', 'video')} className={`p-4 rounded-xl border-2 text-left ${form.appointmentType === 'video' ? 'border-rose-600 bg-rose-50' : 'border-gray-200'}`}>
              <p className="font-semibold text-sm text-gray-800">Video Consultation</p>
              <p className="text-xs text-gray-500 mt-1">Online consultation</p>
            </button>
          )}
        </div>
        {errors.appointmentType && <p className="text-xs text-red-600 mt-1">{errors.appointmentType}</p>}
      </div>

      {form.appointmentType === 'video' && (
        <div className="space-y-3">
          <label className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 cursor-pointer">
            <input type="checkbox" checked={form.hasPreviousMedicalRecords} onChange={(e) => { setField('hasPreviousMedicalRecords', e.target.checked); if (!e.target.checked) setMedicalRecordFile(null); }} className="mt-1" />
            <span className="text-sm text-blue-800">I have previous medical records relevant to this consultation.</span>
          </label>
          {form.hasPreviousMedicalRecords && (
            <div className="rounded-xl border border-dashed border-blue-300 bg-blue-50/40 p-4">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-blue-800">
                <Upload size={18} />
                <span>Upload medical report (PDF, PNG or JPG only)</span>
                <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg" onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  if (!file) return;
                  const ok = ['application/pdf','image/png','image/jpeg'].includes(file.type) || /\.(pdf|png|jpe?g)$/i.test(file.name);
                  if (!ok) { setMedicalRecordFile(null); setErrors((current) => ({ ...current, medicalRecord: 'Only PDF, PNG and JPG files are allowed.' })); e.target.value=''; return; }
                  setMedicalRecordFile(file); setErrors((current) => ({ ...current, medicalRecord: '' }));
                }} />
              </label>
              {medicalRecordFile && <p className="mt-2 flex items-center gap-2 text-xs text-gray-700"><FileText size={14} /> {medicalRecordFile.name}</p>}
              {errors.medicalRecord && <p className="mt-2 text-xs text-red-600">{errors.medicalRecord}</p>}
            </div>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason for Consultation *</label>
        <textarea value={form.consultationReason} onChange={(e) => setField('consultationReason', e.target.value)} rows={4} maxLength={1000} placeholder="Please describe your concern (minimum 10 characters)..." className={`w-full px-4 py-3 border rounded-xl text-sm resize-none ${errors.consultationReason ? 'border-red-300 bg-red-50' : 'border-gray-200'}`} />
        <div className="flex justify-between mt-1">
          {errors.consultationReason ? <p className="text-xs text-red-600">{errors.consultationReason}</p> : <span />}
          <span className="text-xs text-gray-400">{form.consultationReason.length}/1000</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes <span className="text-gray-400 font-normal">(optional)</span></label>
        <textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)} rows={3} placeholder="Any additional information for the clinic..." className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none" />
      </div>

      <button type="submit" disabled={loading || loadingData || loadingSlots} className="w-full py-4 bg-rose-700 text-white rounded-xl font-semibold hover:bg-rose-800 disabled:opacity-60 transition-all shadow-md flex items-center justify-center gap-2">
        {loading ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Booking appointment...</> : <> <Clock size={16} /> Book Appointment</>}
      </button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock size={11} /> Your appointment is saved securely to your Navjeevan patient account.
      </div>
    </form>
  );
}
