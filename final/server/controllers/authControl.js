import bcrypt from "bcrypt";
import User from "../models/User.js";
import PatientProfile from "../models/PatientProfile.js";
import generateToken from "../utils/generateToken.js";

import otpGenerator from "otp-generator";
import OTP from "../models/OTP.js";
import { sendOTPEmail } from "../utils/sendEmail.js";
import { sendWelcomeNotification } from "../utils/notificationService.js";

import { createPatientProfileService } from "../services/patientProfileService.js";
import { createPatientStateService } from "../services/patientStateService.js";
import { validateDateOfBirth, validateAddress } from "../utils/validations/patientProfileValidation.js";
import { calculateAge, validateRegistrationAge } from "../utils/validations/ageValidation.js";

// Test API
export const testAuth = async (req, res) => {
  res.json({
    success: true,
    message: "Auth Controller Working Successfully",
  });
};

// Register API
export const registerUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      notificationPreference = "email",
    } = req.body;

    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPhone = String(phone || "").replace(/\D/g, "");

    if (!fullName || !normalizedEmail || !normalizedPhone || !password || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit phone number.",
      });
    }

    if (notificationPreference !== "email") {
      return res.status(400).json({
        success: false,
        message: "Email is the only supported OTP and appointment notification method.",
      });
    }

    // Registration is allowed only after the OTP sent for this email/phone
    // has been successfully verified. The old implementation also searched
    // for a notificationPreference field that did not exist in the OTP model,
    // which caused every valid OTP to be rejected at registration time.
    const verifiedOTP = await OTP.findOne({
      email: normalizedEmail,
      phone: normalizedPhone,
      isVerified: true,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!verifiedOTP) {
      return res.status(400).json({
        success: false,
        message: "Please verify your OTP before registering.",
      });
    }

    const dobValidation = validateDateOfBirth(dateOfBirth);
    if (!dobValidation.isValid) {
      return res.status(400).json({ success: false, message: dobValidation.message });
    }

    const age = calculateAge(dateOfBirth);
    const ageValidation = validateRegistrationAge(age);
    if (!ageValidation.isValid) {
      return res.status(400).json({ success: false, message: ageValidation.message });
    }

    if (gender && !["Male", "Female", "Other"].includes(gender)) {
      return res.status(400).json({ success: false, message: "Invalid gender." });
    }

    if (address) {
      const addressValidation = validateAddress(address);
      if (!addressValidation.isValid) {
        return res.status(400).json({ success: false, message: addressValidation.message });
      }
    }

    const [existingPhone, existingEmail] = await Promise.all([
      User.findOne({ phone: normalizedPhone }),
      User.findOne({ email: normalizedEmail }),
    ]);

    if (existingPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number already registered. Please log in instead.",
      });
    }

    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please log in instead.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      gender: gender || "Female",
      dateOfBirth: new Date(dateOfBirth),
      isVerified: true,
      notificationPreference,
      failedLoginAttempts: 0,
      loginLockedUntil: null,
    });

    await createPatientProfileService({
      user: newUser._id,
      dateOfBirth: new Date(dateOfBirth),
      address: {
        city: address?.city?.trim() || "",
        state: address?.state?.trim() || "",
        country: address?.country?.trim() || "India",
        pincode: address?.pincode?.trim() || "",
      },
    });

    await createPatientStateService(newUser._id);

    // The OTP has served its purpose; remove it so it cannot be reused.
    await OTP.deleteMany({ email: normalizedEmail });

    const token = generateToken(newUser);

    // Welcome email/SMS is sent according to the preference selected during signup.
    await sendWelcomeNotification({ user: newUser }).catch((error) =>
      console.error("Welcome notification failed:", error.message)
    );

    return res.status(201).json({
      success: true,
      message: "User Registered Successfully",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        date_of_birth: newUser.dateOfBirth
          ? newUser.dateOfBirth.toISOString().slice(0, 10)
          : null,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { identifier, phone, email, password } = req.body;
    const rawIdentifier = identifier || email || phone || "";
    const value = String(rawIdentifier).trim();

    if (!value || !password) {
      return res.status(400).json({
        success: false,
        message: "Email/Phone and Password are required",
      });
    }

    const isEmail = value.includes("@");
    const normalizedIdentifier = isEmail
      ? value.toLowerCase()
      : value.replace(/\D/g, "");

    if (isEmail && !/^\S+@\S+\.\S+$/.test(normalizedIdentifier)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address or 10-digit phone number.",
      });
    }

    if (!isEmail && !/^\d{10}$/.test(normalizedIdentifier)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address or 10-digit phone number.",
      });
    }

    const user = await User.findOne(
      isEmail
        ? { email: normalizedIdentifier }
        : { phone: normalizedIdentifier }
    );

    // Do not reveal whether an email/phone is registered.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email/phone or password.",
      });
    }

    const now = new Date();
    if (user.loginLockedUntil && user.loginLockedUntil > now) {
      const remainingMinutes = Math.max(
        1,
        Math.ceil((user.loginLockedUntil.getTime() - now.getTime()) / 60000)
      );
      return res.status(423).json({
        success: false,
        message: `Too many failed login attempts. Please try again after ${remainingMinutes} minute(s).`,
        lockedUntil: user.loginLockedUntil,
      });
    }

    // Automatically clear an expired lock.
    if (user.loginLockedUntil && user.loginLockedUntil <= now) {
      user.loginLockedUntil = null;
      user.failedLoginAttempts = 0;
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

      if (user.failedLoginAttempts >= 3) {
        user.loginLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        user.failedLoginAttempts = 0;
        await user.save();

        return res.status(423).json({
          success: false,
          message: "Three incorrect login attempts reached. Your account is locked for 15 minutes.",
          lockedUntil: user.loginLockedUntil,
        });
      }

      const attemptsLeft = 3 - user.failedLoginAttempts;
      await user.save();

      return res.status(401).json({
        success: false,
        message: `Invalid email/phone or password. ${attemptsLeft} attempt(s) remaining.`,
        attemptsLeft,
      });
    }

    // Successful login resets the failed-attempt counter.
    user.failedLoginAttempts = 0;
    user.loginLockedUntil = null;
    await user.save();

    const token = generateToken(user);

    return res.status(200).json({
      success: true,
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        date_of_birth: user.dateOfBirth
          ? user.dateOfBirth.toISOString().slice(0, 10)
          : null,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const sendOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const delivery = "email";
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPhone = String(phone || "").replace(/\D/g, "");

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }
    if (!/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({ success: false, message: "A valid 10-digit phone number is required." });
    }

    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email or phone already registered. Please log in instead.",
      });
    }

    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    await OTP.deleteMany({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }],
    });

    await OTP.create({
      email: normalizedEmail,
      phone: normalizedPhone,
      otp,
      delivery,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      isVerified: false,
    });

    // OTP verification is email-only for patient registration.
    await sendOTPEmail(normalizedEmail, otp);

    return res.status(200).json({
      success: true,
      message: "OTP sent to your registered email address.",
      delivery: "email",
    });
  } catch (error) {
    console.error("OTP Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, phone, otp } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPhone = String(phone || "").replace(/\D/g, "");
    const normalizedOTP = String(otp || "").trim();

    if (!normalizedEmail || !/^\d{6}$/.test(normalizedOTP)) {
      return res.status(400).json({
        success: false,
        message: "Email and a valid 6-digit OTP are required.",
      });
    }

    const query = {
      email: normalizedEmail,
      otp: normalizedOTP,
      isVerified: false,
      expiresAt: { $gt: new Date() },
    };

    if (normalizedPhone) query.phone = normalizedPhone;

    const otpRecord = await OTP.findOne(query).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid or has expired. Please request a new OTP.",
      });
    }

    otpRecord.isVerified = true;
    await otpRecord.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now complete registration.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update authenticated patient's date of birth
