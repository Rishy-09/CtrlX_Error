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

// Message routes
router.route("/:id/messages")
  .get(getMessages)
  .post(uploadMiddleware.array("attachments", 5), sendMessage);

router.delete("/:chatId/messages/:messageId", deleteMessage);

// Reactions
router.post("/:chatId/messages/:messageId/reactions", addReaction);
router.delete("/:chatId/messages/:messageId/reactions/:reactionId", deleteReaction);

export default router; 