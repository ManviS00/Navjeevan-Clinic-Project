import Appointment from "../models/Appointment.js";

import {
  createPrescriptionRepository,
  findPrescriptionByAppointmentRepository,
  getAllPrescriptionsRepository,
  getPrescriptionByIdRepository,
  getPatientPrescriptionsRepository,
  getAppointmentPrescriptionRepository,
  updatePrescriptionRepository,
  deletePrescriptionRepository,
} from "../repository/prescriptionRepository.js";

// Create Prescription
export const createPrescriptionService = async (prescriptionData, requester = null) => {
  const {
    appointmentId,
    patient: submittedPatient,
    diagnosis,
    medicines,
    recommendedTests,
    advice,
    followUpDate,
    notes,
  } = prescriptionData;

  // Check Appointment
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) { throw new Error("Appointment not found."); }

  if (requester?.role === "doctor") {
    const Doctor = (await import("../models/Doctor.js")).default;
    const doctor = await Doctor.findOne({ user: requester.id, isDeleted: false }).select("_id");
    if (!doctor || String(appointment.doctor) !== String(doctor._id)) throw new Error("You can only prescribe for your own appointments.");
  }
  if (submittedPatient && String(submittedPatient) !== String(appointment.patient)) throw new Error("Selected patient does not match the selected appointment.");

  // Appointment must be completed
  if (appointment.status !== "completed") {
    throw new Error(
      "Prescription can only be created after appointment completion."
    );
  }

  // One Prescription Per Appointment
  const existingPrescription =
    await findPrescriptionByAppointmentRepository(appointmentId);

  if (existingPrescription) {
    throw new Error(
      "Prescription already exists for this appointment."
    );
  }

  const normalizedMedicines = (medicines || []).map(m => { const { name, ...rest } = m; return { ...rest, medicineName: rest.medicineName || name }; });

  // Save Prescription
  return await createPrescriptionRepository({
    appointment: appointment._id,
    patient: appointment.patient,
    doctor: appointment.doctor,

    diagnosis,

    medicines: normalizedMedicines,

    recommendedTests:
      recommendedTests && recommendedTests.length
        ? recommendedTests
        : [],

    advice: advice?.trim() || "",

    followUpDate: followUpDate || null,

    notes: notes?.trim() || "",
  });
};

// Get All Prescriptions
export const getAllPrescriptionsService = async (requester = null) => {
  if (requester?.role === "doctor") {
    const Doctor = (await import("../models/Doctor.js")).default;
    const doctor = await Doctor.findOne({ user: requester.id, isDeleted: false }).select("_id");
    if (!doctor) throw new Error("Doctor profile not found.");
    return await getAllPrescriptionsRepository(doctor._id);
  }
  return await getAllPrescriptionsRepository();
};

// Get Prescription By Id
export const getPrescriptionByIdService = async (
  prescriptionId
) => {
  const prescription =
    await getPrescriptionByIdRepository(
      prescriptionId
    );

  if (!prescription) {
    throw new Error("Prescription not found.");
  }

  return prescription;
};

// Patient Prescription History
export const getPatientPrescriptionsService = async (
  patientId,
  requester = null
) => {
  if (requester?.role === "patient" && String(patientId) !== String(requester.id)) {
    throw new Error("You can only view your own prescriptions.");
  }
  if (requester?.role === "doctor") {
    const Doctor = (await import("../models/Doctor.js")).default;
    const doctor = await Doctor.findOne({ user: requester.id, isDeleted: false }).select("_id");
    if (!doctor) throw new Error("Doctor profile not found.");
    const Appointment = (await import("../models/Appointment.js")).default;
    const assigned = await Appointment.exists({ doctor: doctor._id, patient: patientId });
    if (!assigned) throw new Error("Patient is not assigned to this doctor.");
  }
  return await getPatientPrescriptionsRepository(patientId);
};

// Get Prescription By Appointment
export const getAppointmentPrescriptionService =
  async (appointmentId) => {
    const prescription =
      await getAppointmentPrescriptionRepository(
        appointmentId
      );

    if (!prescription) {
      throw new Error("Prescription not found.");
    }

    return prescription;
  };

// Update Prescription
export const updatePrescriptionService = async (
  prescriptionId,
  updateData
) => {
  // Prevent changing relationship fields
  delete updateData.patient;
  delete updateData.doctor;
  delete updateData.appointment;

  const prescription =
    await updatePrescriptionRepository(
      prescriptionId,
      updateData
    );

  if (!prescription) {
    throw new Error("Prescription not found.");
  }

  return prescription;
};

// Delete Prescription
export const deletePrescriptionService = async (
  prescriptionId
) => {
  const prescription =
    await deletePrescriptionRepository(
      prescriptionId
    );

  if (!prescription) {
    throw new Error("Prescription not found.");
  }

  return prescription;
};