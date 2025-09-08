import express from "express";
import { protect, adminOnly, authorizeRoles } from "../middlewares/authmiddleware.js"; // Middleware to protect routes
import { getUsers, getUserById, getDevelopers } from "../controllers/userController.js"; // Import user controller functions
const router = express.Router();

// User Management Routes
router.get("/", protect, adminOnly, getUsers); // Get all users (Admin only)
router.get("/developers", protect, authorizeRoles("admin", "tester"), getDevelopers); // Get developers (Admin and Tester)
router.get("/:id", protect, getUserById); // Get user by ID

export default router;