import {
  createPeriodService,
  getMyPeriodsService,
  getPeriodByIdService,
  updatePeriodService,
  deletePeriodService,
} from "../services/periodService.js";

// Create Period
export const createPeriod = async (req, res) => {
  try {
    const period = await createPeriodService(req.user.id, req.body);

    return res.status(201).json({
      success: true,
      message: "Period logged successfully.",
      data: period,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Periods
export const getMyPeriods = async (req, res) => {
  try {
    const periods = await getMyPeriodsService(req.user.id);

    return res.status(200).json({
      success: true,
      count: periods.length,
      data: periods,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Period By ID
export const getPeriodById = async (req, res) => {
  try {
    const period = await getPeriodByIdService(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      data: period,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Period
export const updatePeriod = async (req, res) => {
  try {
    const period = await updatePeriodService(
      req.user.id,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Period updated successfully.",
      data: period,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Period
export const deletePeriod = async (req, res) => {
  try {
    await deletePeriodService(
      req.user.id,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Period deleted successfully.",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};