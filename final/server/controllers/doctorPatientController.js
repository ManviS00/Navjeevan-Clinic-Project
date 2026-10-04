import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User.js";
import PatientProfile from "../models/PatientProfile.js";
import Doctor from "../models/Doctor.js";
import Appointment from "../models/Appointment.js";

const calculatePatientAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());

  if (beforeBirthday) age -= 1;
  return age >= 0 ? age : null;
};

const publicPatient = (user, profile = null) => ({
  id: user._id.toString(),
  name: user.fullName,
  // The signup DOB is stored on User. PatientProfile may also contain a DOB,
  // so use it when present and fall back to the signup DOB. This keeps the
  // patient profile and appointment views in sync and updates automatically
  // when the patient's birthday passes.
  age: calculatePatientAge(profile?.dateOfBirth ?? user.dateOfBirth),
  gender: user.gender || "Female",
  phone: user.phone || null,
  email: user.email || null,
  address: profile?.address
    ? [profile.address.city, profile.address.state, profile.address.country].filter(Boolean).join(", ")
    : user.address || null,
  photo_url: profile?.profileImage || user.profileImage || null,
  medical_history: null,
  current_medicines: null,
  notes: null,
  last_visit: null,
  created_at: user.createdAt,
});

export async function listPatients(req, res) {
  let patientFilter = { role: "patient" };
  if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user.id, isDeleted: false }).select("_id");
    if (!doctor) return res.status(404).json({ message: "Doctor profile not found" });
    const patientIds = await Appointment.distinct("patient", { doctor: doctor._id });
    patientFilter = { role: "patient", _id: { $in: patientIds } };
  }
  const users = await User.find(patientFilter).sort({ createdAt: -1 });
  const ids = users.map(u => u._id);
  const profiles = await PatientProfile.find({ user: { $in: ids } });
  const map = new Map(profiles.map(p => [p.user.toString(), p]));
  res.json(users.map(u => publicPatient(u, map.get(u._id.toString()))));
}

export async function getPatient(req, res) {
  const user = await User.findOne({ _id: req.params.id, role: "patient" });
  if (!user) return res.status(404).json({ message: "Patient not found" });
  if (req.user.role === "doctor") {
    const doctor = await Doctor.findOne({ user: req.user.id, isDeleted: false }).select("_id");
    const assigned = doctor && await Appointment.exists({ doctor: doctor._id, patient: user._id });
    if (!assigned) return res.status(403).json({ message: "Patient is not assigned to this doctor" });
  }
  const profile = await PatientProfile.findOne({ user: user._id });
  res.json(publicPatient(user, profile));
}

export async function createPatient(req, res) {
  const { name, age, gender, phone, email, address } = req.body;
  if (!name || !phone) return res.status(400).json({ message: "Name and phone are required" });
  if (await User.findOne({ phone })) return res.status(409).json({ message: "Phone already registered" });

  const password = crypto.randomBytes(12).toString("hex");
  const user = await User.create({
    fullName: name,
    phone,
    email: email || "",
    password: await bcrypt.hash(password, 10),
    gender: gender || "Female",
    role: "patient",
    isVerified: true,
    address: address || "",
  });

  let dateOfBirth = null;
  if (age && Number(age) > 0) {
    const d = new Date();
    d.setFullYear(d.getFullYear() - Number(age));
    dateOfBirth = d;
  }
  const profile = await PatientProfile.create({ user: user._id, dateOfBirth });
  res.status(201).json(publicPatient(user, profile));
}

export async function updatePatient(req, res) {
  const user = await User.findOne({ _id: req.params.id, role: "patient" });
  if (!user) return res.status(404).json({ message: "Patient not found" });
  const { name, phone, email, gender, address } = req.body;
  if (name !== undefined) user.fullName = name;
  if (phone !== undefined) user.phone = phone;
  if (email !== undefined) user.email = email;
  if (gender !== undefined) user.gender = gender;
  if (address !== undefined) user.address = address;
  await user.save();
  const profile = await PatientProfile.findOne({ user: user._id });
  res.json(publicPatient(user, profile));
}

export async function deletePatient(req, res) {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, role: "patient" },
    { role: "patient", isVerified: false },
    { new: true }
  );
  if (!user) return res.status(404).json({ message: "Patient not found" });
  res.json({ ok: true });
}
