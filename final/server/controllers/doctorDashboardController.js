import Doctor from "../models/Doctor.js";
import { getDoctorDashboardService } from "../services/doctorDashboardService.js";

export const getDoctorDashboard = async (req, res) => {
  try {
    const year =
      Number(req.query.year) || new Date().getFullYear();

    const doctor = await Doctor.findOne({
      user: req.user.id,
      isDeleted: false,
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found.",
      });
    }

    const dashboard = await getDoctorDashboardService(
      doctor._id,
      year
    );

    res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};