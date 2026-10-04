import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const phone = "9000000001";
  const email = "doctor@navjeevanclinic.com";
  const existing = await User.findOne({ $or: [{ phone }, { email }] });

  if (existing) {
    console.log("Doctor already exists:", existing.email || existing.phone);
    await mongoose.disconnect();
    return;
  }

  const password = "Doctor@123";
  const user = await User.create({
    fullName: "Dr. Aayushi Pal",
    email,
    phone,
    password: await bcrypt.hash(password, 10),
    role: "doctor",
    isVerified: true,
  });

  await Doctor.create({
    user: user._id,
    fullName: "Dr. Aayushi Pal",
    email,
    phone,
    qualification: "MBBS, MS (OBG & GYNAE), DNB",
    specialization: "Consultant Obstetrician & Gynaecologist",
    experience: 10,
    consultationFee: 800,
    registrationNumber: "NVC-DOC-001",
    bio: "Lead Obstetrician & Gynaecologist at Navjeevan Clinic.",
    availableDays: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
    availableSlots: ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","03:00 PM","03:30 PM","04:00 PM","04:30 PM","05:00 PM"],
  });

  console.log("Doctor created.");
  console.log("Login phone:", phone);
  console.log("Login password:", password);
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
