import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const emailConfigured = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);
const emailTransporter = emailConfigured
  ? nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || "false") === "true",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })
  : null;

const smsConfigured = Boolean(
  process.env.TWILIO_ACCOUNT_SID &&
  process.env.TWILIO_AUTH_TOKEN &&
  (process.env.TWILIO_MESSAGING_SERVICE_SID || process.env.TWILIO_FROM_NUMBER)
);

const clinicName = "Navjeevan Clinic";
const normalizePhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("91") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return String(phone).startsWith("+") ? String(phone) : `+${digits}`;
};

export const sendEmail = async ({ to, subject, html }) => {
  if (!to) return { sent: false, channel: "email", reason: "missing-recipient" };
  if (!emailTransporter) {
    console.warn(`[EMAIL NOT CONFIGURED] ${to} | ${subject}`);
    return { sent: false, channel: "email", reason: "not-configured" };
  }
  await emailTransporter.sendMail({
    from: process.env.EMAIL_FROM || `"${clinicName}" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  return { sent: true, channel: "email" };
};

export const sendSMS = async ({ to, body }) => {
  const phone = normalizePhone(to);
  if (!phone) return { sent: false, channel: "phone", reason: "missing-recipient" };
  if (!smsConfigured) {
    console.warn(`[SMS NOT CONFIGURED] ${phone} | ${body}`);
    return { sent: false, channel: "phone", reason: "not-configured" };
  }

  const params = new URLSearchParams();
  params.set("To", phone);
  if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
    params.set("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
  } else {
    params.set("From", process.env.TWILIO_FROM_NUMBER);
  }
  params.set("Body", body);

  const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || `Twilio SMS failed (${response.status})`);
  return { sent: true, channel: "phone", sid: data.sid };
};

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;").replace(/'/g, "&#039;");

export const notificationPreference = (value) => ["email", "phone", "both"].includes(value) ? value : "both";

export const sendNotification = async ({ user, preference, emailSubject, emailHtml, smsBody }) => {
  const selected = notificationPreference(preference || user?.notificationPreference);
  const results = [];
  // Notification failure must never roll back an appointment/payment/account action.
  if ((selected === "email" || selected === "both") && user?.email) {
    try { results.push(await sendEmail({ to: user.email, subject: emailSubject, html: emailHtml })); }
    catch (error) { console.error("Email notification failed:", error.message); results.push({ sent: false, channel: "email", error: error.message }); }
  }
  if ((selected === "phone" || selected === "both") && user?.phone) {
    try { results.push(await sendSMS({ to: user.phone, body: smsBody })); }
    catch (error) { console.error("SMS notification failed:", error.message); results.push({ sent: false, channel: "phone", error: error.message }); }
  }
  return results;
};

export const appointmentNotification = ({ user, appointment, type }) => {
  const patientName = escapeHtml(user?.fullName || "Patient");
  const doctorName = escapeHtml(appointment?.doctor?.fullName || "Dr. Aayushi Pal");
  const serviceName = escapeHtml(appointment?.service?.name || "Consultation");
  const number = escapeHtml(appointment?.appointmentNumber || "");
  const date = escapeHtml(appointment?.appointmentDate || "");
  const time = escapeHtml(appointment?.timeSlot || "");
  const reason = escapeHtml(appointment?.cancelReason || "");
  const base = `${clinicName} | Appointment ${appointment?.appointmentNumber || ""}`;
  let subject = base;
  let sms = "";
  let title = "Appointment Update";
  let message = "";

  if (type === "booked") {
    title = "Appointment Request Received";
    message = `Your appointment request has been received and is pending clinic confirmation.`;
    sms = `Navjeevan Clinic: Appointment ${appointment?.appointmentNumber} requested for ${appointment?.appointmentDate} at ${appointment?.timeSlot} with ${appointment?.doctor?.fullName || "Dr. Aayushi Pal"}. Status: Pending confirmation.`;
    subject = "Navjeevan Clinic - Appointment Request Received";
  } else if (type === "confirmed") {
    title = "Appointment Confirmed";
    message = `Your appointment is confirmed. Please arrive on time and carry any relevant medical records.`;
    sms = `Navjeevan Clinic: Appointment ${appointment?.appointmentNumber} is CONFIRMED for ${appointment?.appointmentDate} at ${appointment?.timeSlot} with ${appointment?.doctor?.fullName || "Dr. Aayushi Pal"}.`;
    subject = "Navjeevan Clinic - Appointment Confirmed";
  } else if (type === "cancelled") {
    title = "Appointment Cancelled";
    message = `Your appointment has been cancelled.${reason ? ` Reason: ${reason}` : ""}`;
    sms = `Navjeevan Clinic: Appointment ${appointment?.appointmentNumber} for ${appointment?.appointmentDate} at ${appointment?.timeSlot} has been CANCELLED.${appointment?.cancelReason ? ` Reason: ${appointment.cancelReason}` : ""}`;
    subject = "Navjeevan Clinic - Appointment Cancelled";
  } else if (type === "completed") {
    title = "Appointment Completed";
    message = `Your appointment has been marked completed. Thank you for choosing Navjeevan Clinic.`;
    sms = `Navjeevan Clinic: Appointment ${appointment?.appointmentNumber} has been marked completed. Thank you for choosing Navjeevan Clinic.`;
    subject = "Navjeevan Clinic - Appointment Completed";
  } else if (type === "payment") {
    title = "Payment Successful";
    message = `Your payment has been verified and your appointment is confirmed.`;
    sms = `Navjeevan Clinic: Payment received for appointment ${appointment?.appointmentNumber}. Your appointment is CONFIRMED for ${appointment?.appointmentDate} at ${appointment?.timeSlot}.`;
    subject = "Navjeevan Clinic - Payment Confirmed";
  }

  const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#f8f6f3;padding:24px"><div style="max-width:620px;margin:auto;background:#fff;border-radius:16px;padding:28px;border:1px solid #eee"><h2 style="color:#c51e3a;margin-top:0">${escapeHtml(clinicName)}</h2><h3>${escapeHtml(title)}</h3><p>Dear ${patientName},</p><p>${escapeHtml(message)}</p><table cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse"><tr><td><b>Appointment</b></td><td>${number}</td></tr><tr><td><b>Doctor</b></td><td>${doctorName}</td></tr><tr><td><b>Service</b></td><td>${serviceName}</td></tr><tr><td><b>Date</b></td><td>${date}</td></tr><tr><td><b>Time</b></td><td>${time}</td></tr></table><p style="margin-top:24px;color:#666">For help, contact Navjeevan Clinic.</p></div></body></html>`;
  return { subject, html, sms };
};

export const sendWelcomeNotification = async ({ user }) => sendNotification({
  user,
  emailSubject: "Welcome to Navjeevan Clinic",
  emailHtml: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:28px"><h2 style="color:#c51e3a">Welcome to Navjeevan Clinic</h2><p>Dear ${escapeHtml(user?.fullName || "Patient")},</p><p>Your patient account has been created successfully.</p><p>You can now book appointments and manage your clinic records from your patient dashboard.</p><p><b>Registered email:</b> ${escapeHtml(user?.email || "")}</p><p><b>Registered phone:</b> ${escapeHtml(user?.phone || "")}</p></div>`,
  smsBody: `Welcome to Navjeevan Clinic, ${user?.fullName || "Patient"}. Your patient account has been created successfully. You can now book and manage appointments from your dashboard.`,
});


export const sendVideoReminderNotification = async ({ user, appointment }) => {
  const patientName = user?.fullName || "Patient";
  const date = appointment?.appointmentDate || "";
  const time = appointment?.timeSlot || "";
  const sms = `Hello ${patientName}, this is a reminder from Navjeevan Clinic. Your appointment is on ${date} at ${time}. Please arrive on time. Thank you.`;
  return sendNotification({
    user,
    preference: "both",
    emailSubject: "Navjeevan Clinic - Appointment Reminder",
    emailHtml: `<div style="font-family:Arial,sans-serif;max-width:620px;margin:auto;padding:28px"><h2 style="color:#c51e3a">Navjeevan Clinic</h2><h3>Appointment Reminder</h3><p>Hello ${escapeHtml(patientName)},</p><p>This is a reminder from Navjeevan Clinic. Your appointment is on <b>${escapeHtml(date)}</b> at <b>${escapeHtml(time)}</b>. Please arrive on time. Thank you.</p></div>`,
    smsBody: sms,
  });
};
