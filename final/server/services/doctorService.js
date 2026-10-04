import bcrypt from "bcrypt";
import Doctor from "../models/Doctor.js";
import User from "../models/User.js";

export const addDoctorService = async (doctorData) => {
    const {
        fullName,
        email,
        phone,
        password,
        qualification,
        specialization,
        experience,
        consultationFee,
        registrationNumber,
        bio,
        availableDays,
        availableSlots,
      } = doctorData;

  // Check existing email
  const existingUser = await User.findOne({
    $or: [
      { email },
      { phone },
    ],
  });

  if (existingUser) {
    throw new Error("A user with this email or phone already exists.");
  }

  // Check registration number
  const existingRegistration = await Doctor.findOne({
    registrationNumber,
  });
  
  if (existingRegistration) {
    throw new Error("Registration number already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    fullName,
    email,
    phone,
    password: hashedPassword,
    role: "doctor",
    isVerified: true,
  });

  const doctor = await Doctor.create({
    user: user._id,
    fullName,
    email,
    phone,
    qualification,
    specialization,
    experience,
    consultationFee,
    registrationNumber,
    bio,
    availableDays: 
    availableDays && availableDays.length > 0
      ? availableDays
      : [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],

    availableSlots:
    availableSlots && availableSlots.length > 0
      ? availableSlots
      : [
          "09:00 AM",
          "09:30 AM",
          "10:00 AM",
          "10:30 AM",
          "11:00 AM",
          "11:30 AM",
          "12:00 PM",
          "12:30 PM",
          "03:00 PM",
          "03:30 PM",
          "04:00 PM",
          "04:30 PM",
          "05:00 PM",
          "05:30 PM",
        ],
  });

  return {user, doctor,};
};

export const getAllDoctorsService = async () => {
  const doctors = await Doctor.find({
    status: true,
    isDeleted: false,
    }).sort({
        createdAt: -1,
  });

  return doctors;
};

export const getDoctorByIdService = async (doctorId) => {
  const doctor = await Doctor.findById(doctorId);

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return doctor;
};

export const updateDoctorService = async (doctorId, doctorData) => {
  const allowed = ["fullName", "qualification", "specialization", "experience", "consultationFee", "bio", "profileImage", "availableDays", "availableSlots"];
  const updates = Object.fromEntries(Object.entries(doctorData || {}).filter(([key, value]) => allowed.includes(key) && value !== undefined));
  const doctor = await Doctor.findByIdAndUpdate(doctorId, updates, { new: true, runValidators: true });
  if (!doctor) throw new Error("Doctor not found");
  if (updates.fullName) await User.findByIdAndUpdate(doctor.user, { fullName: updates.fullName });
  return doctor;
};

export const deleteDoctorService = async (doctorId) => {
  const doctor = await Doctor.findByIdAndUpdate(
    doctorId,
    {
      isDeleted: true,
      status: false,
    },
    {
      new: true,
    }
  );

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return doctor;
};

export const updateDoctorStatusService = async (doctorId, status) => {
  const doctor = await Doctor.findOne({
    _id: doctorId,
    isDeleted: false,
  });

  if (!doctor) {
    throw new Error("Doctor not found or has been deleted");
  }

  doctor.status = status;
  await doctor.save();

  return doctor;
};