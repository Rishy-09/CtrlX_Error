import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createReminder,
  getUserReminders,
  markReminderAsRead,
  deleteReminder,
} from "../controllers/reminderController.js";

const router = express.Router();

// Reminder routes
router.post("/", protect, createReminder);
router.get("/", protect, getUserReminders);
router.put("/:id/read", protect, markReminderAsRead);
router.delete("/:id", protect, deleteReminder);

export default router;
