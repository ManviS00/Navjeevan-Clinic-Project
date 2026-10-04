import dotenv from "dotenv";
dotenv.config();

if (!process.env.MONGODB_URI) { throw new Error("MONGODB_URI is required."); }
if (!process.env.JWT_SECRET || (process.env.NODE_ENV === "production" && process.env.JWT_SECRET === "change-this-secret-in-production")) {
  throw new Error("Set a strong JWT_SECRET before running in production.");
}

import app from "./app.js";
import connectDB from "./config/db.js";
import Appointment from "./models/Appointment.js";
import { sendVideoReminderNotification } from "./utils/notificationService.js";

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server Running on Port ${PORT}`);
});

async function sendDueVideoReminders() {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone:"Asia/Kolkata", year:"numeric", month:"2-digit", day:"2-digit", hour:"2-digit", minute:"2-digit", hourCycle:"h23" }).formatToParts(new Date());
    const v = Object.fromEntries(parts.filter(p=>p.type!=="literal").map(p=>[p.type,p.value]));
    const date = `${v.year}-${v.month}-${v.day}`;
    const minutes = Number(v.hour)*60 + Number(v.minute);
    const list = await Appointment.find({ appointmentDate:date, status:"confirmed", videoReminderSentAt:null }).populate("patient","fullName email phone notificationPreference").populate("doctor","fullName");
    for (const appointment of list) {
      const m = String(appointment.timeSlot||"").match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!m) continue;
      let hour = Number(m[1]); if (hour===12) hour=0; if (m[3].toUpperCase()==="PM") hour+=12;
      const diff = (hour*60 + Number(m[2])) - minutes;
      if (diff <= 30 && diff >= 29) {
        await sendVideoReminderNotification({ user: appointment.patient, appointment });
        appointment.videoReminderSentAt = new Date();
        await appointment.save();
      }
    }
  } catch (error) { console.error("Video reminder job failed:", error.message); }
}
setInterval(sendDueVideoReminders, 60000);
void sendDueVideoReminders();
