import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    orderId: { type: String, required: true, unique: true, index: true },
    paymentId: { type: String, default: "", index: true, sparse: true },
    signature: { type: String, default: "" },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["created", "authorized", "captured", "failed", "refunded"], default: "created", index: true },
    method: { type: String, default: "" },
    failureReason: { type: String, default: "" },
    lastEvent: { type: String, default: "" },
  },
  { timestamps: true }
);

paymentSchema.index({ appointment: 1, status: 1 });

export default mongoose.model("Payment", paymentSchema);
