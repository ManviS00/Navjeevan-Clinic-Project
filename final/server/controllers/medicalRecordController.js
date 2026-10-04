import {
  uploadMedicalRecordService,
  getMyMedicalRecordsService,
  getMedicalRecordByIdService,
  getAppointmentMedicalRecordsService,
  getAllMedicalRecordsService,
  verifyMedicalRecordService,
  deleteMedicalRecordService,
} from "../services/medicalRecordService.js";



// ===============================
// Upload Medical Record
// ===============================

export const uploadMedicalRecord = async (req, res) => {
  try {

    const record = await uploadMedicalRecordService(
      req.user.id,
      req.file,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Medical record uploaded successfully.",
      data: record,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};



// ===============================
// Patient - My Records
// ===============================

export const getMyMedicalRecords = async (req, res) => {
  try {

    const records =
      await getMyMedicalRecordsService(req.user.id);

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });

  } catch (error) {

    return res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};



// ===============================
// Get Record By ID
// ===============================

export const getMedicalRecordById = async (
  req,
  res
) => {
  try {

    const record =
      await getMedicalRecordByIdService(
        req.params.id,
        req.user
      );

    return res.status(200).json({
      success: true,
      data: record,
    });

  } catch (error) {

    return res.status(404).json({
      success: false,
      message: error.message,
    });

  }
};



// ===============================
// Appointment Records
// ===============================

export const getAppointmentMedicalRecords =
  async (req, res) => {
    try {

      const records =
        await getAppointmentMedicalRecordsService(
          req.params.appointmentId,
          req.user
        );

      return res.status(200).json({
        success: true,
        count: records.length,
        data: records,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  };



// ===============================
// Admin / Doctor
// ===============================

export const getAllMedicalRecords =
  async (req, res) => {

    try {

      const records =
        await getAllMedicalRecordsService(
          req.user,
          req.query
        );

      return res.status(200).json({
        success: true,
        count: records.length,
        data: records,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  };



// ===============================
// Verify Medical Record
// ===============================

export const verifyMedicalRecord =
  async (req, res) => {

    try {

      const record =
        await verifyMedicalRecordService(
          req.params.id,
          req.user.id
        );

      return res.status(200).json({
        success: true,
        message:
          "Medical record verified successfully.",
        data: record,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  };



// ===============================
// Delete Medical Record
// ===============================

export const deleteMedicalRecord =
  async (req, res) => {

    try {

      const record =
        await deleteMedicalRecordService(
          req.params.id,
          req.user
        );

      return res.status(200).json({
        success: true,
        message:
          "Medical record deleted successfully.",
        data: record,
      });

    } catch (error) {

      return res.status(400).json({
        success: false,
        message: error.message,
      });

    }
  };