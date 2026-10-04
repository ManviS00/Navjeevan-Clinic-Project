import Wellness from "../models/Wellness.js";


// Create wellness log
export const createWellnessLog = async (wellnessData) => {
  return await Wellness.create(wellnessData);
};


// Get all wellness logs of a user
export const findWellnessLogsByUser = async (userId) => {
  return await Wellness.find({
    user: userId,
  }).sort({
    date: -1,
  });
};


// Get single wellness log by ID
export const findWellnessLogById = async (id) => {
  return await Wellness.findById(id);
};


// Find wellness log by user and date
// Useful to prevent duplicate daily entries
export const findWellnessLogByDate = async (userId, date) => {
  return await Wellness.findOne({
    user: userId,
    date: date,
  });
};


// Update wellness log
export const updateWellnessLog = async (id, updateData) => {
  return await Wellness.findByIdAndUpdate(
    id,
    updateData,
    {
      new: true,
      runValidators: true,
    }
  );
};


// Delete wellness log
export const deleteWellnessLog = async (id) => {
  return await Wellness.findByIdAndDelete(id);
};