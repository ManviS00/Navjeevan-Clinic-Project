export const updateTrackerAvailability = (patientState) => {
  // Wellness tracker is always available
  patientState.canUseWellnessTracker = true;

  // Pregnancy active
  if (patientState.isPregnant) {
    patientState.canUsePregnancyTracker = true;
    patientState.canUsePeriodTracker = false;
    patientState.canUseFertilityTracker = false;
    return patientState;
  }

  // Recovery period
  if (patientState.isRecoveryPeriod) {
    patientState.canUsePregnancyTracker = false;
    patientState.canUsePeriodTracker = false;
    patientState.canUseFertilityTracker = false;
    return patientState;
  }

  // Normal state
  patientState.canUsePeriodTracker = true;
  patientState.canUsePregnancyTracker = false;

  // Fertility tracker is enabled only after the user has
  // at least one period recorded.
  patientState.canUseFertilityTracker =
    !!patientState.activePeriodId;

  return patientState;
};