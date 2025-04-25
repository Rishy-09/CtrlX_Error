import express from "express";
import { protect, restrictTo, authorizeRoles, adminOnly } from "../middlewares/authMiddleware.js";
import { 
  getBugs, 
  getBugById, 
  createBug, 
  updateBug, 
  deleteBug, 
  updateBugStatus, 
  updateBugChecklist, 
  getDashboardData,
  getUserDashboardData,
  assignBug,
  getBugAttachments,
  listBugsForProject,
  assignBugToDeveloper,
  listBugFixes
} from "../controllers/bugController.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import multer from "multer";

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Public routes (none for bugs - all require authentication)

// Protected routes (require authentication)
router.use(protect);

// Get dashboard data for authenticated user
router.get("/dashboard/user", getUserDashboardData);

// Routes for admins and developers
router.use("/dashboard", restrictTo("admin", "developer"));
router.get("/dashboard", getDashboardData);

// Project specific bug routes with role-based access
router.get('/project/:id/errors', protect, authorizeRoles('tester', 'admin'), listBugsForProject);
router.post('/project/:id/assign', protect, authorizeRoles('admin'), assignBugToDeveloper);
router.get('/bug-fixes', protect, authorizeRoles('developer'), listBugFixes);

// Bug CRUD operations
router.route("/")
  .get(getBugs)
  .post(uploadMiddleware.array("attachments", 5), createBug);

router.route("/:id")
  .get(getBugById)
  .put(uploadMiddleware.array("attachments", 5), updateBug)
  .delete(restrictTo("admin"), deleteBug);

// Bug status management
router.put("/:id/status", updateBugStatus);

// Bug checklist management
router.put("/:id/todo", updateBugChecklist);

// Bug assignment - restricted to admins and developers
router.put("/:id/assign", restrictTo("admin", "developer"), assignBug);

// Get bug attachments
router.get("/:id/attachments", getBugAttachments);

export default router; 