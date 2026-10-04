import {
  createPatientStateService,
  getPatientStateService,
  updatePatientStateService,
} from "../services/patientStateService.js";

// Create Patient State
export const createPatientState = async (req, res) => {
  try {
    const state = await createPatientStateService(req.user.id);

    return res.status(201).json({
      success: true,
      message: "Patient state created successfully.",
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Logged-in Patient State
export const getPatientState = async (req, res) => {
  try {
    const state = await getPatientStateService(req.user.id);

    return res.status(200).json({
      success: true,
      data: state,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updatePatientState = async (req, res) => {
  try {
    const state = await updatePatientStateService(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: "Patient state updated successfully.",
      data: state,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
