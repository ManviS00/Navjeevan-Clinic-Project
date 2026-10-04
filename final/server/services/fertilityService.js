import {
  createFertilityLog,
  getUserFertilityLogs,
  getFertilityLogById,
  getLatestFertilityLog,
  getFertilityLogByPeriod,
} from "../repository/fertilityRepository.js";

import {
  getLatestPeriod,
} from "../repository/periodRepository.js";

import {
  getPatientStateByUserId,
} from "../repository/patientStateRepository.js";

import validateFertilityData from "../utils/validations/fertilityValidation.js";

import { updateTrackerAvailability } from "../utils/validations/patientStateHelper.js";



// -------------------------
// Helper Functions
// -------------------------

const calculateCycleDay = (startDate) => {
  const today = new Date();

  const diff =
    Math.floor(
      (today - new Date(startDate)) /
      (1000 * 60 * 60 * 24)
    ) + 1;

  return diff < 1 ? 1 : diff;
};

const calculateFertilityStatus = (
  cycleDay,
  fertileStart,
  fertileEnd,
  ovulationDate
) => {
  const today = new Date();

  const fertileStartDate = new Date(fertileStart);
  const fertileEndDate = new Date(fertileEnd);
  const ovulation = new Date(ovulationDate);

  if (
    today.toDateString() ===
    ovulation.toDateString()
  ) {
    return {
      status: "Ovulation",
      chance: 95,
    };
  }

  if (
    today >= fertileStartDate &&
    today <= fertileEndDate
  ) {
    return {
      status: "High",
      chance: 80,
    };
  }

  if (
    cycleDay >= 7 &&
    cycleDay <= 22
  ) {
    return {
      status: "Medium",
      chance: 45,
    };
  }

  return {
    status: "Low",
    chance: 10,
  };
};



// -------------------------
// Create Fertility Log
// -------------------------

export const createFertilityService =
async (
  userId,
  fertilityData
) => {

  const validation =
    validateFertilityData(fertilityData);

  if (!validation.isValid) {
    throw new Error(
      validation.errors.join(", ")
    );
  }

  const latestPeriod =
    await getLatestPeriod(userId);

  if (!latestPeriod) {
    throw new Error(
      "Please log your period before using Fertility Tracker."
    );
  }

  const existingLog =
    await getFertilityLogByPeriod(
      latestPeriod._id
    );

  if (existingLog) {
    throw new Error(
      "Fertility log already exists for this cycle."
    );
  }

  const record =
    await createFertilityLog({
      user: userId,
      period: latestPeriod._id,
      logDate:
        fertilityData.logDate ||
        new Date(),
      cervicalMucus:
        fertilityData.cervicalMucus,
      ovulationTest:
        fertilityData.ovulationTest,
      symptoms:
        fertilityData.symptoms || [],
      notes:
        fertilityData.notes || "",
      pregnancyConfirmed:
        fertilityData.pregnancyConfirmed ||
        false,
    });

  if (record.pregnancyConfirmed) {

    const patientState =
      await getPatientStateByUserId(
        userId
      );

    patientState.isPregnant = true;
    patientState.hasActivePeriod = false;
    patientState.activePeriodId = null;
    patientState.lastActivity =
      new Date();

    updateTrackerAvailability(
      patientState
    );

    await patientState.save();
  }

  return record;
};



// -------------------------
// Get My Logs
// -------------------------

export const getMyFertilityService =
async (userId) => {

  return await getUserFertilityLogs(
    userId
  );

};



// -------------------------
// Get By ID
// -------------------------

export const getFertilityByIdService =
async (
  fertilityId,
  userId
) => {

  const record =
    await getFertilityLogById(
      fertilityId,
      userId
    );

  if (!record) {
    throw new Error(
      "Fertility log not found."
    );
  }

  return record;
};
// -------------------------
// Update Fertility Log
// -------------------------

export const updateFertilityService = async (
  fertilityId,
  userId,
  updateData
) => {
  const validation = validateFertilityData(updateData);

  if (!validation.isValid) {
    throw new Error(validation.errors.join(", "));
  }

  const record = await getFertilityLogById(
    fertilityId,
    userId
  );

  if (!record) {
    throw new Error("Fertility log not found.");
  }

  const updatedRecord = await updateFertilityLog(
    fertilityId,
    userId,
    updateData
  );

  if (
    updateData.pregnancyConfirmed === true
  ) {
    const patientState =
      await getPatientStateByUserId(userId);

    patientState.isPregnant = true;
    patientState.hasActivePeriod = false;
    patientState.activePeriodId = null;
    patientState.lastActivity = new Date();

    updateTrackerAvailability(patientState);

    await patientState.save();
  }

  return updatedRecord;
};



// -------------------------
// Delete Fertility Log
// -------------------------

export const deleteFertilityService = async (
  fertilityId,
  userId
) => {
  const record = await getFertilityLogById(
    fertilityId,
    userId
  );

  if (!record) {
    throw new Error("Fertility log not found.");
  }

  await deleteFertilityLog(
    fertilityId,
    userId
  );

  return {
    message:
      "Fertility log deleted successfully.",
  };
};



// -------------------------
// Fertility Prediction
// -------------------------

export const getFertilityPredictionService =
async (userId) => {

  const latestPeriod =
    await getLatestPeriod(userId);

  if (!latestPeriod) {
    throw new Error(
      "No period record found."
    );
  }

  const cycleDay =
    calculateCycleDay(
      latestPeriod.startDate
    );

  const prediction =
    calculateFertilityStatus(
      cycleDay,
      latestPeriod.fertileWindowStart,
      latestPeriod.fertileWindowEnd,
      latestPeriod.ovulationDate
    );

  return {

    cycleDay,

    fertilityStatus:
      prediction.status,

    pregnancyChance:
      prediction.chance,

    ovulationDate:
      latestPeriod.ovulationDate,

    fertileWindowStart:
      latestPeriod.fertileWindowStart,

    fertileWindowEnd:
      latestPeriod.fertileWindowEnd,

    nextExpectedPeriod:
      latestPeriod.nextExpectedPeriod,

    latestLog:
      await getLatestFertilityLog(
        userId
      ),
  };
};



// -------------------------
// Fertility Analytics
// -------------------------

export const getFertilityAnalyticsService =
async (userId) => {

  const logs =
    await getUserFertilityLogs(
      userId
    );

  const latestPeriod =
    await getLatestPeriod(userId);

  const analytics = {

    totalLogs: logs.length,

    positiveOvulationTests:
      logs.filter(
        (item) =>
          item.ovulationTest ===
          "Positive"
      ).length,

    pregnancyConfirmed:
      logs.filter(
        (item) =>
          item.pregnancyConfirmed
      ).length,

    commonSymptoms: {},

    averageCycleLength:
      latestPeriod
        ? latestPeriod.cycleLength
        : 0,

    averagePeriodLength:
      latestPeriod
        ? latestPeriod.periodLength
        : 0,
  };

  logs.forEach((log) => {
    (log.symptoms || []).forEach(
      (symptom) => {

        analytics.commonSymptoms[
          symptom
        ] =
          (analytics
            .commonSymptoms[
            symptom
          ] || 0) + 1;
      }
    );
  });

  return analytics;
};