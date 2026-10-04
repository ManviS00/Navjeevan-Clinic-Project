import authMiddleware from "../middleware/authMiddleware.js";
import express from "express";

import {
  testAuth,
  registerUser,
  loginUser,
  sendOTP,
  verifyOTP,
  updateDateOfBirth,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authControl.js";
const router = express.Router();

router.get("/test", testAuth);

router.post("/register", registerUser);

router.post("/login", loginUser);

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

router.put("/dob", authMiddleware, updateDateOfBirth);
router.post("/request-password-reset", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;