import express from "express";
import multer from "multer";
import { reportBug, getAllBugs, getBugById, updateBug, deleteBug } from "../controllers/bugController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";   // imported rbac middlware
import { getBugHistory } from "../controllers/bugHistoryController.js";

const router = express.Router();

// 🔹 Configure Multer for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// 🔹 Bug Routes
router.post("/", authMiddleware,  upload.array("attachments", 3), reportBug);  // all users can report bugs
router.get("/", authMiddleware, getAllBugs);    // all users can view the bugs
router.get("/:id", authMiddleware, getBugById);   // all  users can view a single bug
router.get("/:bugId/history", authMiddleware, getBugHistory);   // all users can view the history of a bug

router.put("/:id", authMiddleware, roleMiddleware("Admin", "Developer"), updateBug);    // only Admins & Developers can update bugs
router.delete("/:id", authMiddleware, roleMiddleware("Admin"), deleteBug);     // only admin can delete bugs

export default router;
