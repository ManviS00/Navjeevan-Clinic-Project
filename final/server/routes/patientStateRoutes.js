import express from "express";

import {
  createPatientState,
  getPatientState,
  updatePatientState,
} from "../controllers/patientStateController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Patient State
router.post("/", authMiddleware, createPatientState);

// Get Logged-in Patient State
router.get("/me", authMiddleware, getPatientState);
router.put("/me", authMiddleware, updatePatientState);

export default router;