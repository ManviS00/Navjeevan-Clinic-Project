import MedicalRecord from "../models/MedicalRecord.js";
import Appointment from "../models/Appointment.js";

// =====================================
// Create Medical Record
// =====================================

export const createMedicalRecord = async (recordData) => {
  return await MedicalRecord.create(recordData);
};


// =====================================
// Find By ID
// =====================================

export const findMedicalRecordById = async (recordId) => {
  return await MedicalRecord.findOne({
    _id: recordId,
    isDeleted: false,
  })
    .populate(
      "patient",
      "fullName email phone"
    )
    .populate(
      "appointment",
      "appointmentNumber appointmentType appointmentDate timeSlot doctor"
    )
    .populate(
      "reviewedBy",
      "fullName specialization profileImage"
    );
};


// =====================================
// Find By File Hash
// =====================================

export const findMedicalRecordByHash = async (fileHash) => {
  return await MedicalRecord.findOne({
    fileHash,
    isDeleted: false,
  });
};


// =====================================
// Patient Records
// =====================================

export const findPatientMedicalRecords = async (
  patientId
) => {

  return await MedicalRecord.find({

    patient: patientId,

    isDeleted: false,

  })
    .populate(
      "appointment",
      "appointmentNumber appointmentType appointmentDate timeSlot"
    )
    .populate(
      "reviewedBy",
      "fullName specialization profileImage"
    )
    .sort({
      createdAt: -1,
    });

};


// =====================================
// Doctor Records
// =====================================

export const findMedicalRecordsByDoctor = async (
  doctorId,
  filters = {}
) => {
  const appointmentIds = await Appointment.find({ doctor: doctorId }).distinct("_id");
  const query = { appointment: { $in: appointmentIds }, isDeleted: false };
  if (filters.patientId) query.patient = filters.patientId;
  if (filters.recordType) query.recordType = filters.recordType;
  if (filters.uploadedBy) query.uploadedBy = filters.uploadedBy;
  return await MedicalRecord.find(query)
    .populate(
      "patient",
      "fullName email phone"
    )
    .populate(
      "appointment",
      "appointmentNumber appointmentType appointmentDate timeSlot"
    )
    .populate(
      "reviewedBy",
      "fullName specialization profileImage"
    )
    .sort({
      createdAt: -1,
    });

};


// =====================================
// Appointment Records
// =====================================

export const findMedicalRecordsByAppointment =
  async (
    appointmentId
  ) => {

    return await MedicalRecord.find({

      appointment: appointmentId,

      isDeleted: false,

    })
      .populate(
        "patient",
        "fullName email phone"
      )
      .populate(
        "reviewedBy",
        "fullName specialization profileImage"
      )
      .sort({
        createdAt: -1,
      });

  };


// =====================================
// Admin Search
// =====================================

export const findAllMedicalRecords =
  async (
    filters = {}
  ) => {

    const query = {

      isDeleted: false,

    };

    if (filters.patientId) {

      query.patient = filters.patientId;

    }

    if (filters.recordType) {

      query.recordType = filters.recordType;

    }

    if (filters.uploadedBy) {

      query.uploadedBy = filters.uploadedBy;

    }

    if (filters.reviewedBy) {

      query.reviewedBy = filters.reviewedBy;

    }

    return await MedicalRecord.find(query)
      .populate(
        "patient",
        "fullName email phone"
      )
      .populate(
        "appointment",
        "appointmentNumber appointmentType appointmentDate timeSlot"
      )
      .populate(
        "reviewedBy",
        "fullName specialization profileImage"
      )
      .sort({
        createdAt: -1,
      });

  };


// =====================================
// Update Record
// =====================================

export const updateMedicalRecord =
  async (
    recordId,
    updateData
  ) => {

    return await MedicalRecord.findOneAndUpdate(

      {

        _id: recordId,

        isDeleted: false,

      },

      updateData,

      {

        new: true,

        runValidators: true,

      }

    );

  };


// =====================================
// Verify Record
// =====================================

export const verifyMedicalRecord =
  async (
    recordId,
    doctorId
  ) => {

    return await MedicalRecord.findOneAndUpdate(

      {

        _id: recordId,

        isDeleted: false,

      },

      {

        isVerified: true,

        reviewedByDoctor: true,

        reviewedBy: doctorId,

        reviewedAt: new Date(),

      },

      {

        new: true,

      }

    )
      .populate(
        "patient",
        "fullName email phone"
      )
      .populate(
        "appointment",
        "appointmentNumber appointmentType appointmentDate timeSlot"
      )
      .populate(
        "reviewedBy",
        "fullName specialization profileImage"
      );

  };


// =====================================
// Soft Delete
// =====================================

export const softDeleteMedicalRecord =
  async (
    recordId
  ) => {

    return await MedicalRecord.findOneAndUpdate(

      {

        _id: recordId,

        isDeleted: false,

      },

      {

        isDeleted: true,

        deletedAt: new Date(),

      },

      {

        new: true,

      }

    );

  };


// =====================================
// Restore Record
// =====================================

export const restoreMedicalRecord =
  async (
    recordId
  ) => {

    return await MedicalRecord.findByIdAndUpdate(

      recordId,

      {

        isDeleted: false,

        deletedAt: null,

      },

      {

        new: true,

      }

    );

  };