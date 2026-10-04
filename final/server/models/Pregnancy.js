import mongoose from "mongoose";


const pregnancySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },


    // Pregnancy Details
    lastMenstrualPeriod: {
      type: Date,
      required: true,
    },


    expectedDeliveryDate: {
      type: Date,
      required: true,
    },


    pregnancyWeek: {
      type: Number,
      required: true,
      min: 1,
      max: 42,
    },


    pregnancyDay: {
      type: Number,
      required: true,
      min: 1,
      max: 7,
    },


    pregnancyStatus: {
      type: String,
      enum: [
        "Active",
        "Completed",
        "Cancelled",
      ],
      default: "Active",
    },


    // Baby Information
    babyDetails: {
      babyCount: {
        type: Number,
        default: 1,
        min: 1,
      },

      babyName: {
        type: String,
        trim: true,
        default: "",
      },
    },


    // Current Health Tracking
    currentWeight: {
      type: Number,
      min: 20,
      max: 200,
      default: null,
    },


    hydration: {
      glasses: {
        type: Number,
        min: 0,
        default: 0,
      },

      target: {
        type: Number,
        default: 8,
      },
    },


    nutrition: {
      mealsCompleted: {
        type: Number,
        min: 0,
        default: 0,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },
    },


    // Symptoms Tracking
    symptoms: [
      {
        name: {
          type: String,
          enum: [
            "Nausea",
            "Vomiting",
            "Fatigue",
            "Back Pain",
            "Headache",
            "Swelling",
            "Heartburn",
            "Constipation",
            "Dizziness",
            "Other",
          ],
        },

        severity: {
          type: String,
          enum: [
            "Mild",
            "Moderate",
            "Severe",
          ],
          default: "Mild",
        },

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],


    // Medication Tracking
    medications: [
      {
        medicineName: {
          type: String,
          required: true,
          trim: true,
        },

        dosage: {
          type: String,
          trim: true,
        },

        frequency: {
          type: String,
          trim: true,
        },

        startDate: {
          type: Date,
        },

        endDate: {
          type: Date,
        },
      },
    ],

    // Pregnancy Timeline
    timeline: [
      {
        week: {
          type: Number,
        },

        title: {
          type: String,
          trim: true,
        },

        description: {
          type: String,
          trim: true,
        },

        completed: {
          type: Boolean,
          default: false,
        },

        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],


    // Doctor appointments related to pregnancy
    appointments: [
      {
        appointment: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Appointment",
        },

        notes: {
          type: String,
          trim: true,
          default: "",
        },
      },
    ],


    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);


export default mongoose.model(
  "Pregnancy",
  pregnancySchema
);