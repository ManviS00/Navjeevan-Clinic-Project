import mongoose from "mongoose";
const healthEntrySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true, index:true },
  kind: { type:String, enum:["weight","medication","nutrition","symptom"], required:true, index:true },
  logDate: { type:String, required:true },
  data: { type:mongoose.Schema.Types.Mixed, default:{} },
}, {timestamps:true});
healthEntrySchema.index({user:1,kind:1,logDate:1});
export default mongoose.model("HealthEntry",healthEntrySchema);
