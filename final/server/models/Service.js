import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      unique: true,
      maxlength: 100,
      validate: {
        validator: function (value) {
          return value.trim().length > 0;
        },
        message: "Service name cannot be empty",
      },
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    consultationFee: {
      type: Number,
      required: [true, "Consultation fee is required"],
      min: [0, "Consultation fee cannot be negative"],
    },

    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [5, "Minimum duration is 5 minutes"],
    },
    consultationType: {
      clinic: {
        type: Boolean,
        default: true,
      },
      video: {
        // Both clinic and video consultation are offered by default so
        // patients always see both options when booking.
        type: Boolean,
        default: true,
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

serviceSchema.index({ name: 1 });

export default mongoose.model("Service", serviceSchema);