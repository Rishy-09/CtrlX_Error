import express from "express";
import rateLimit from "express-rate-limit";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Rate Limiter: max of 30 comment posts per minute per IP
const commentLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute in milliseconds
    max: 30,
    message: "Too many comment requests from this IP, please try again after a minute."
})

// Add a Comment
router.post("/:bugId", authMiddleware, commentLimiter, addComment);

// Get Comments for a Bug
router.get("/:bugId", authMiddleware, getComments);

// Delete a Comment (Only the author can delete)
router.delete("/:commentId", authMiddleware, deleteComment);

export default router;
