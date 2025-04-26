import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  createChat,
  getChats,
  getChatById,
  updateChat,
  updateParticipants,
  deleteChat,
  sendMessage,
  getMessages,
  deleteMessage,
  addReaction,
  deleteReaction
} from "../controllers/chatController.js";
import uploadMiddleware from "../middlewares/uploadMiddleware.js";
import { normalizeChatIdParam } from "../middlewares/paramMiddleware.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// Chat routes
router.route("/")
  .get(getChats)
  .post(createChat);

router.route("/:id")
  .get(getChatById)
  .put(updateChat)
  .delete(deleteChat);

// Participant management
router.put("/:id/participants", updateParticipants);

// Message routes - use normalizeChatIdParam to handle parameter name mismatch
router.route("/:id/messages")
  .get(normalizeChatIdParam, getMessages)
  .post(normalizeChatIdParam, uploadMiddleware.array("attachments", 5), sendMessage);

router.delete("/:id/messages/:messageId", normalizeChatIdParam, deleteMessage);

// Reactions - use normalizeChatIdParam to handle parameter name mismatch
router.post("/:id/messages/:messageId/reactions", normalizeChatIdParam, addReaction);
router.delete("/:id/messages/:messageId/reactions/:reactionId", normalizeChatIdParam, deleteReaction);

export default router; 