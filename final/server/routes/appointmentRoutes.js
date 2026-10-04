import express from "express";

import {
  getDoctorAvailability,
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  getAppointmentById,
  cancelAppointment,
  updateAppointmentStatus,
  getVideoAccess,
  rescheduleAppointment,
} from "../controllers/appointmentController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// All appointment routes require a logged-in user
router.use(authMiddleware);

// Check a doctor's open slots for a given date
router.get("/availability/:doctorId", getDoctorAvailability);

// Patient books an appointment
router.post("/", roleMiddleware("patient"), bookAppointment);

// Patient's own appointment history
router.get("/my", roleMiddleware("patient"), getMyAppointments);

// Admin/Doctor: list all appointments (supports ?doctorId=&status=&date=)
router.get("/", roleMiddleware("admin", "doctor"), getAllAppointments);

// Video room access is time-gated and role-gated on the server.
router.get("/:id/video-access", getVideoAccess);

// Single appointment (patient can only view their own - enforced in controller)
router.get("/:id", getAppointmentById);

// Patient may reschedule a confirmed appointment once.
router.patch("/:id/reschedule", roleMiddleware("patient"), rescheduleAppointment);

// Cancel appointment (patient - own only; admin/doctor - any)
router.patch("/:id/cancel", cancelAppointment);

// Admin/Doctor: confirm or complete an appointment
router.patch(
  "/:id/status",
  roleMiddleware("admin", "doctor"),
  updateAppointmentStatus
);

export default router;
