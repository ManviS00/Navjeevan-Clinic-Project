import mongoose from "mongoose";

const patientProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["female"],
      default: "female",
    },

    height: {
      type: Number,
      default: null,
      min: [1, "Height must be greater than 0"],
    },

    weight: {
      type: Number,
      default: null,
      min: [1, "Weight must be greater than 0"],
    },

    address: {
      city: {
        type: String,
        trim: true,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        default: "",
      },

      country: {
        type: String,
        trim: true,
        default: "",
      },

      pincode: {
        type: String,
        trim: true,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

const PatientProfile = mongoose.model(
  "PatientProfile",
  patientProfileSchema
);

export default PatientProfile;