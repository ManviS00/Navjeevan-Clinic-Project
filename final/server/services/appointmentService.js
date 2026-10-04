import Appointment from "../models/Appointment.js";
import Doctor from "../models/Doctor.js";
import Service from "../models/Service.js";
import User from "../models/User.js";
import PatientProfile from "../models/PatientProfile.js";
import { sendNotification, appointmentNotification } from "../utils/notificationService.js";
import { calculateAge, validateRegistrationAge } from "../utils/validations/ageValidation.js";

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const INDIA_TIME_ZONE = "Asia/Kolkata";

const getIndiaNowParts = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: INDIA_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter((p) => p.type !== "literal").map((p) => [p.type, p.value]));
  return {
    date: `${values.year}-${values.month}-${values.day}`,
    minutes: Number(values.hour) * 60 + Number(values.minute),
  };
};

const timeSlotToMinutes = (slot) => {
  const match = String(slot || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (hours === 12) hours = 0;
  if (meridiem === "PM") hours += 12;
  return hours * 60 + minutes;
};

const meetingLinkFor = (appointmentId) => `https://meet.jit.si/NavjeevanClinic-${appointmentId}`;

const calculateAgeFromDob = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
};

const normalizeFutureCompletedAppointments = async () => {
  const today = getIndiaNowParts().date;
  await Appointment.updateMany({ status: "completed", appointmentDate: { $gt: today } }, { $set: { status: "confirmed", completedAt: null } });
};


// Normalize a date to midnight (so appointments are compared by calendar day)
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Generate Appointment Number
const generateAppointmentNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.floor(100000 + Math.random() * 900000);

  return `NVC-${year}-${random}`;
};

// Validate time slot format (e.g. 09:30 AM)
const isValidTimeSlot = (slot) => {
  const regex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
  return regex.test(slot);
};

// Get a doctor's open slots for a given date (their configured slots minus already-booked ones)
export const getDoctorAvailabilityService = async (doctorId, dateString) => {
  const doctor = await Doctor.findOne({
    _id: doctorId,
    isDeleted: false,
    status: true,
  });

  if (!doctor) {
    throw new Error("Doctor not found or unavailable");
  }

  if (!dateString) {
    throw new Error("Date is required (YYYY-MM-DD)");
  }

  const date = startOfDay(dateString);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }

  const dayName = DAY_NAMES[date.getDay()];

  if (dayName === "Sunday") {
    return {
      doctorId: doctor._id,
      date: dateString,
      day: dayName,
      availableSlots: [],
      message: "Navjeevan Clinic is closed on Sundays.",
    };
  }

  if (
    doctor.availableDays.length > 0 &&
    !doctor.availableDays.includes(dayName)
  ) {
    return {
      doctorId: doctor._id,
      date: dateString,
      day: dayName,
      availableSlots: [],
      message: `${doctor.fullName} is not available on ${dayName}s.`,
    };
  }

  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const bookedAppointments = await Appointment.find({
    doctor: doctorId,
    appointmentDate: dateString,
    status: { $in: ["pending", "confirmed"] },
  }).select("timeSlot");

  const bookedSlots = bookedAppointments.map((a) => a.timeSlot);

  const indiaNow = getIndiaNowParts();
  const availableSlots = doctor.availableSlots.filter((slot) => {
    if (bookedSlots.includes(slot)) return false;
    // For today's date, never show a slot whose start time has already passed.
    if (dateString === indiaNow.date) {
      const slotMinutes = timeSlotToMinutes(slot);
      if (slotMinutes !== null && slotMinutes <= indiaNow.minutes) return false;
    }
    return true;
  });

  return {
    doctorId: doctor._id,
    date: dateString,
    day: dayName,
    availableSlots,
  };
};

