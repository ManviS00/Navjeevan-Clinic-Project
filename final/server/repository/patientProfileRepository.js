import PatientProfile from "../models/PatientProfile.js";

// Create Patient Profile
export const createPatientProfile = async (profileData) => {
  return await PatientProfile.create(profileData);
};

// Get Patient Profile by User ID
export const getPatientProfileByUserId = async (userId) => {
  return await PatientProfile.findOne({ user: userId }).populate(
    "user",
    "fullName email phone"
  );
};

// Update Patient Profile
export const updatePatientProfile = async (userId, updateData) => {
  return await PatientProfile.findOneAndUpdate(
    { user: userId },
    { $set: updateData },
    {
      new: true,
      runValidators: true,
    }
  ).populate("user", "fullName email phone");
};

// Update Profile Image
export const updateProfileImage = async (userId, imagePath) => {
  return await PatientProfile.findOneAndUpdate(
    { user: userId },
    {
      $set: {
        profileImage: imagePath,
      },
    },
    {
      new: true,
    }
  );
};

// Delete Patient Profile (if ever needed)
export const deletePatientProfile = async (userId) => {
  return await PatientProfile.findOneAndDelete({ user: userId });
};