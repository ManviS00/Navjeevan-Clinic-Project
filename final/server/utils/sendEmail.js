import dotenv from "dotenv";
dotenv.config();
import nodemailer from "nodemailer";

const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
  ? nodemailer.createTransport({ host: process.env.EMAIL_HOST || "smtp.gmail.com", port: Number(process.env.EMAIL_PORT || 587), secure: String(process.env.EMAIL_SECURE || "false") === "true", auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } })
  : null;

export const sendOTPEmail = async (email, otp) => {
  if (!transporter) {
    console.warn(`[DEV OTP EMAIL] ${email}: ${otp}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || `"Navjeevan Clinic" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Navjeevan Clinic - OTP Verification",
    html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px"><h2 style="color:#c51e3a">Navjeevan Clinic</h2><p>Your verification OTP is:</p><div style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</div><p>This OTP is valid for 5 minutes. Do not share it with anyone.</p></div>`,
  });
};

export default sendOTPEmail;