export const bookAppointmentService = async (
  patientId,
  appointmentData
) => {

  const {
    doctorId,
    serviceId,
    appointmentDate,
    timeSlot,
    appointmentType,
    consultationReason,
    hasPreviousMedicalRecords = false,
    notes,
  } = appointmentData;

  // Age is never accepted from the booking form. It is derived from the
  // authenticated patient's registered date of birth, so it stays accurate
  // automatically as the patient's birthday passes.
  const patient = await User.findById(patientId).select("dateOfBirth");
  if (!patient?.dateOfBirth) {
    throw new Error("Your date of birth is missing from your profile. Please update your profile before booking.");
  }
  const patientAge = calculateAge(patient.dateOfBirth);
  const patientAgeValidation = validateRegistrationAge(patientAge);
  if (!patientAgeValidation.isValid) {
    throw new Error(patientAgeValidation.message);
  }

  if (
    !doctorId ||
    !serviceId ||
    !appointmentDate ||
    !timeSlot ||
    !appointmentType ||
    !consultationReason?.trim()
  ) {
    throw new Error(
      "doctorId, serviceId, appointmentDate, timeSlot, appointmentType and consultationReason are required."
    );
  }

  if (!["clinic", "video"].includes(appointmentType)) {
    throw new Error("Invalid appointment type.");
  }

  if (!isValidTimeSlot(timeSlot)) {
    throw new Error(
      "Invalid time slot format. Example: 10:30 AM"
    );
  }

  const doctor = await Doctor.findOne({
    _id: doctorId,
    isDeleted: false,
    status: true,
  });

  if (!doctor) {
    throw new Error("Doctor not found or unavailable.");
  }

  const service = await Service.findOne({
    _id: serviceId,
    isActive: true,
  });

  if (!service) {
    throw new Error("Selected service is unavailable.");
  }

  if (
    appointmentType === "video" &&
    !service.consultationType.video
    ) {
      throw new Error(
        "Video consultation is not available for this service."
      );
  }

  if (
    appointmentType === "clinic" &&
    !service.consultationType.clinic
    ) {
      throw new Error(
        "Clinic visit is not available for this service."
      );
  }

  // Previous medical records can only be uploaded for video consultations
  if (
    appointmentType === "clinic" &&
    hasPreviousMedicalRecords
  ) {
    throw new Error(
      "Previous medical records can only be uploaded for video consultations."
    );
  }

  if (!service) {
    throw new Error("Selected service is unavailable.");
  }

  const date = new Date(appointmentDate);

  if (isNaN(date.getTime())) {
    throw new Error("Invalid appointment date");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    throw new Error("Cannot book an appointment in the past");
  }

  const indiaNow = getIndiaNowParts();
  if (appointmentDate === indiaNow.date) {
    const slotMinutes = timeSlotToMinutes(timeSlot);
    if (slotMinutes !== null && slotMinutes <= indiaNow.minutes) {
      throw new Error("The selected time slot has already passed. Please choose a later time today.");
    }
  }

  if (consultationReason.trim().length < 10) {
    throw new Error(
      "Consultation reason must contain at least 10 characters."
    );
  }

  if (consultationReason.trim().length > 1000) {
    throw new Error(
      "Consultation reason cannot exceed 1000 characters."
    );
  }

  // Maximum booking = 2 weeks
  const MAX_BOOKING_DAYS = 14;

  // Maximum booking period
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + MAX_BOOKING_DAYS);

  if (date > maxDate) {
    throw new Error(
      `Appointments can only be booked up to ${MAX_BOOKING_DAYS} days in advance.`
    );
  }

  const dayName = DAY_NAMES[date.getDay()];

  if (dayName === "Sunday") {
    throw new Error("Navjeevan Clinic is closed on Sundays.");
  }

  if (
    doctor.availableDays.length &&
    !doctor.availableDays.includes(dayName)
  ) {
    throw new Error(
      `Doctor is unavailable on ${dayName}.`
    );
  }

  if (
    doctor.availableSlots.length &&
    !doctor.availableSlots.includes(timeSlot)
  ) {
    throw new Error(
      "Selected slot is not available."
    );
  }

  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);

  const existingAppointment = await Appointment.findOne({
    doctor: doctorId,
    appointmentDate,
    timeSlot,
    status: {
      $in: ["pending", "confirmed"],
    },
  });

  if (existingAppointment) {
    throw new Error(
      "This appointment slot has already been booked."
    );
  }

  let appointmentNumber;

  while (true) {

    appointmentNumber = generateAppointmentNumber();

    const exists = await Appointment.findOne({
      appointmentNumber,
    });

    if (!exists) break;
  }

  const appointment = await Appointment.create({

    appointmentNumber,

    patient: patientId,

    doctor: doctorId,

    service: serviceId,

    appointmentDate,

    timeSlot,

    appointmentType,

    consultationReason: consultationReason.trim(),

    hasPreviousMedicalRecords,

    notes: notes?.trim() || "",

    // Every confirmed video appointment gets one stable meeting room.
    // Access is still protected by the video-access endpoint until the scheduled time.
    meetingLink: appointmentType === "video" ? meetingLinkFor(appointmentNumber) : "",
    meetingStatus: appointmentType === "video" ? "pending" : "pending",
    status: "pending",

  });

  const populated = await appointment.populate([
    { path: "patient", select: "fullName phone email notificationPreference" },
    { path: "doctor", select: "fullName specialization profileImage" },
    { path: "service", select: "name consultationFee duration consultationType" },
  ]);

  const notification = appointmentNotification({ user: populated.patient, appointment: populated, type: "booked" });
  void sendNotification({
    user: populated.patient,
    preference: populated.patient?.notificationPreference,
    emailSubject: notification.subject,
    emailHtml: notification.html,
    smsBody: notification.sms,
  });

  return populated;

};

