import {
  createPregnancy,
  getActivePregnancy,
  getPregnancyById,
  getUserPregnancies,
  updatePregnancy,
  deletePregnancy,
  completePregnancy,
  getPregnancyAnalytics,
} from "../repository/pregnancyRepository.js";

import {
  getPatientStateByUserId,
} from "../repository/patientStateRepository.js";

import validatePregnancyData from "../utils/validations/pregnancyValidation.js";

import { updateTrackerAvailability } from "../utils/validations/patientStateHelper.js";


// ------------------------------
// Create Pregnancy
// ------------------------------

export const createPregnancyService = async (
  userId,
  pregnancyData
) => {

  const validation =
    validatePregnancyData(pregnancyData);

  if (!validation.isValid) {
    throw new Error(
      validation.errors.join(", ")
    );
  }

  const activePregnancy =
    await getActivePregnancy(userId);

  if (activePregnancy) {
    throw new Error(
      "You already have an active pregnancy."
    );
  }

  const pregnancy =
    await createPregnancy({
      ...pregnancyData,
      user: userId,
    });

  const patientState =
    await getPatientStateByUserId(userId);

  if (patientState) {

    patientState.isPregnant = true;

    patientState.pregnancyId =
      pregnancy._id;

    patientState.hasActivePeriod = false;

    patientState.activePeriodId = null;

    patientState.lastActivity =
      new Date();

    updateTrackerAvailability(
      patientState
    );

    await patientState.save();
  }

  return pregnancy;
};


// ------------------------------
// Get Active Pregnancy
// ------------------------------

export const getActivePregnancyService =
async (userId) => {

  const pregnancy =
    await getActivePregnancy(userId);

  if (!pregnancy) {
    throw new Error(
      "No active pregnancy found."
    );
  }

  return pregnancy;
};


// ------------------------------
// Get All Pregnancy Records
// ------------------------------

export const getMyPregnanciesService =
async (userId) => {

  return await getUserPregnancies(
    userId
  );

};


// ------------------------------
// Get Pregnancy By ID
// ------------------------------

export const getPregnancyByIdService =
async (
  pregnancyId,
  userId
) => {

  const pregnancy =
    await getPregnancyById(
      pregnancyId,
      userId
    );

  if (!pregnancy) {
    throw new Error(
      "Pregnancy record not found."
    );
  }

  return pregnancy;
};


// ------------------------------
// Update Pregnancy
// ------------------------------

export const updatePregnancyService = async (
  pregnancyId,
  userId,
  updateData
) => {

  const validation =
    validatePregnancyData(updateData);

  if (!validation.isValid) {
    throw new Error(
      validation.errors.join(", ")
    );
  }

  const pregnancy =
    await getPregnancyById(
      pregnancyId,
      userId
    );

  if (!pregnancy) {
    throw new Error(
      "Pregnancy record not found."
    );
  }

  return await updatePregnancy(
    pregnancyId,
    userId,
    updateData
  );
};



// ------------------------------
// Complete Pregnancy
// ------------------------------

export const completePregnancyService =
async (
  pregnancyId,
  userId
) => {

  const pregnancy =
    await getPregnancyById(
      pregnancyId,
      userId
    );

  if (!pregnancy) {
    throw new Error(
      "Pregnancy record not found."
    );
  }

  const completedPregnancy =
    await completePregnancy(
      pregnancyId,
      userId
    );

  const patientState =
    await getPatientStateByUserId(userId);

  if (patientState) {

    patientState.isPregnant = false;

    patientState.pregnancyId = null;

    patientState.isRecoveryPeriod = true;

    patientState.recoveryEndDate =
      new Date(
        Date.now() +
        42 * 24 * 60 * 60 * 1000
      );

    patientState.lastActivity =
      new Date();

    updateTrackerAvailability(
      patientState
    );

    await patientState.save();
  }

  return completedPregnancy;
};



// ------------------------------
// Delete Pregnancy
// ------------------------------

export const deletePregnancyService =
async (
  pregnancyId,
  userId
) => {

  const pregnancy =
    await getPregnancyById(
      pregnancyId,
      userId
    );

  if (!pregnancy) {
    throw new Error(
      "Pregnancy record not found."
    );
  }

  await deletePregnancy(
    pregnancyId,
    userId
  );

  const patientState =
    await getPatientStateByUserId(userId);

  if (patientState) {

    patientState.isPregnant = false;

    patientState.pregnancyId = null;

    patientState.lastActivity =
      new Date();

    updateTrackerAvailability(
      patientState
    );

    await patientState.save();
  }

  return {
    message:
      "Pregnancy deleted successfully.",
  };
};



// ------------------------------
// Pregnancy Analytics
// ------------------------------

export const getPregnancyAnalyticsService =
async (userId) => {

  const analytics =
    await getPregnancyAnalytics(
      userId
    );

  return {

    totalPregnancies:
      analytics.length,

    activePregnancies:
      analytics.filter(
        (item) =>
          item.pregnancyStatus ===
          "Active"
      ).length,

    completedPregnancies:
      analytics.filter(
        (item) =>
          item.pregnancyStatus ===
          "Completed"
      ).length,

    cancelledPregnancies:
      analytics.filter(
        (item) =>
          item.pregnancyStatus ===
          "Cancelled"
      ).length,

    records: analytics,
  };
};