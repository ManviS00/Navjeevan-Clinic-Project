import mongoose from "mongoose";

const fertilitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    period: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Period",
      default: null,
    },

    logDate: {
      type: Date,
      default: Date.now,
    },

    cervicalMucus: {
      type: String,
      enum: [
        "Dry",
        "Sticky",
        "Creamy",
        "Watery",
        "Egg White",
      ],
      default: "Dry",
    },

    ovulationTest: {
      type: String,
      enum: [
        "Not Taken",
        "Negative",
        "Positive",
      ],
      default: "Not Taken",
    },

    symptoms: [
      {
        type: String,
        enum: [
          "Mild Cramps",
          "Breast Tenderness",
          "Bloating",
          "Headache",
          "Fatigue",
          "Back Pain",
          "Mood Swings",
          "Increased Libido",
          "Spotting",
          "None",
          "Other",
        ],
      },
    ],

    notes: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    pregnancyConfirmed: {
      type: Boolean,
      default: false,
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

export default mongoose.model("Fertility", fertilitySchema);