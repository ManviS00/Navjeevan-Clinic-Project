import express from "express";

import {
  createFertility,
  getMyFertilityLogs,
  getFertilityById,
  updateFertility,
  deleteFertility,
  getFertilityPrediction,
  getFertilityAnalytics,
} from "../controllers/fertilityController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Fertility Log
router.post("/", authMiddleware, createFertility);

// Get Prediction
router.get(
  "/prediction",
  authMiddleware,
  getFertilityPrediction
);

// Get Analytics
router.get(
  "/analytics",
  authMiddleware,
  getFertilityAnalytics
);

// Get My Logs
router.get(
  "/my",
  authMiddleware,
  getMyFertilityLogs
);

// Get Single Log
router.get(
  "/:id",
  authMiddleware,
  getFertilityById
);

// Update Log
router.put(
  "/:id",
  authMiddleware,
  updateFertility
);

// Delete Log
router.delete(
  "/:id",
  authMiddleware,
  deleteFertility
);

export default router;