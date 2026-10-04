import mongoose from "mongoose";
const chatMessageSchema = new mongoose.Schema({
  conversation: { type: mongoose.Schema.Types.ObjectId, ref: "ChatConversation", required: true, index: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true, trim: true },
  matchedEntryId: { type: String, default: null },
}, { timestamps: true });
export default mongoose.model("ChatMessage", chatMessageSchema);
