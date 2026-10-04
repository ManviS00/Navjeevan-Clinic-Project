import { getPatientDashboardService } from "../services/patientDashboardService.js";

export const getPatientDashboard = async (req, res) => {
  try {
    const year =
      Number(req.query.year) || new Date().getFullYear();

    const dashboard =
      await getPatientDashboardService(
        req.user.id,
        year
      );

    return res.status(200).json({
      success: true,
      data: dashboard,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};