// Return the video room only when a confirmed video appointment has reached its scheduled start time.
export const getVideoAccessService = async (appointmentId, requester) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate("service", "name duration consultationType")
    .populate("patient", "fullName email")
    .populate("doctor", "fullName specialization user");

  if (!appointment) throw new Error("Appointment not found");
  if (appointment.appointmentType !== "video") throw new Error("This appointment is not a video consultation.");
  if (appointment.status !== "confirmed") throw new Error("Video consultation is available only for a confirmed appointment.");

  const isPatient = requester?.role === "patient" && appointment.patient?._id?.toString() === String(requester.id);
  let isDoctor = false;
  if (requester?.role === "doctor") {
    const doctor = await Doctor.findOne({ user: requester.id, isDeleted: false }).select("_id");
    isDoctor = Boolean(doctor && appointment.doctor?._id?.toString() === doctor._id.toString());
  }
  if (!isPatient && !isDoctor && requester?.role !== "admin") {
    throw new Error("You are not authorized to join this video consultation.");
  }

  const indiaNow = getIndiaNowParts();
  const startMinutes = timeSlotToMinutes(appointment.timeSlot);
  const currentMinutes = indiaNow.minutes;
  if (appointment.appointmentDate > indiaNow.date || (appointment.appointmentDate === indiaNow.date && startMinutes !== null && currentMinutes < startMinutes - 10)) {
    throw new Error(`Video consultation opens 10 minutes before the scheduled time: ${appointment.appointmentDate} ${appointment.timeSlot}.`);
  }
  // No fixed session-duration cutoff is used. A consultation remains available
  // after it starts until the doctor marks the appointment completed.
  if (isPatient && appointment.meetingStatus !== "scheduled") {
    throw new Error("The doctor has not started the video consultation yet. Please wait for the doctor to admit you.");
  }
  if (!appointment.meetingLink) appointment.meetingLink = meetingLinkFor(appointment._id);
  if (isDoctor || requester?.role === "admin") appointment.meetingStatus = "scheduled";
  await appointment.save();

  return {
    appointmentId: String(appointment._id),
    meetingLink: appointment.meetingLink,
    meetingStatus: appointment.meetingStatus,
    appointmentDate: appointment.appointmentDate,
    timeSlot: appointment.timeSlot,
  };
};

// Patient: view their own appointments
export const getMyAppointmentsService = async (patientId) => {
  return await Appointment.find({ patient: patientId })
    .populate("doctor", "fullName specialization profileImage")
    .populate("service", "name consultationFee duration")
    .sort({ appointmentDate: -1 });
};

// Admin/Doctor: view all appointments (optionally filtered)
export const getAllAppointmentsService = async (filters = {}) => {
  await normalizeFutureCompletedAppointments();
  const query = {};

  if (filters.doctorId) {
    const Doctor = (await import("../models/Doctor.js")).default;
    const doctor = await Doctor.findOne({ user: filters.doctorId, isDeleted: false }).select("_id");
    query.doctor = doctor ? doctor._id : filters.doctorId;
  }
  if (filters.status) query.status = filters.status;
  if (filters.date) {
    query.appointmentDate = filters.date;
  }

  const appointments = await Appointment.find(query)
    .populate("patient", "fullName phone email profileImage dateOfBirth")
    .populate("doctor", "fullName specialization")
    .populate("service", "name consultationFee duration consultationType")
    .sort({ appointmentDate: -1 });

  const patientIds = appointments.map((appointment) => appointment.patient?._id).filter(Boolean);
  const profiles = await PatientProfile.find({ user: { $in: patientIds } })
    .select("user profileImage dateOfBirth")
    .lean();
  const profileMap = new Map(profiles.map((profile) => [String(profile.user), profile]));

  appointments.forEach((appointment) => {
    if (appointment.patient) {
      const profile = profileMap.get(String(appointment.patient._id));
      const image = profile?.profileImage;
      if (image && !appointment.patient.profileImage) appointment.patient.profileImage = image;

      // Prefer the PatientProfile DOB, with the signup DOB as fallback.
      // Age is calculated on every request so it changes automatically on birthdays.
      appointment.patient.age = calculateAgeFromDob(
        profile?.dateOfBirth ?? appointment.patient.dateOfBirth
      );
    }
  });

  return appointments;
};

