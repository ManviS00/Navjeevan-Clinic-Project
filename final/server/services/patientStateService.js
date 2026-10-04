import {
  createPatientState,
  getPatientStateByUserId,
  updatePatientState,
} from "../repository/patientStateRepository.js";

import { getPatientProfileByUserId } from "../repository/patientProfileRepository.js";

import {
  calculateAge,
  validatePeriodAge,
  validatePregnancyAge,
  validateFertilityAge,
  validateWellnessAge,
} from "../utils/validations/ageValidation.js";

// Create Patient State
export const createPatientStateService = async (userId) => {
  const existingState = await getPatientStateByUserId(userId);

  if (existingState) {
    throw new Error("Patient state already exists.");
  }

  return await createPatientState({
    user: userId,
  });
};

// Get Patient State
export const updatePatientStateService = async (userId, updateData) => {
  const allowed = {};
  if (typeof updateData.stage === "string") {
    allowed.isPregnant = updateData.stage === "pregnant";
    allowed.isFertilityWindow = updateData.stage === "fertility";
  }
  if (typeof updateData.trying_to_conceive === "boolean") {
    allowed.isFertilityWindow = updateData.trying_to_conceive;
  }
  if (updateData.lastActivity) allowed.lastActivity = updateData.lastActivity;
  const existing = await getPatientStateByUserId(userId);
  if (!existing) {
    await createPatientState({ user: userId, ...allowed });
  } else if (Object.keys(allowed).length) {
    return await updatePatientState(userId, allowed);
  }
  return await getPatientStateByUserId(userId);
};

export const getPatientStateService = async (userId) => {
  const state = await getPatientStateByUserId(userId);

  if (!state) {
    throw new Error("Patient state not found.");
  }

  return state;
};

// Refresh Patient State
export const refreshPatientStateService = async (userId) => {
  const profile = await getPatientProfileByUserId(userId);

  if (!profile) {
    throw new Error("Patient profile not found.");
  }

  if (!profile.dateOfBirth) {
    throw new Error("Please complete your profile first.");
  }

  const age = calculateAge(profile.dateOfBirth);

  const canUsePeriodTracker =
    validatePeriodAge(age).isValid &&
    !profileStateCondition("pregnant") &&
    !profileStateCondition("recovery");

  const canUsePregnancyTracker =
    validatePregnancyAge(age).isValid &&
    !profileStateCondition("pregnant") &&
    !profileStateCondition("recovery");

  const canUseFertilityTracker =
    validateFertilityAge(age).isValid &&
    !profileStateCondition("pregnant") &&
    !profileStateCondition("recovery");

  const canUseWellnessTracker =
    validateWellnessAge(age).isValid;

  return await updatePatientState(userId, {
    canUsePeriodTracker,
    canUsePregnancyTracker,
    canUseFertilityTracker,
    canUseWellnessTracker,
    lastActivity: new Date(),
  });
};