import express from "express";
import { protect, adminOnly } from "../middlewares/authMiddleware.js"; // Middleware to protect routes
import { getUsers, getUserById } from "../controllers/userController.js"; // Import user controller functions
const router = express.Router();

// User Management Routes
router.get("/", protect, getUsers); // Get all users (Available to all authenticated users for chat functionality)
router.get("/:id", protect, getUserById); // Get user by ID

export default router;