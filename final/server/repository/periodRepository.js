import Period from "../models/Period.js";

// Create Period
export const createPeriod = async (periodData) => {
  return await Period.create(periodData);
};

// Get Period by ID
export const getPeriodById = async (periodId) => {
  return await Period.findOne({
    _id: periodId,
    isDeleted: false,
  });
};

// Get Latest Period of User
export const getLatestPeriod = async (userId) => {
  return await Period.findOne({
    user: userId,
    isDeleted: false,
  }).sort({ startDate: -1 });
};


// Get Previous Period
export const getPreviousPeriod = async (userId, startDate) => {
  return await Period.findOne({
    user: userId,
    isDeleted: false,
    startDate: {
      $lt: startDate,
    },
  }).sort({ startDate: -1 });
};

// Check Overlapping Period
export const findOverlappingPeriod = async (
  userId,
  startDate,
  endDate
) => {
  return await Period.findOne({
    user: userId,
    isDeleted: false,
    startDate: {
      $lte: endDate,
    },
    endDate: {
      $gte: startDate,
    },
  });
};

// ⭐ CONTINUE WITH THE REST OF YOUR FUNCTIONS

// Get All Periods
export const getUserPeriods = async (userId) => {
  return await Period.find({
    user: userId,
    isDeleted: false,
  }).sort({ startDate: -1 });
};

// Update Period
export const updatePeriod = async (periodId, updateData) => {
  return await Period.findOneAndUpdate(
    {
      _id: periodId,
      isDeleted: false,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// Soft Delete Period
export const deletePeriod = async (periodId) => {
  return await Period.findOneAndUpdate(
    {
      _id: periodId,
    },
    {
      isDeleted: true,
    },
    {
      new: true,
    }
  );
};

