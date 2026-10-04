import {
  MIN_REGISTRATION_AGE,
  MAX_REGISTRATION_AGE,
  MIN_PERIOD_AGE,
  MAX_PERIOD_AGE,
  MIN_PREGNANCY_AGE,
  MAX_PREGNANCY_AGE,
  MIN_FERTILITY_AGE,
  MAX_FERTILITY_AGE,
  MIN_WELLNESS_AGE,
  MAX_WELLNESS_AGE,
} from "../../config/healthConfig.js";

// Calculate Age
export const calculateAge = (dateOfBirth) => {
  const today = new Date();
  const dob = new Date(dateOfBirth);

  let age = today.getFullYear() - dob.getFullYear();

  const monthDifference = today.getMonth() - dob.getMonth();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 && today.getDate() < dob.getDate())
  ) {
    age--;
  }

  return age;
};

// Registration Eligibility
export const validateRegistrationAge = (age) => {
  if (age < MIN_REGISTRATION_AGE || age > MAX_REGISTRATION_AGE) {
    return {
      isValid: false,
      message: `Registration is allowed only between ${MIN_REGISTRATION_AGE} and ${MAX_REGISTRATION_AGE} years of age.`,
    };
  }

  return { isValid: true };
};

// Period Tracker Eligibility
export const validatePeriodAge = (age) => {
  if (age < MIN_PERIOD_AGE || age > MAX_PERIOD_AGE) {
    return {
      isValid: false,
      message: `Period Tracker is available only between ${MIN_PERIOD_AGE} and ${MAX_PERIOD_AGE} years of age.`,
    };
  }

  return { isValid: true };
};

// Pregnancy Eligibility
export const validatePregnancyAge = (age) => {
  if (age < MIN_PREGNANCY_AGE || age > MAX_PREGNANCY_AGE) {
    return {
      isValid: false,
      message: `Pregnancy Tracker is available only between ${MIN_PREGNANCY_AGE} and ${MAX_PREGNANCY_AGE} years of age.`,
    };
  }

  return { isValid: true };
};

// Fertility Eligibility
export const validateFertilityAge = (age) => {
  if (age < MIN_FERTILITY_AGE || age > MAX_FERTILITY_AGE) {
    return {
      isValid: false,
      message: `Fertility Tracker is available only between ${MIN_FERTILITY_AGE} and ${MAX_FERTILITY_AGE} years of age.`,
    };
  }

  return { isValid: true };
};

// Wellness Eligibility
export const validateWellnessAge = (age) => {
  if (age < MIN_WELLNESS_AGE || age > MAX_WELLNESS_AGE) {
    return {
      isValid: false,
      message: `Wellness features are available only between ${MIN_WELLNESS_AGE} and ${MAX_WELLNESS_AGE} years of age.`,
    };
  }

  return { isValid: true };
};