import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      default: null,
    },

    // Stores who uploaded the record (role)
    uploadedBy: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      required: true,
    },

    recordType: {
      type: String,
      enum: [
        "lab-report",
        "prescription",
        "ultrasound",
        "xray",
        "ct-scan",
        "mri",
        "ecg",
        "vaccination",
        "discharge-summary",
        "referral-letter",
        "other",
      ],
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    // Example: /uploads/medical-records/abc123.pdf
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    // Stored in bytes
    fileSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    mimeType: {
      type: String,
      required: true,
      trim: true,
    },

    // SHA-256 hash used to detect duplicate files
    fileHash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    reviewedByDoctor: {
      type: Boolean,
      default: false,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for patient's records sorted by latest
medicalRecordSchema.index({
  patient: 1,
  createdAt: -1,
});

// Index for appointment lookup
medicalRecordSchema.index({
  appointment: 1,
});

// Index for active records
medicalRecordSchema.index({
  patient: 1,
  isDeleted: 1,
});

export default mongoose.model("MedicalRecord", medicalRecordSchema);