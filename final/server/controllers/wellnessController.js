import {
  createWellnessLogService,
  getMyWellnessLogsService,
  getWellnessLogByIdService,
  updateWellnessLogService,
  deleteWellnessLogService,
} from "../services/wellnessService.js";


// Create wellness log
export const createWellnessLog = async (req, res) => {
  try {

    const userId = req.user.id;

    const wellnessLog = await createWellnessLogService(
      userId,
      req.body
    );


    res.status(201).json({
      success: true,
      message: "Wellness entry saved successfully",
      data: wellnessLog,
    });


  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};



// Get my wellness logs
export const getMyWellnessLogs = async (req, res) => {
  try {

    const userId = req.user.id;

    const logs = await getMyWellnessLogsService(userId);


    res.status(200).json({
      success: true,
      data: logs,
    });


  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// Get wellness log by ID
export const getWellnessLogById = async (req, res) => {
  try {

    const log = await getWellnessLogByIdService(
      req.params.id
    );


    res.status(200).json({
      success: true,
      data: log,
    });


  } catch (error) {

    res.status(404).json({
      success: false,
      message: error.message,
    });

  }
};



// Update wellness log
export const updateWellnessLog = async (req, res) => {
  try {

    const userId = req.user.id;


    const updatedLog = await updateWellnessLogService(
      req.params.id,
      userId,
      req.body
    );


    res.status(200).json({
      success: true,
      message: "Wellness entry updated successfully",
      data: updatedLog,
    });


  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};



// Delete wellness log
export const deleteWellnessLog = async (req, res) => {
  try {

    const userId = req.user.id;


    await deleteWellnessLogService(
      req.params.id,
      userId
    );


    res.status(200).json({
      success: true,
      message: "Wellness entry deleted successfully",
    });


  } catch (error) {

    res.status(400).json({
      success: false,
      message: error.message,
    });

  }
};