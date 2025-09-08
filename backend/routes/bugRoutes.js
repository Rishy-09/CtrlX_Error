import express from 'express';
import {
  protect,
  adminOnly,
  testerOnly,
  developerOnly,
} from '../middlewares/authmiddleware.js';

import {
  getBugs,
  getBugById,
  createBug,
  updateBug,
  deleteBug,
  updateBugStatus,
  updateBugChecklist,
  getAdminDashboardData,
  getTesterDashboardData,
  getDeveloperDashboardData,
  getAllViewableBugs,
  getAssignedBugs
} from '../controllers/bugController.js';

const router = express.Router();

// DASHBOARD ROUTES
router.get("/admin-dashboard", protect, adminOnly, getAdminDashboardData);
router.get("/tester-dashboard", protect, testerOnly, getTesterDashboardData);
router.get("/developer-dashboard", protect, developerOnly, getDeveloperDashboardData);

// BUG ROUTES
router.get("/", protect, getBugs); // Admin sees all, testers see own, developers see assigned
router.get("/all-viewable", protect, getAllViewableBugs); // Get all bugs that the user has permission to view
router.get("/user/:userId", protect, getBugs); // Add this line for getting bugs by user ID
router.get("/assigned", protect, developerOnly, getAssignedBugs); // Get bugs assigned to the developer
router.get("/:id", protect, getBugById); // Bug details

router.post("/", protect, testerOnly, createBug); // Only testers can report bugs

router.put("/:id", protect, updateBug); // All roles can update limited fields

router.delete("/:id", protect, adminOnly, deleteBug); // Only admins can delete bugs

router.put("/:id/status", protect, developerOnly, updateBugStatus); // Developers update bug status

router.put("/:id/checklist", protect, developerOnly, updateBugChecklist); // Developers update checklist

export default router;


// Dashboards are role-specific.
// Only testers can create bugs.
// Only developers can change status or checklist.
// Admins have full delete access and dashboard view.
// General GET and PUT routes are protected but accessible according to context/role in your controller.