import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  getDoctorDashboard,
} from "../controllers/doctorDashboardController.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("doctor"),
  getDoctorDashboard
);

export default router;