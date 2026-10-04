import Pregnancy from "../models/Pregnancy.js";

// Create Pregnancy
export const createPregnancy = async (pregnancyData) => {
  return await Pregnancy.create(pregnancyData);
};

// Get Active Pregnancy of User
export const getActivePregnancy = async (userId) => {
  return await Pregnancy.findOne({
    user: userId,
    pregnancyStatus: "Active",
    isDeleted: false,
  }).sort({ createdAt: -1 });
};

// Get Pregnancy By ID
export const getPregnancyById = async (
  pregnancyId,
  userId
) => {
  return await Pregnancy.findOne({
    _id: pregnancyId,
    user: userId,
    isDeleted: false,
  }).populate("appointments.appointment");
};

// Get All Pregnancies of User
export const getUserPregnancies = async (
  userId
) => {
  return await Pregnancy.find({
    user: userId,
    isDeleted: false,
  })
    .populate("appointments.appointment")
    .sort({ createdAt: -1 });
};

// Update Pregnancy
export const updatePregnancy = async (
  pregnancyId,
  userId,
  updateData
) => {
  return await Pregnancy.findOneAndUpdate(
    {
      _id: pregnancyId,
      user: userId,
      isDeleted: false,
    },
    {
      $set: updateData,
    },
    {
      new: true,
      runValidators: true,
    }
  ).populate("appointments.appointment");
};

// Soft Delete Pregnancy
export const deletePregnancy = async (
  pregnancyId,
  userId
) => {
  return await Pregnancy.findOneAndUpdate(
    {
      _id: pregnancyId,
      user: userId,
      isDeleted: false,
    },
    {
      isDeleted: true,
      pregnancyStatus: "Cancelled",
    },
    {
      new: true,
    }
  );
};

// Complete Pregnancy
export const completePregnancy = async (
  pregnancyId,
  userId
) => {
  return await Pregnancy.findOneAndUpdate(
    {
      _id: pregnancyId,
      user: userId,
      isDeleted: false,
    },
    {
      pregnancyStatus: "Completed",
    },
    {
      new: true,
    }
  );
};

// Pregnancy Analytics
export const getPregnancyAnalytics = async (
  userId
) => {
  return await Pregnancy.find({
    user: userId,
    isDeleted: false,
  }).select(
    "pregnancyWeek currentWeight hydration nutrition symptoms timeline pregnancyStatus"
  );
};