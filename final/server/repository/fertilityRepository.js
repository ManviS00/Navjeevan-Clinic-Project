import Fertility from "../models/Fertility.js";


// Create Fertility Log
export const createFertilityLog = async (fertilityData) => {
  return await Fertility.create(fertilityData);
};


// Get all fertility logs of a user
export const getUserFertilityLogs = async (userId) => {
  return await Fertility.find({
    user: userId,
    isDeleted: false,
  })
    .populate("period")
    .sort({ logDate: -1 });
};


// Get fertility log by ID
export const getFertilityLogById = async (
  fertilityId,
  userId
) => {
  return await Fertility.findOne({
    _id: fertilityId,
    user: userId,
    isDeleted: false,
  }).populate("period");
};


// Get latest fertility log
export const getLatestFertilityLog = async (
  userId
) => {
  return await Fertility.findOne({
    user: userId,
    isDeleted: false,
  })
    .populate("period")
    .sort({ logDate: -1 });
};


// Get Fertility Log By Period
export const getFertilityLogByPeriod = async (
  periodId
) => {
  return await Fertility.findOne({
    period: periodId,
    isDeleted: false,
  });
};



// Update fertility log
export const updateFertilityLog = async (
  fertilityId,
  userId,
  updateData
) => {
  return await Fertility.findOneAndUpdate(
    {
      _id: fertilityId,
      user: userId,
      isDeleted: false,
    },
    updateData,
    {
      new: true,
      runValidators: true,
    }
  ).populate("period");
};


// Soft Delete fertility log
export const deleteFertilityLog = async (
  fertilityId,
  userId
) => {
  return await Fertility.findOneAndUpdate(
    {
      _id: fertilityId,
      user: userId,
      isDeleted: false,
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};