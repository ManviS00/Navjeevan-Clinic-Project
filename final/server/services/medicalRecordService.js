import fs from "fs";

import Appointment from "../models/Appointment.js";

import {
  createMedicalRecord,
  findMedicalRecordByHash,
  findPatientMedicalRecords,
  findMedicalRecordById,
  findMedicalRecordsByAppointment,
  findMedicalRecordsByDoctor,
  findAllMedicalRecords,
  verifyMedicalRecord,
  softDeleteMedicalRecord,
} from "../repository/medicalRecordRepository.js";

import generateFileHash from "../utils/fileHash.js";
import { validateMedicalRecord } from "../utils/fileValidation.js";


// =====================================
// Upload Medical Record
// =====================================

export const uploadMedicalRecordService = async (
  patientId,
  file,
  data
) => {

  validateMedicalRecord(file);

  const {
    appointmentId,
    recordType,
    title,
    description,
  } = data;

  if (
    !appointmentId ||
    !recordType ||
    !title?.trim()
  ) {

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error(
      "appointmentId, recordType and title are required."
    );
  }

  const appointment =
    await Appointment.findById(appointmentId);

  if (!appointment) {

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error("Appointment not found.");
  }

  // Patient ownership check

  if (
    appointment.patient.toString() !== patientId
  ) {

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error(
      "You are not allowed to upload records for this appointment."
    );
  }

  // Only video consultation

  if (
    appointment.appointmentType !== "video"
  ) {

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error(
      "Medical records can only be uploaded for video consultations."
    );
  }

  // Upload required?

  if (
    !appointment.hasPreviousMedicalRecords
  ) {

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error(
      "This appointment does not require previous medical records."
    );
  }

  // Appointment cancelled

  if (
    appointment.status === "cancelled"
  ) {

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error(
      "Cannot upload records for a cancelled appointment."
    );
  }

  // Duplicate detection

  const fileHash =
    await generateFileHash(file.path);

  const existing =
    await findMedicalRecordByHash(fileHash);

  if (existing) {

    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    throw new Error(
      "This medical record has already been uploaded."
    );
  }

  // Save medical record

  const medicalRecord =
    await createMedicalRecord({

      patient: patientId,

      appointment: appointmentId,

      uploadedBy: "patient",

      recordType,

      title: title.trim(),

      description:
        description?.trim() || "",

      fileName: file.filename,

      fileUrl: file.path.replace(/\\/g, "/"),

      fileSize: file.size,

      mimeType: file.mimetype,

      fileHash,

    });

  // Link report to appointment

  appointment.uploadedReports.push(
    medicalRecord._id
  );

  await appointment.save();

  return medicalRecord;

};


// =====================================
// Patient - My Medical Records
// =====================================

export const getMyMedicalRecordsService =
  async (patientId) => {

    return await findPatientMedicalRecords(
      patientId
    );

};


// =====================================
// Get Medical Record By ID
// =====================================

export const getMedicalRecordByIdService =
  async (
    recordId,
    requester
  ) => {

    const record =
      await findMedicalRecordById(recordId);

    if (!record) {
      throw new Error(
        "Medical record not found."
      );
    }

    // Patient

    if (
      requester.role === "patient" &&
      record.patient._id.toString() !==
        requester.id
    ) {

      throw new Error(
        "You are not authorized to access this medical record."
      );

    }

    // Doctor

    if (requester.role === "doctor") {

      const appointment =
        await Appointment.findById(
          record.appointment
        );

      if (
        !appointment ||
        appointment.doctor.toString() !==
          requester.id
      ) {

        throw new Error(
          "You are not authorized to access this medical record."
        );

      }

    }

    return record;

};

// =====================================
// Get Records of One Appointment
// =====================================

export const getAppointmentMedicalRecordsService = async (
  appointmentId,
  requester
) => {
  const appointment = await Appointment.findById(appointmentId);

  if (!appointment) {
    throw new Error("Appointment not found.");
  }

  // Patient can only view own appointment records
  if (
    requester.role === "patient" &&
    appointment.patient.toString() !== requester.id
  ) {
    throw new Error("Unauthorized access.");
  }

  // Doctor can only view assigned appointment records
  if (
    requester.role === "doctor" &&
    appointment.doctor.toString() !== requester.id
  ) {
    throw new Error("Unauthorized access.");
  }

  return await findMedicalRecordsByAppointment(
    appointmentId
  );
};


// =====================================
// Admin / Doctor Records
// =====================================

export const getAllMedicalRecordsService = async (
  requester,
  filters = {}
) => {

  if (requester.role === "admin") {
    return await findAllMedicalRecords(filters);
  }

  if (requester.role === "doctor") {
    const Doctor = (await import("../models/Doctor.js")).default;
    const doctor = await Doctor.findOne({ user: requester.id, isDeleted: false }).select("_id");
    if (!doctor) throw new Error("Doctor profile not found.");
    return await findMedicalRecordsByDoctor(
      doctor._id,
      filters
    );
  }

  throw new Error("Unauthorized access.");
};


// =====================================
// Verify Medical Record
// =====================================

export const verifyMedicalRecordService = async (
  recordId,
  doctorId
) => {

  const record =
    await findMedicalRecordById(recordId);

  if (!record) {
    throw new Error(
      "Medical record not found."
    );
  }

  const appointment =
    await Appointment.findById(
      record.appointment
    );

  if (!appointment) {
    throw new Error(
      "Appointment not found."
    );
  }

  if (
    appointment.doctor.toString() !== doctorId
  ) {
    throw new Error(
      "You are not authorized to verify this medical record."
    );
  }

  if (record.isVerified) {
    throw new Error(
      "Medical record is already verified."
    );
  }

  return await verifyMedicalRecord(
    recordId,
    doctorId
  );

};


// =====================================
// Delete Medical Record
// =====================================

export const deleteMedicalRecordService = async (
  recordId,
  requester
) => {

  const record =
    await findMedicalRecordById(recordId);

  if (!record) {
    throw new Error(
      "Medical record not found."
    );
  }

  // Patient permissions
  if (requester.role === "patient") {

    if (
      record.patient._id.toString() !==
      requester.id
    ) {
      throw new Error("Unauthorized.");
    }

    const appointment =
      await Appointment.findById(
        record.appointment
      );

    if (
      appointment &&
      (
        appointment.status === "confirmed" ||
        appointment.status === "completed"
      )
    ) {
      throw new Error(
        "Medical records cannot be deleted after consultation."
      );
    }

  }

  // Doctor cannot delete
  if (requester.role === "doctor") {
    throw new Error(
      "Doctors are not allowed to delete medical records."
    );
  }

  // Remove report from appointment
  if (record.appointment) {

    await Appointment.findByIdAndUpdate(
      record.appointment,
      {
        $pull: {
          uploadedReports: record._id,
        },
      }
    );

  }

  // Delete physical file

  if (
    record.fileUrl &&
    fs.existsSync(record.fileUrl)
  ) {
    fs.unlinkSync(record.fileUrl);
  }

  return await softDeleteMedicalRecord(
    recordId
  );

};