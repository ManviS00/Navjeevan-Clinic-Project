import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import { createOrder, verifyPayment, payAtClinic, getPaymentStatus } from "../controllers/paymentController.js";

const router = express.Router();
const patientOnly = [authMiddleware, roleMiddleware("patient")];

router.post("/:appointmentId/order", ...patientOnly, createOrder);
router.post("/:appointmentId/verify", ...patientOnly, verifyPayment);
router.post("/:appointmentId/pay-at-clinic", ...patientOnly, payAtClinic);
router.get("/:appointmentId/status", ...patientOnly, getPaymentStatus);

export default router;
