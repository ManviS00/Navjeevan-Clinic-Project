import {
  createPeriod,
  getPeriodById,
  getUserPeriods,
  updatePeriod,
  deletePeriod,
  getPreviousPeriod,
  findOverlappingPeriod,
} from "../repository/periodRepository.js";

import { getPatientProfileByUserId } from "../repository/patientProfileRepository.js";

import { getPatientStateByUserId } from "../repository/patientStateRepository.js";

import {
  calculateAge,
  validatePeriodAge,
} from "../utils/validations/ageValidation.js";

import {
  validatePeriodDateRange,
  validatePeriodLength,
  validateCycleLength,
  validateMinimumGap,
  calculateEndDate,
  calculateNextPeriod,
  calculateOvulationDate,
  calculateFertileWindow,
} from "../utils/validations/periodValidation.js";

import { updateTrackerAvailability } from "../utils/validations/patientStateHelper.js";

// Create Period
export const createPeriodService = async (userId, periodData) => {

  const {
    startDate,
    periodLength,
    cycleLength,
    flow,
    symptoms,
    notes,
  } = periodData;

  // Patient Profile
  const profile = await getPatientProfileByUserId(userId);

  if (!profile) {
    throw new Error("Patient profile not found.");
  }

  if (!profile.dateOfBirth) {
    throw new Error(
      "Please complete your profile before using Period Tracker."
    );
  }

  // Age Validation
  const age = calculateAge(profile.dateOfBirth);

  const ageValidation = validatePeriodAge(age);

  if (!ageValidation.isValid) {
    throw new Error(ageValidation.message);
  }

  // Patient State
  const patientState = await getPatientStateByUserId(userId);

  if (!patientState) {
    throw new Error("Patient state not found.");
  }

  if (patientState.isPregnant) {
    throw new Error(
      "Period cannot be logged while pregnancy is active."
    );
  }

  if (patientState.isRecoveryPeriod) {
    throw new Error(
      "Period cannot be logged during recovery period."
    );
  }

  // Date Validation
  const dateValidation =
    validatePeriodDateRange(startDate);

  if (!dateValidation.isValid) {
    throw new Error(dateValidation.message);
  }

  // Period Length
  const periodValidation =
    validatePeriodLength(periodLength);

  if (!periodValidation.isValid) {
    throw new Error(periodValidation.message);
  }

  // Cycle Length
  const cycleValidation =
    validateCycleLength(cycleLength);

  if (!cycleValidation.isValid) {
    throw new Error(cycleValidation.message);
  }

  // Calculate End Date
  const endDate = calculateEndDate(
    startDate,
    periodLength
  );

  // Overlapping Validation
  const overlap = await findOverlappingPeriod(
    userId,
    new Date(startDate),
    endDate
  );

  if (overlap) {
    throw new Error(
      "This period overlaps with an existing period record."
    );
  }

  // Minimum Gap Validation
  const previousPeriod =
    await getPreviousPeriod(
      userId,
      new Date(startDate)
    );

  const gapValidation =
    validateMinimumGap(
      previousPeriod?.startDate,
      startDate
    );

  if (!gapValidation.isValid) {
    throw new Error(gapValidation.message);
  }

  // Calculate Next Cycle

  const nextExpectedPeriod =
    calculateNextPeriod(
      startDate,
      cycleLength
    );

  // Calculate Ovulation
  const ovulationDate =
    calculateOvulationDate(
      nextExpectedPeriod
    );

  // Fertility Window
  const {
    fertileWindowStart,
    fertileWindowEnd,
  } = calculateFertileWindow(
    ovulationDate
  );
   
  // Save Period
  const period = await createPeriod({
    user: userId,
    startDate,
    endDate,
    periodLength,
    cycleLength,
    nextExpectedPeriod,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    flow,
    symptoms,
    notes,
  });

  // Update Patient State
  patientState.hasActivePeriod = true;
  patientState.activePeriodId = period._id;

  patientState.lastPeriodDate = startDate;
  patientState.nextExpectedPeriod = nextExpectedPeriod;

  patientState.isFertilityWindow = false;

  patientState.fertilityWindowStart = fertileWindowStart;
  patientState.fertilityWindowEnd = fertileWindowEnd;
  patientState.ovulationDate = ovulationDate;

  patientState.lastActivity = new Date();

  updateTrackerAvailability(patientState);

  await patientState.save();
 

  return period;
};

// Get Logged-in User Periods
export const getMyPeriodsService = async (userId) => {
  return await getUserPeriods(userId);
};

// Get Period By Id
export const getPeriodByIdService = async (
  userId,
  periodId
) => {

  const period = await getPeriodById(periodId);

  if (!period) {
    throw new Error("Period record not found.");
  }

  if (period.user.toString() !== userId.toString()) {
    throw new Error("Unauthorized access.");
  }

  return period;
};