export const getAppointmentByIdService = async (appointmentId) => {
  const appointment = await Appointment.findById(appointmentId)
    .populate("patient", "fullName phone email")
    .populate("doctor", "fullName specialization")
    .populate("service", "name consultationFee duration");

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  return appointment;
};

// Reschedule a confirmed appointment. Patients may do this up to two times.
export const rescheduleAppointmentService = async (appointmentId, requester, { appointmentDate, timeSlot }) => {
  if (requester?.role !== "patient") throw new Error("Only the patient can reschedule this appointment.");
  if (!appointmentDate || !timeSlot) throw new Error("A new appointment date and time slot are required.");
  if (!isValidTimeSlot(timeSlot)) throw new Error("Invalid time slot format. Example: 10:30 AM");

  const appointment = await Appointment.findById(appointmentId);
  if (!appointment) throw new Error("Appointment not found");
  if (appointment.patient.toString() !== String(requester.id)) throw new Error("You can only reschedule your own appointment.");
  if (appointment.status !== "confirmed") throw new Error("Only a confirmed appointment can be rescheduled.");
  if ((appointment.rescheduleCount || 0) >= 2) throw new Error("This appointment has already been rescheduled twice and cannot be rescheduled again.");
  const currentStart = parseAppointmentStart(appointment.appointmentDate, appointment.timeSlot);
  if (currentStart && currentStart <= new Date()) throw new Error("A past appointment cannot be rescheduled.");

  const newDate = new Date(`${appointmentDate}T00:00:00`);
  if (Number.isNaN(newDate.getTime())) throw new Error("Invalid appointment date");
  const indiaNow = getIndiaNowParts();
  if (appointmentDate < indiaNow.date) throw new Error("Cannot reschedule an appointment to a past date.");
  const maxDate = new Date(`${indiaNow.date}T00:00:00`);
  maxDate.setDate(maxDate.getDate() + 14);
  if (newDate > maxDate) throw new Error("Appointments can only be scheduled up to 14 days in advance.");
  const slotMinutes = timeSlotToMinutes(timeSlot);
  if (appointmentDate === indiaNow.date && slotMinutes !== null && slotMinutes <= indiaNow.minutes) {
    throw new Error("The selected time slot has already passed. Please choose a later time today.");
  }

  const doctor = await Doctor.findOne({ _id: appointment.doctor, isDeleted: false, status: true });
  if (!doctor) throw new Error("Doctor is not available for rescheduling.");
  const dayName = DAY_NAMES[newDate.getDay()];
  if (dayName === "Sunday") throw new Error("Navjeevan Clinic is closed on Sundays.");
  if (doctor.availableDays.length && !doctor.availableDays.includes(dayName)) throw new Error(`Doctor is unavailable on ${dayName}.`);
  if (doctor.availableSlots.length && !doctor.availableSlots.includes(timeSlot)) throw new Error("Selected slot is not available.");

  const conflict = await Appointment.findOne({
    _id: { $ne: appointment._id }, doctor: appointment.doctor, appointmentDate, timeSlot,
    status: { $in: ["pending", "confirmed"] },
  });
  if (conflict) throw new Error("This appointment slot has already been booked.");

  // Keep the original schedule so staff can see that the patient rescheduled.
  if (!appointment.originalAppointmentDate) appointment.originalAppointmentDate = appointment.appointmentDate;
  if (!appointment.originalTimeSlot) appointment.originalTimeSlot = appointment.timeSlot;
  appointment.appointmentDate = appointmentDate;
  appointment.timeSlot = timeSlot;
  appointment.rescheduleCount = (appointment.rescheduleCount || 0) + 1;
  appointment.rescheduledAt = new Date();
  if (appointment.appointmentType === "video") appointment.meetingStatus = "pending";
  await appointment.save();
  return appointment.populate([
    { path: "patient", select: "fullName phone email notificationPreference" },
    { path: "doctor", select: "fullName specialization profileImage" },
    { path: "service", select: "name consultationFee duration consultationType" },
  ]);
};