export const updateDateOfBirth = async (req, res) => {
  try {
    const { date_of_birth } = req.body;

    if (!date_of_birth) {
      return res.status(400).json({
        success: false,
        message: "Date of birth is required",
      });
    }

    const dob = new Date(`${date_of_birth}T00:00:00.000Z`);
    if (Number.isNaN(dob.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date of birth",
      });
    }

    const today = new Date();
    if (dob > today) {
      return res.status(400).json({
        success: false,
        message: "Date of birth cannot be in the future",
      });
    }

    let age = today.getUTCFullYear() - dob.getUTCFullYear();
    const monthDiff = today.getUTCMonth() - dob.getUTCMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getUTCDate() < dob.getUTCDate())) {
      age--;
    }

    if (age < 9) {
      return res.status(400).json({
        success: false,
        message: "You must be at least 9 years old to use this app.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { dateOfBirth: dob },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await PatientProfile.findOneAndUpdate(
      { user: user._id },
      { dateOfBirth: dob },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email || "",
        date_of_birth: user.dateOfBirth ? user.dateOfBirth.toISOString().slice(0, 10) : null,
        age,
      },
    });
  } catch (error) {
    console.error("Update DOB Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = (email || "").trim().toLowerCase();
    if (!normalizedEmail) return res.status(400).json({ success:false, message:"Email is required." });
    const user = await User.findOne({ email: normalizedEmail });
    // Do not reveal whether an account exists.
    if (!user) return res.json({ success:true, message:"If the account exists, a reset code has been sent." });
    const otp = otpGenerator.generate(6,{upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false});
    user.passwordResetToken = otp;
    user.passwordResetExpires = new Date(Date.now()+10*60*1000);
    await user.save();
    try { await sendOTPEmail(normalizedEmail, otp); } catch(e) { console.error("Password reset email:", e.message); }
    res.json({success:true,message:"If the account exists, a reset code has been sent."});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};

export const resetPassword = async (req,res) => {
  try {
    const { email, otp, password } = req.body;
    if (!email || !otp || !password || password.length < 6) return res.status(400).json({success:false,message:"Email, 6-digit code and a password of at least 6 characters are required."});
    const user = await User.findOne({email:email.trim().toLowerCase(),passwordResetToken:otp,passwordResetExpires:{$gt:new Date()}});
    if(!user) return res.status(400).json({success:false,message:"Invalid or expired reset code."});
    user.password = await bcrypt.hash(password,10);
    user.passwordResetToken = null; user.passwordResetExpires = null;
    await user.save();
    res.json({success:true,message:"Password reset successfully."});
  } catch(e){ res.status(500).json({success:false,message:e.message}); }
};
