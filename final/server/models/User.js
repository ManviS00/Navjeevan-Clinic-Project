import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Female",
    },

    dateOfBirth: Date,

    address: String,

    profileImage: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    notificationPreference: {
      type: String,
      enum: ["email", "phone", "both"],
      default: "email",
    },

    // Login protection: lock the account after 3 consecutive failed attempts.
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    loginLockedUntil: {
      type: Date,
      default: null,
    },

    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", userSchema);