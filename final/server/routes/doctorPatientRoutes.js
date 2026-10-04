import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { listPatients, getPatient, createPatient, updatePatient, deletePatient } from "../controllers/doctorPatientController.js";

const router = express.Router();
router.use(authMiddleware, roleMiddleware("doctor", "admin"));
router.get("/", listPatients);
router.get("/:id", getPatient);
router.post("/", createPatient);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);
export default router;
