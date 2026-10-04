import {
  getPatientProfileService,
  updatePatientProfileService,
  updateProfileImageService,
} from "../services/patientProfileService.js";


// Get Logged-in Patient Profile
export const getMyProfile = async (req, res) => {
  try {
    const profile = await getPatientProfileService(req.user.id);

    res.status(200).json({
      success: true,
      message: "Patient profile fetched successfully.",
      data: profile,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};


// Update Patient Profile
export const updateMyProfile = async (req, res) => {
  try {
    const profile = await updatePatientProfileService(
      req.user.id,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Patient profile updated successfully.",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// Upload Profile Image
export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a profile image.",
      });
    }

    const profile = await updateProfileImageService(
      req.user.id,
      req.file.path
    );

    res.status(200).json({
      success: true,
      message: "Profile image uploaded successfully.",
      data: profile,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};