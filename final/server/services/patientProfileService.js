import {
  createPatientProfile,
  getPatientProfileByUserId,
  updatePatientProfile,
  updateProfileImage,
} from "../repository/patientProfileRepository.js";

import {
  validateDateOfBirth,
  validateHeight,
  validateWeight,
  validateAddress,
} from "../utils/validations/patientProfileValidation.js";

import {
  calculateAge,
  validateRegistrationAge,
} from "../utils/validations/ageValidation.js";

// Create Patient Profile
export const createPatientProfileService = async (profileData) => {
  const existingProfile = await getPatientProfileByUserId(profileData.user);

  if (existingProfile) {
    throw new Error("Patient profile already exists.");
  }

  return await createPatientProfile(profileData);
};

// Get Logged-in Patient Profile
export const getPatientProfileService = async (userId) => {
  const profile = await getPatientProfileByUserId(userId);

  if (!profile) {
    throw new Error("Patient profile not found.");
  }

  return profile;
};

// Update Patient Profile
export const updatePatientProfileService = async (userId, updateData) => {
  const profile = await getPatientProfileByUserId(userId);

  if (!profile) {
    throw new Error("Patient profile not found.");
  }

  // Validate Date of Birth
  if (updateData.dateOfBirth !== undefined) {
    const dobValidation = validateDateOfBirth(updateData.dateOfBirth);

    if (!dobValidation.isValid) {
      throw new Error(dobValidation.message);
    }

    const age = calculateAge(updateData.dateOfBirth);

    const ageValidation = validateRegistrationAge(age);

    if (!ageValidation.isValid) {
      throw new Error(ageValidation.message);
    }
  }

  // Validate Height
  if (updateData.height !== undefined) {
    const heightValidation = validateHeight(updateData.height);

    if (!heightValidation.isValid) {
      throw new Error(heightValidation.message);
    }
  }

  // Validate Weight
  if (updateData.weight !== undefined) {
    const weightValidation = validateWeight(updateData.weight);

    if (!weightValidation.isValid) {
      throw new Error(weightValidation.message);
    }
  }

  // Validate Address
  if (updateData.address !== undefined) {
    const addressValidation = validateAddress(updateData.address);

    if (!addressValidation.isValid) {
      throw new Error(addressValidation.message);
    }
  }

  return await updatePatientProfile(userId, updateData);
};

// Update Profile Image
export const updateProfileImageService = async (userId, imagePath) => {
  const profile = await getPatientProfileByUserId(userId);

  if (!profile) {
    throw new Error("Patient profile not found.");
  }

  return await updateProfileImage(userId, imagePath);
};