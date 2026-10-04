import express from "express";

import {
  uploadMedicalRecord,
  getMyMedicalRecords,
  getMedicalRecordById,
  getAppointmentMedicalRecords,
  getAllMedicalRecords,
  verifyMedicalRecord,
  deleteMedicalRecord,
} from "../controllers/medicalRecordController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import uploadMedicalRecordMiddleware from "../middleware/uploadMedicalRecord.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/*
==========================================
Patient Routes
==========================================
*/

// Upload previous medical record
router.post(
  "/upload",
  roleMiddleware("patient"),
  uploadMedicalRecordMiddleware.single("medicalRecord"),
  uploadMedicalRecord
);

// Patient's own records
router.get(
  "/my",
  roleMiddleware("patient"),
  getMyMedicalRecords
);

// Records for one appointment
router.get(
  "/appointment/:appointmentId",
  getAppointmentMedicalRecords
);

// Single medical record
router.get(
  "/:id",
  getMedicalRecordById
);

// Delete own medical record
router.delete(
  "/:id",
  deleteMedicalRecord
);

/*
==========================================
Doctor Routes
==========================================
*/

// Verify medical record
router.patch(
  "/verify/:id",
  roleMiddleware("doctor"),
  verifyMedicalRecord
);

/*
==========================================
Admin Routes
==========================================
*/

// View all records
router.get(
  "/",
  roleMiddleware("admin", "doctor"),
  getAllMedicalRecords
);

export default router;