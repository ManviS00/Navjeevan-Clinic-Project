import express from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

import {
  getPatientDashboard,
} from "../controllers/patientDashboardController.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  roleMiddleware("patient"),
  getPatientDashboard
);

export default router;