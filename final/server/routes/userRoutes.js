import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { profile } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, profile);

export default router;