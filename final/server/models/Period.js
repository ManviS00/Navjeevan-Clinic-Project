import mongoose from "mongoose";

const periodSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    periodLength: {
      type: Number,
      required: true,
      min: 2,
      max: 10,
    },

    cycleLength: {
      type: Number,
      required: true,
      min: 21,
      max: 45,
    },

    nextExpectedPeriod: {
      type: Date,
      required: true,
    },

    ovulationDate: {
      type: Date,
      required: true,
    },

    fertileWindowStart: {
      type: Date,
      required: true,
    },

    fertileWindowEnd: {
      type: Date,
      required: true,
    },

    flow: {
      type: String,
      enum: ["light", "medium", "heavy"],
      default: "medium",
    },

    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Period", periodSchema);