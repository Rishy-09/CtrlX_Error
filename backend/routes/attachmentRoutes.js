import express from "express";
import {
  uploadAttachments,
  getAttachment,
  deleteAttachment,
  downloadAttachment,
} from "../controllers/attachmentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  },
});

// Initialize multer upload
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|xls|xlsx|ppt|pptx|zip/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Unsupported file type!'));
    }
  },
});

// Apply authentication middleware to all routes
router.use(protect);

// Upload attachments
router.post('/upload', upload.array("files", 5), uploadAttachments);

// Get attachment by ID
router.get('/:id', getAttachment);

// Delete attachment
router.delete('/:id', deleteAttachment);

// Download attachment
router.get('/download/:id', downloadAttachment);

export default router; 