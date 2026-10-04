import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    appointmentNumber: {
      type: String,
      unique: true,
      index: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    appointmentDate: {
      type: String,
      required: true,
    },

    timeSlot: {
      type: String,
      required: true,
      trim: true,
    },
    appointmentType: {
      type: String,
      enum: ["clinic", "video"],
      required: true,
    },

    hasPreviousMedicalRecords: {
      type: Boolean,
      default: false,
    },

    consultationReason: {
      type: String,
      required: true,
      trim: true,
    },

    meetingLink: {
      type: String,
      default: "",
    },

    videoReminderSentAt: { type: Date, default: null },

    meetingStatus: {
      type: String,
      enum: ["pending", "scheduled", "completed"],
      default: "pending",
    },
    uploadedReports: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MedicalRecord",
      },
    ],

    paymentStatus: {
      type: String,
      enum: ["paid", "unpaid", "failed"],
      default: "unpaid",
    },
    paymentAmount: {
      type: Number,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "netbanking", "wallet", "razorpay", "pay_at_clinic", ""],
      default: "",
    },
    transactionId: {
      type: String,
      default: "",
    },
    razorpayOrderId: {
      type: String,
      default: "",
      index: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    cancelReason: {
      type: String,
      trim: true,
      default: "",
    },

    cancelledBy: {
      type: String,
      enum: [
        "patient",
        "doctor",
        "admin",
        "",
      ],
      default: "",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    // A confirmed appointment can be rescheduled by the patient only once.
    rescheduleCount: { type: Number, default: 0, min: 0, max: 2 },
    rescheduledAt: { type: Date, default: null },
    originalAppointmentDate: { type: String, default: "" },
    originalTimeSlot: { type: String, default: "" },

    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
Prevent two active appointments
for the same doctor
at same date and time.
*/
appointmentSchema.index(
  {
    doctor: 1,
    appointmentDate: 1,
    timeSlot: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      status: {
        $in: ["pending", "confirmed"],
      },
    },
  }
);

export default mongoose.model(
  "Appointment",
  appointmentSchema
);
