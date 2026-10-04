import Prescription from "../models/Prescription.js";

export const createPrescriptionRepository = async (data) => {
  return await Prescription.create(data);
};

export const findPrescriptionByAppointmentRepository = async (
  appointmentId
) => {
  return await Prescription.findOne({
    appointment: appointmentId,
  });
};

export const getAllPrescriptionsRepository = async (doctorId = null) => {
  const query = doctorId ? { doctor: doctorId } : {};
  return await Prescription.find(query)
    .populate("patient", "fullName phone email")
    .populate("doctor", "fullName qualification specialization")
    .populate(
      "appointment",
      "appointmentNumber appointmentDate timeSlot"
    )
    .sort({ createdAt: -1 });
};

export const getPrescriptionByIdRepository = async (
  prescriptionId
) => {
  return await Prescription.findById(prescriptionId)
    .populate("patient", "fullName phone email")
    .populate("doctor", "fullName qualification specialization")
    .populate(
      "appointment",
      "appointmentNumber appointmentDate timeSlot"
    );
};

export const getPatientPrescriptionsRepository = async (
  patientId
) => {
  return await Prescription.find({
    patient: patientId,
  })
    .populate("doctor", "fullName qualification specialization")
    .populate(
      "appointment",
      "appointmentNumber appointmentDate timeSlot"
    )
    .sort({ createdAt: -1 });
};

export const getAppointmentPrescriptionRepository = async (
  appointmentId
) => {
  return await Prescription.findOne({
    appointment: appointmentId,
  })
    .populate("patient", "fullName phone email")
    .populate("doctor", "fullName qualification specialization");
};

export const updatePrescriptionRepository = async (
  prescriptionId,
  updateData
) => {
  return await Prescription.findByIdAndUpdate(
    prescriptionId,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};

export const deletePrescriptionRepository = async (
  prescriptionId
) => {
  return await Prescription.findByIdAndDelete(
    prescriptionId
  );
};