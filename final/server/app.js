import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import medicalRecordRoutes from "./routes/medicalRecordRoutes.js";
import adminDashboardRoutes from "./routes/adminDashboardRoutes.js";
import doctorDashboardRoutes from "./routes/doctorDashboardRoutes.js";
import doctorPatientRoutes from "./routes/doctorPatientRoutes.js";
import patientDashboardRoutes from "./routes/patientDashboardRoutes.js";
import patientProfileRoutes from "./routes/patientProfileRoutes.js";
import patientStateRoutes from "./routes/patientStateRoutes.js";
import periodRoutes from "./routes/periodRoutes.js";
import fertilityRoutes from "./routes/fertilityRoutes.js";
import pregnancyRoutes from "./routes/pregnancyRoutes.js";
import wellnessRoutes from "./routes/wellnessRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { paymentWebhook } from "./controllers/paymentController.js";
import assistantRoutes from "./routes/assistantRoutes.js";
import healthRoutes from "./routes/healthRoutes.js"

const app = express();
app.disable("x-powered-by");

// Lightweight production hardening without changing application features.
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "geolocation=(), microphone=(self), camera=(self)");
  next();
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
const allowedOrigins = String(process.env.CLIENT_URL || process.env.ALLOWED_ORIGINS || "")
  .split(",").map(v => v.trim()).filter(Boolean);
app.use(cors({
  origin(origin, callback) {
    if (!origin || process.env.NODE_ENV !== "production" || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed by CORS."));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
// Razorpay signs the exact raw request body. This webhook must be registered
// before express.json() parses the body.
app.post("/api/payments/webhook", express.raw({ type: "application/json" }), paymentWebhook);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Basic in-memory throttling for authentication, OTP and AI endpoints. For
// multi-server production deployments, replace this with Redis/API-gateway rate limiting.
const rateBuckets = new Map();
app.use((req, res, next) => {
  const sensitive = req.path.startsWith("/api/auth/") || req.path === "/api/assistant/chat";
  if (!sensitive) return next();
  const key = `${req.ip || req.socket.remoteAddress}:${req.path}`;
  const now = Date.now();
  const windowMs = 60 * 1000;
  const limit = req.path.startsWith("/api/auth/") ? 30 : 20;
  const bucket = rateBuckets.get(key) || { start: now, count: 0 };
  if (now - bucket.start >= windowMs) { bucket.start = now; bucket.count = 0; }
  bucket.count += 1;
  rateBuckets.set(key, bucket);
  if (bucket.count > limit) return res.status(429).json({ success: false, message: "Too many requests. Please wait a minute and try again." });
  next();
});
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Navjeevan Clinic Backend API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/prescriptions", prescriptionRoutes);
app.use("/api/medical-records",medicalRecordRoutes);
app.use("/api/dashboard/admin", adminDashboardRoutes);
app.use("/api/dashboard/doctor", doctorDashboardRoutes);
app.use("/api/doctor-patients", doctorPatientRoutes);
app.use("/api/dashboard/patient",patientDashboardRoutes);
app.use("/api/patient-profile", patientProfileRoutes);
app.use("/api/patient-state", patientStateRoutes);
app.use("/api/periods", periodRoutes);
app.use("/api/fertility",fertilityRoutes);
app.use("/api/pregnancy", pregnancyRoutes);
app.use("/api/wellness", wellnessRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/assistant", assistantRoutes);
app.use("/api/health", healthRoutes);

app.use((req, res) => res.status(404).json({ success:false, message:`Route not found: ${req.method} ${req.originalUrl}` }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ success:false, message:err.message || "Internal server error" });
});
export default app;
