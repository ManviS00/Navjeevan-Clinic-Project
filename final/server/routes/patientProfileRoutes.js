import express from "express";

import {
  getMyProfile,
  updateMyProfile,
  uploadProfileImage,
} from "../controllers/patientProfileController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";
import uploadProfileImageMiddleware from "../middleware/uploadProfileImage.js";

const router = express.Router();

// Get Logged-in Patient Profile
router.get(
  "/me",
  authMiddleware,
  roleMiddleware("patient"),
  getMyProfile
);

// Update Logged-in Patient Profile
router.put(
  "/me",
  authMiddleware,
  roleMiddleware("patient"),
  updateMyProfile
);

// Upload Profile Image
router.post(
  "/upload-image",
  authMiddleware,
  roleMiddleware("patient"),
  uploadProfileImageMiddleware,
  uploadProfileImage
);

export default router;