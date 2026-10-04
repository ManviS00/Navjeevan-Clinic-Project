import mongoose from "mongoose";
const chatConversationSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  title: { type: String, default: null },
}, { timestamps: true });
export default mongoose.model("ChatConversation", chatConversationSchema);
