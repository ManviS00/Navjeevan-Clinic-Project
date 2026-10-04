import {
  createWellnessLog,
  findWellnessLogsByUser,
  findWellnessLogById,
  findWellnessLogByDate,
  updateWellnessLog,
  deleteWellnessLog,
} from "../repository/wellnessRepository.js";


// Create wellness entry
export const createWellnessLogService = async (userId, wellnessData) => {

  const existingLog = await findWellnessLogByDate(
    userId,
    wellnessData.date
  );

  if (existingLog) {
    throw new Error("Wellness entry already exists for this date");
  }


  const logData = {
    ...wellnessData,
    user: userId,
  };


  return await createWellnessLog(logData);
};



// Get user's wellness history
export const getMyWellnessLogsService = async (userId) => {

  return await findWellnessLogsByUser(userId);

};



// Get wellness log by ID
export const getWellnessLogByIdService = async (id) => {

  const log = await findWellnessLogById(id);

  if (!log) {
    throw new Error("Wellness log not found");
  }

  return log;
};



// Update wellness entry
export const updateWellnessLogService = async (
  id,
  userId,
  updateData
) => {

  const log = await findWellnessLogById(id);

  if (!log) {
    throw new Error("Wellness log not found");
  }


  if (log.user.toString() !== userId.toString()) {
    throw new Error("Unauthorized access");
  }


  return await updateWellnessLog(id, updateData);

};



// Delete wellness entry
export const deleteWellnessLogService = async (
  id,
  userId
) => {

  const log = await findWellnessLogById(id);

  if (!log) {
    throw new Error("Wellness log not found");
  }


  if (log.user.toString() !== userId.toString()) {
    throw new Error("Unauthorized access");
  }


  return await deleteWellnessLog(id);

};