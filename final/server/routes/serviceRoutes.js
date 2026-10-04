import express from "express";
import {
  createService,
  getActiveServices,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../controllers/serviceController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

// Create Service (Admin only)
router.post("/", authMiddleware, roleMiddleware("admin"), createService);

// Get Active Services (Public)
router.get("/", getActiveServices);

// Get All Services (Admin only)
router.get("/all", authMiddleware, roleMiddleware("admin"), getAllServices);

// Get Service By ID (Public)
router.get("/:id", getServiceById);

// Update Service (Admin only)
router.put("/:id", authMiddleware, roleMiddleware("admin"), updateService);

// Soft Delete Service (Admin only)
router.delete("/:id", authMiddleware, roleMiddleware("admin"), deleteService);

export default router;