// Cancel an appointment. requester = { id, role } so a patient can only cancel their own.
export const cancelAppointmentService = async (
  appointmentId,
  requester,
  reason = ""
) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  const isOwner = appointment.patient.toString() === requester.id;
  const isStaff = requester.role === "admin" || requester.role === "doctor";

  if (!isOwner && !isStaff) {
    throw new Error("You are not authorized to cancel this appointment");
  }

  if (appointment.status === "cancelled") {
    throw new Error("Appointment is already cancelled");
  }

  if (appointment.status === "completed") {
    throw new Error("Cannot cancel a completed appointment");
  }

  appointment.status = "cancelled";
  appointment.cancelReason = reason;
  appointment.cancelledBy = isOwner ? "patient" : requester.role;
  appointment.cancelledAt = new Date();

  await appointment.save();

  const populated = await appointment.populate([
    { path: "patient", select: "fullName phone email notificationPreference" },
    { path: "doctor", select: "fullName specialization" },
    { path: "service", select: "name consultationFee duration" },
  ]);
  const notification = appointmentNotification({ user: populated.patient, appointment: populated, type: "cancelled" });
  void sendNotification({ user: populated.patient, preference: populated.patient?.notificationPreference, emailSubject: notification.subject, emailHtml: notification.html, smsBody: notification.sms });

  return populated;
};

function parseAppointmentStart(dateString, timeSlot) {
  const match = String(timeSlot || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (hours === 12) hours = 0;
  if (meridiem === "PM") hours += 12;
  const value = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(value.getTime())) return null;
  value.setHours(hours, minutes, 0, 0);
  return value;
}

// Admin/Doctor: update appointment status (confirm / complete)
export const updateAppointmentStatusService = async (
  appointmentId,
  status,
  requester = null
) => {
  const allowedStatuses = ["pending", "confirmed", "completed"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid status. Use pending, confirmed or completed");
  }

  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found");
  }

  if (appointment.status === "cancelled") {
    throw new Error("Cannot update a cancelled appointment");
  }

  // A pending patient booking is not confirmed by staff manually. It must first
  // have a valid payment outcome: online payment captured or pay-at-clinic selected.
  if (status === "confirmed" && appointment.status === "pending") {
    const canConfirm = appointment.paymentStatus === "paid" || appointment.paymentMethod === "pay_at_clinic";
    if (!canConfirm) {
      throw new Error("Appointment cannot be confirmed until the required payment option is completed.");
    }
  }

  if (status === "confirmed") {
    const dateTime = parseAppointmentStart(appointment.appointmentDate, appointment.timeSlot);
    if (!dateTime || dateTime <= new Date()) {
      throw new Error("A past appointment cannot be confirmed.");
    }
  }

  if (status === "completed") {
    if (appointment.status !== "confirmed") {
      throw new Error("Only a confirmed appointment can be completed.");
    }

    const dateTime = parseAppointmentStart(appointment.appointmentDate, appointment.timeSlot);
    if (!dateTime || dateTime > new Date()) {
      throw new Error("A future appointment cannot be marked completed. Start/completion is allowed only after the scheduled appointment time.");
    }
  }

  if (requester?.role === "doctor") {
    const Doctor = (await import("../models/Doctor.js")).default;
    const doctor = await Doctor.findOne({ user: requester.id, isDeleted: false });
    if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
      throw new Error("You can only update your own appointments");
    }
  }

  appointment.status = status;
  if (status === "completed") appointment.completedAt = new Date();
  await appointment.save();

  const populated = await appointment.populate([
    { path: "patient", select: "fullName phone email notificationPreference" },
    { path: "doctor", select: "fullName specialization" },
    { path: "service", select: "name consultationFee duration" },
  ]);
  if (["confirmed", "completed"].includes(status)) {
    const notification = appointmentNotification({ user: populated.patient, appointment: populated, type: status });
    void sendNotification({ user: populated.patient, preference: populated.patient?.notificationPreference, emailSubject: notification.subject, emailHtml: notification.html, smsBody: notification.sms });
  }

  return populated;
};
