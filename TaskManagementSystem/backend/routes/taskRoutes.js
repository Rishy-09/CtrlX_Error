import express from 'express';
import { protect, adminOnly } from '../middlewares/authmiddleware.js';
import {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
  addTaskComment,
  getTaskComments,
  startTimeTracking,
  stopTimeTracking,
  getTimeEntries,
  addTaskDependency,
  removeTaskDependency,
  getTaskDependencies
} from '../controllers/taskController.js';
const router = express.Router();

// Task Mamnagement Routes
router.get("/dashboard-data", protect, getDashboardData);
router.get("/user-dashboard-data", protect, getUserDashboardData);
router.get("/", protect, getTasks); // Get all tasks (Admin: all, User: assigned)
router.get("/:id", protect, getTaskById); // Get task by ID
router.post("/", protect, adminOnly, createTask); // Create a task (Admin only)
router.put("/:id", protect, updateTask); // Update task details
router.delete("/:id", protect, adminOnly, deleteTask); // Delete a task (Admin only)
router.put("/:id/status", protect, updateTaskStatus); // Update task status
router.put("/:id/todo", protect, updateTaskChecklist); // Update task checklist

// Task Comments Routes
router.post("/:id/comments", protect, addTaskComment); // Add comment to a task
router.get("/:id/comments", protect, getTaskComments); // Get task comments

// Task Time Tracking Routes
router.post("/:id/time/start", protect, startTimeTracking); // Start time tracking
router.put("/:id/time/stop", protect, stopTimeTracking); // Stop time tracking
router.get("/:id/time", protect, getTimeEntries); // Get time entries

// Task Dependencies Routes
router.post("/:id/dependencies", protect, adminOnly, addTaskDependency); // Add dependency
router.delete("/:id/dependencies/:dependencyId", protect, adminOnly, removeTaskDependency); // Remove dependency
router.get("/:id/dependencies", protect, getTaskDependencies); // Get dependencies

export default router;
