import express from "express";

import {
  createWellnessLog,
  getMyWellnessLogs,
  getWellnessLogById,
  updateWellnessLog,
  deleteWellnessLog,
} from "../controllers/wellnessController.js";

import authMiddleware from "../middleware/authMiddleware.js";


const router = express.Router();


// Patient wellness routes

// Create daily wellness entry
router.post(
  "/log",
  authMiddleware,
  createWellnessLog
);


// Get my wellness history
router.get(
  "/my-logs",
  authMiddleware,
  getMyWellnessLogs
);


// Get single wellness entry
router.get(
  "/:id",
  authMiddleware,
  getWellnessLogById
);


// Update wellness entry
router.put(
  "/:id",
  authMiddleware,
  updateWellnessLog
);


// Delete wellness entry
router.delete(
  "/:id",
  authMiddleware,
  deleteWellnessLog
);


export default router;