// Update Period
export const updatePeriodService = async (
  userId,
  periodId,
  updateData
) => {

  const period = await getPeriodById(periodId);

  if (!period) {
    throw new Error("Period record not found.");
  }

  if (period.user.toString() !== userId.toString()) {
    throw new Error("Unauthorized access.");
  }

  const updatedData = { ...updateData };

   // Validate Updated Data
    const profile = await getPatientProfileByUserId(userId);

    if (!profile) {
    throw new Error("Patient profile not found.");
    }

    const age = calculateAge(profile.dateOfBirth);

    const ageValidation = validatePeriodAge(age);

    if (!ageValidation.isValid) {
    throw new Error(ageValidation.message);
    }

    const patientState = await getPatientStateByUserId(userId);

    if (!patientState) {
    throw new Error("Patient state not found.");
    }

    if (patientState.isPregnant) {
    throw new Error(
        "Period cannot be updated while pregnancy is active."
    );
    }

    if (patientState.isRecoveryPeriod) {
    throw new Error(
        "Period cannot be updated during recovery period."
    );
    }

    const start =
    updateData.startDate || period.startDate;

    const length =
    updateData.periodLength || period.periodLength;

    const cycle =
    updateData.cycleLength || period.cycleLength;

    const dateValidation =
    validatePeriodDateRange(start);

    if (!dateValidation.isValid) {
    throw new Error(dateValidation.message);
    }

    const periodValidation =
    validatePeriodLength(length);

    if (!periodValidation.isValid) {
    throw new Error(periodValidation.message);
    }

    const cycleValidation =
    validateCycleLength(cycle);

    if (!cycleValidation.isValid) {
    throw new Error(cycleValidation.message);
    }

    const calculatedEndDate =
    calculateEndDate(start, length);

    const overlap =
    await findOverlappingPeriod(
        userId,
        new Date(start),
        calculatedEndDate
    );

    if (
    overlap &&
    overlap._id.toString() !== periodId
    ) {
    throw new Error(
        "This period overlaps with another period."
    );
    }

    const previousPeriod =
    await getPreviousPeriod(
        userId,
        new Date(start)
    );

    const gapValidation =
    validateMinimumGap(
        previousPeriod?.startDate,
        start
    );

    if (!gapValidation.isValid) {
    throw new Error(gapValidation.message);
    }

  if (updateData.startDate || updateData.periodLength) {

    const start =
      updateData.startDate || period.startDate;

    const length =
      updateData.periodLength || period.periodLength;

    updatedData.endDate =
      calculateEndDate(start, length);
  }

  if (updateData.startDate || updateData.cycleLength) {

    const start =
      updateData.startDate || period.startDate;

    const cycle =
      updateData.cycleLength || period.cycleLength;

    updatedData.nextExpectedPeriod =
      calculateNextPeriod(start, cycle);

    updatedData.ovulationDate =
      calculateOvulationDate(
        updatedData.nextExpectedPeriod
      );

    const fertile =
      calculateFertileWindow(
        updatedData.ovulationDate
      );

    updatedData.fertileWindowStart =
      fertile.fertileWindowStart;

    updatedData.fertileWindowEnd =
      fertile.fertileWindowEnd;
  }

  const updatedPeriod = await updatePeriod(
    periodId,
    updatedData
  );

  // Update Patient State
    patientState.hasActivePeriod = true;

    patientState.activePeriodId = updatedPeriod._id;

    patientState.fertilityWindowStart =
    updatedPeriod.fertileWindowStart;

    patientState.fertilityWindowEnd =
    updatedPeriod.fertileWindowEnd;

    patientState.ovulationDate =
    updatedPeriod.ovulationDate;

    patientState.lastActivity = new Date();

    updateTrackerAvailability(patientState);

    await patientState.save();

    return updatedPeriod;
};

// Delete Period
export const deletePeriodService = async (
  userId,
  periodId
) => {

  const period = await getPeriodById(periodId);

  if (!period) {
    throw new Error("Period record not found.");
  }

  if (period.user.toString() !== userId.toString()) {
    throw new Error("Unauthorized access.");
  }

  const deletedPeriod = await deletePeriod(periodId);

    // Update Patient State
    const patientState = await getPatientStateByUserId(userId);

    if (
    patientState &&
    patientState.activePeriodId &&
    patientState.activePeriodId.toString() === periodId
    ) {
    patientState.hasActivePeriod = false;

    patientState.activePeriodId = null;

    patientState.fertilityWindowStart = null;

    patientState.fertilityWindowEnd = null;

    patientState.ovulationDate = null;

    patientState.lastActivity = new Date();

    updateTrackerAvailability(patientState);

    await patientState.save();
    }

    return deletedPeriod;
};