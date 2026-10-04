import express from "express";

import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPatientPrescriptions,
  getAppointmentPrescription,
  updatePrescription,
  deletePrescription,
} from "../controllers/prescriptionController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  validateCreatePrescription,
  validateUpdatePrescription,
} from "../middleware/prescriptionValidation.js";

const router = express.Router();

// All prescription routes require authentication
router.use(authMiddleware);

// Doctor/Admin: Create Prescription
router.post(
  "/",
  roleMiddleware("doctor", "admin"),
  validateCreatePrescription,
  createPrescription
);

// Admin: View All Prescriptions
router.get(
  "/",
  roleMiddleware("admin", "doctor"),
  getAllPrescriptions
);

// Patient/Admin: View Patient Prescription History
router.get(
  "/patient/:patientId",
  roleMiddleware("patient", "admin", "doctor"),
  getPatientPrescriptions
);

// Doctor/Admin: View Prescription By Appointment
router.get(
  "/appointment/:appointmentId",
  roleMiddleware("doctor", "admin"),
  getAppointmentPrescription
);

// Logged-in User: View Prescription By Id
router.get(
  "/:id",
  getPrescriptionById
);

// Doctor/Admin: Update Prescription
router.put(
  "/:id",
  roleMiddleware("doctor", "admin"),
  validateUpdatePrescription,
  updatePrescription
);

// Admin: Delete Prescription
router.delete(
  "/:id",
  roleMiddleware("admin"),
  deletePrescription
);

export default router;