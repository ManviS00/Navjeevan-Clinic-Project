import { getUserProfile } from "../services/authService.js";

export const profile = async (req, res) => {
  try {
    const user = await getUserProfile(req.user.id);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};