import express from "express";

import authMiddleware  from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  getAdminDashboard,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

// Admin Dashboard
router.get(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  getAdminDashboard
);

export default router;