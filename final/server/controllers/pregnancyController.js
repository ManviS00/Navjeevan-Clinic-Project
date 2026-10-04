import {
  createPregnancyService,
  getActivePregnancyService,
  getMyPregnanciesService,
  getPregnancyByIdService,
  updatePregnancyService,
  deletePregnancyService,
  completePregnancyService,
  getPregnancyAnalyticsService,
} from "../services/pregnancyService.js";

// Create Pregnancy
export const createPregnancy = async (req, res) => {
  try {
    const pregnancy = await createPregnancyService(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Pregnancy created successfully.",
      data: pregnancy,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Active Pregnancy
export const getActivePregnancy = async (req, res) => {
  try {
    const pregnancy =
      await getActivePregnancyService(req.user.id);

    return res.status(200).json({
      success: true,
      data: pregnancy,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Pregnancies
export const getMyPregnancies = async (req, res) => {
  try {
    const pregnancies =
      await getMyPregnanciesService(req.user.id);

    return res.status(200).json({
      success: true,
      count: pregnancies.length,
      data: pregnancies,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Pregnancy By ID
export const getPregnancyById = async (req, res) => {
  try {
    const pregnancy =
      await getPregnancyByIdService(
        req.params.id,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: pregnancy,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Pregnancy
export const updatePregnancy = async (req, res) => {
  try {
    const pregnancy =
      await updatePregnancyService(
        req.params.id,
        req.user.id,
        req.body
      );

    return res.status(200).json({
      success: true,
      message: "Pregnancy updated successfully.",
      data: pregnancy,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Complete Pregnancy
export const completePregnancy = async (req, res) => {
  try {
    const pregnancy =
      await completePregnancyService(
        req.params.id,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: "Pregnancy completed successfully.",
      data: pregnancy,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Pregnancy
export const deletePregnancy = async (req, res) => {
  try {
    const result =
      await deletePregnancyService(
        req.params.id,
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Pregnancy Analytics
export const getPregnancyAnalytics = async (
  req,
  res
) => {
  try {
    const analytics =
      await getPregnancyAnalyticsService(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};