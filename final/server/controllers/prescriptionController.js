import {
  createPrescriptionService,
  getAllPrescriptionsService,
  getPrescriptionByIdService,
  getPatientPrescriptionsService,
  getAppointmentPrescriptionService,
  updatePrescriptionService,
  deletePrescriptionService,
} from "../services/prescriptionService.js";

// Create Prescription
export const createPrescription = async (req, res) => {
  try {
    const prescription = await createPrescriptionService(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Prescription created successfully.",
      data: prescription,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Prescriptions
export const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await getAllPrescriptionsService(req.user);

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Prescription By ID
export const getPrescriptionById = async (req, res) => {
  try {
    const prescription = await getPrescriptionByIdService(
      req.params.id
    );
    if (req.user.role === "patient" && String(prescription.patient?._id ?? prescription.patient) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    return res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Prescriptions of a Patient
export const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await getPatientPrescriptionsService(
      req.params.patientId,
      req.user
    );

    return res.status(200).json({
      success: true,
      count: prescriptions.length,
      data: prescriptions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Prescription By Appointment
export const getAppointmentPrescription = async (req, res) => {
  try {
    const prescription =
      await getAppointmentPrescriptionService(
        req.params.appointmentId
      );

    return res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Prescription
export const updatePrescription = async (req, res) => {
  try {
    const prescription = await updatePrescriptionService(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Prescription updated successfully.",
      data: prescription,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Prescription
export const deletePrescription = async (req, res) => {
  try {
    await deletePrescriptionService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Prescription deleted successfully.",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};