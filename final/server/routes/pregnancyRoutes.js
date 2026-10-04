import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";

import {
  createPregnancy,
  getActivePregnancy,
  getMyPregnancies,
  getPregnancyById,
  updatePregnancy,
  deletePregnancy,
  completePregnancy,
  getPregnancyAnalytics,
} from "../controllers/pregnancyController.js";

const router = express.Router();

// Create Pregnancy
router.post("/", authMiddleware, createPregnancy);

// Active Pregnancy
router.get(
  "/active",
  authMiddleware,
  getActivePregnancy
);

// Analytics
router.get(
  "/analytics",
  authMiddleware,
  getPregnancyAnalytics
);

// My Pregnancies
router.get(
  "/my",
  authMiddleware,
  getMyPregnancies
);

// Get By ID
router.get(
  "/:id",
  authMiddleware,
  getPregnancyById
);

// Update
router.put(
  "/:id",
  authMiddleware,
  updatePregnancy
);

// Complete
router.patch(
  "/:id/complete",
  authMiddleware,
  completePregnancy
);

// Delete
router.delete(
  "/:id",
  authMiddleware,
  deletePregnancy
);

export default router;