import express from "express";

import { addDoctor, 
    getAllDoctors, 
    getDoctorById, 
    updateDoctor,
    deleteDoctor, 
    updateDoctorStatus,
    getMyDoctorProfile,
} from "../controllers/doctorController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("admin"),
  addDoctor
);

router.get("/", getAllDoctors);
router.get("/me", authMiddleware, roleMiddleware("doctor", "admin"), getMyDoctorProfile);
router.get("/:id", getDoctorById);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("admin", "doctor"),
  updateDoctor
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("admin"),
  deleteDoctor
);

router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware("admin"),
  updateDoctorStatus
);

export default router;