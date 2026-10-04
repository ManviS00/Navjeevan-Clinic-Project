import express from "express";

import {
  createPeriod,
  getMyPeriods,
  getPeriodById,
  updatePeriod,
  deletePeriod,
} from "../controllers/periodController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// Create Period
router.post("/", createPeriod);

// Get My Periods
router.get("/my", getMyPeriods);

// Get Single Period
router.get("/:id", getPeriodById);

// Update Period
router.put("/:id", updatePeriod);

// Soft Delete Period
router.delete("/:id", deletePeriod);

export default router;