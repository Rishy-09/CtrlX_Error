import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  getCommentReplies
} from "../controllers/commentController.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Comment routes
router.route("/")
  .post(uploadMiddleware.array("attachments", 5), addComment);

router.route("/:bugId")
  .get(getComments);

router.route("/:id")
  .put(uploadMiddleware.array("attachments", 5), updateComment)
  .delete(deleteComment);

// Get replies to a comment
router.get("/:id/replies", getCommentReplies);

export default router; 