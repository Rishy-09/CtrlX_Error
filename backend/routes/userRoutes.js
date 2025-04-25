import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js"; // Middleware to protect routes
import { getUsers, getUserById, updateNotificationSettings } from "../controllers/userController.js"; // Import user controller functions
const router = express.Router();

// User Management Routes
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id/notification-settings", protect, updateNotificationSettings);

export default router;