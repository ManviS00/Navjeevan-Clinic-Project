import mongoose from "mongoose";

const patientStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Current Health Status
    isPregnant: {
      type: Boolean,
      default: false,
    },

    pregnancyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Pregnancy",
      default: null,
    },

    // Period Status
    hasActivePeriod: {
      type: Boolean,
      default: false,
    },

    activePeriodId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Period",
      default: null,
    },

    // Fertility
    isFertilityWindow: {
      type: Boolean,
      default: false,
    },

    fertilityWindowStart: {
      type: Date,
      default: null,
    },

    fertilityWindowEnd: {
      type: Date,
      default: null,
    },

    ovulationDate: {
      type: Date,
      default: null,
    },

    // Pregnancy Recovery
    isRecoveryPeriod: {
      type: Boolean,
      default: false,
    },

    recoveryEndDate: {
      type: Date,
      default: null,
    },

    // Current Eligibility (cached state)
    canUsePeriodTracker: {
      type: Boolean,
      default: true,
    },

    canUsePregnancyTracker: {
      type: Boolean,
      default: false,
    },

    canUseFertilityTracker: {
      type: Boolean,
      default: false,
    },

    canUseWellnessTracker: {
      type: Boolean,
      default: true,
    },

    // Dashboard
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PatientState", patientStateSchema);