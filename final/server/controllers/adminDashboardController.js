import { getAdminDashboardService } from "../services/adminDashboardService.js";

export const getAdminDashboard = async (req, res) => {
  try {
    // Get year from query parameter
    const year = Number(req.query.year) || new Date().getFullYear();

    const dashboardData = await getAdminDashboardService(year);

    return res.status(200).json({
      success: true,
      message: "Admin dashboard fetched successfully.",
      data: dashboardData,
    });
  } catch (error) {
    console.error("Admin Dashboard Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};