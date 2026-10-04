import {
  createFertilityService,
  getMyFertilityService,
  getFertilityByIdService,
  updateFertilityService,
  deleteFertilityService,
  getFertilityPredictionService,
  getFertilityAnalyticsService,
} from "../services/fertilityService.js";

// Create Fertility Log
export const createFertility = async (req, res) => {
  try {
    const fertility = await createFertilityService(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Fertility log created successfully.",
      data: fertility,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Fertility Logs
export const getMyFertilityLogs = async (req, res) => {
  try {
    const logs = await getMyFertilityService(req.user.id);

    return res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Fertility Log By ID
export const getFertilityById = async (req, res) => {
  try {
    const log = await getFertilityByIdService(
      req.params.id,
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Fertility Log
export const updateFertility = async (req, res) => {
  try {
    const log = await updateFertilityService(
      req.params.id,
      req.user.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Fertility log updated successfully.",
      data: log,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Fertility Log
export const deleteFertility = async (req, res) => {
  try {
    const result = await deleteFertilityService(
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

// Get Fertility Prediction
export const getFertilityPrediction = async (req, res) => {
  try {
    const prediction =
      await getFertilityPredictionService(req.user.id);

    return res.status(200).json({
      success: true,
      data: prediction,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Fertility Analytics
export const getFertilityAnalytics = async (req, res) => {
  try {
    const analytics =
      await getFertilityAnalyticsService(req.user.id);

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