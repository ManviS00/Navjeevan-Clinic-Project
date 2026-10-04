import PatientState from "../models/PatientState.js";

// Create Patient State
export const createPatientState = async (stateData) => {
  return await PatientState.create(stateData);
};

// Get Patient State by User ID
export const getPatientStateByUserId = async (userId) => {
  return await PatientState.findOne({ user: userId })
    .populate("user", "fullName email phone")
    .populate("pregnancyId")
    .populate("activePeriodId");
};

// Update Patient State
export const updatePatientState = async (userId, updateData) => {
  return await PatientState.findOneAndUpdate(
    { user: userId },
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("user", "fullName email phone")
    .populate("pregnancyId")
    .populate("activePeriodId");
};

// Delete Patient State (if ever needed)
export const deletePatientState = async (userId) => {
  return await PatientState.findOneAndDelete({ user: userId });
};