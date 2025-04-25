import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Bug from "../models/Bug.js";
import Attachment from "../models/Attachment.js";
import axios from "axios";
import dotenv from "dotenv";
import asyncHandler from "express-async-handler";

dotenv.config();

// @desc    Create a new chat
// @route   POST /api/chats
// @access  Private
const createChat = asyncHandler(async (req, res) => {
  const { name, description, chatType, participants, associatedBug, aiAssistant } = req.body;

  // Validate chat type
  if (!["public", "team", "private", "ai_assistant"].includes(chatType)) {
    res.status(400);
    throw new Error("Invalid chat type");
  }

  // For private chats, ensure at least one other participant
  if (chatType === "private" && (!participants || participants.length === 0)) {
    res.status(400);
    throw new Error("Private chats require at least one other participant");
  }

  // If associated with a bug, verify bug exists
  if (associatedBug) {
    const bugExists = await Bug.findById(associatedBug);
    if (!bugExists) {
      res.status(404);
      throw new Error("Associated bug not found");
    }
  }

  // Create chat
  const chat = await Chat.create({
    name,
    description: description || "",
    chatType,
    participants: [...new Set([req.user._id, ...(participants || [])])], // Ensure unique participants
    admins: [req.user._id], // Creator is admin by default
    associatedBug: associatedBug || null,
    aiAssistant: aiAssistant || { enabled: false }
  });

  // Populate user info
  const populatedChat = await Chat.findById(chat._id)
    .populate("participants", "name email profileImageURL")
    .populate("admins", "name email profileImageURL")
    .populate("associatedBug", "title status");

  res.status(201).json(populatedChat);
});

// @desc    Get all chats for logged in user
// @route   GET /api/chats
// @access  Private
const getChats = asyncHandler(async (req, res) => {
  const { type } = req.query;

  let filter = {};
  
  // If type is public, get all public chats
  if (type === "public") {
    filter = { chatType: "public" };
  } 
  // If type is specified but not public, filter by type and user participation
  else if (type && ["team", "private", "ai_assistant"].includes(type)) {
    filter = {
      participants: req.user._id,
      chatType: type
    };
  } 
  // If no type specified, get all user's chats plus all public chats
  else {
    filter = {
      $or: [
        { participants: req.user._id },
        { chatType: "public" }
      ]
    };
  }

  const chats = await Chat.find(filter)
    .populate("participants", "name email profileImageURL")
    .populate("admins", "name email profileImageURL")
    .populate("associatedBug", "title status")
    .sort({ updatedAt: -1 });

  // For each chat, get the last message and unread count
  const chatsWithMetadata = await Promise.all(chats.map(async (chat) => {
    const lastMessage = await Message.findOne({ chat: chat._id, isDeleted: false })
      .sort({ createdAt: -1 })
      .populate("sender", "name profileImageURL");

    const unreadCount = await Message.countDocuments({
      chat: chat._id,
      "readBy.user": { $ne: req.user._id },
      sender: { $ne: req.user._id },
      isDeleted: false
    });

    return {
      ...chat._doc,
      lastMessage: lastMessage || null,
      unreadCount
    };
  }));

  res.json(chatsWithMetadata);
});

// @desc    Get single chat by id
// @route   GET /api/chats/:id
// @access  Private
const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate("participants", "name email profileImageURL")
    .populate("admins", "name email profileImageURL")
    .populate("associatedBug", "title status")
    .populate({
      path: "messages",
      options: { sort: { createdAt: -1 } },
      populate: {
        path: "sender",
        select: "name email profileImageURL"
      }
    });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  // Allow access if chat is public OR user is a participant
  const isPublic = chat.chatType === "public";
  const isParticipant = chat.participants.some(p => p._id.toString() === req.user._id.toString());
  
  if (!isPublic && !isParticipant) {
    res.status(403);
    throw new Error("You don't have permission to access this chat");
  }

  // Mark all messages as read by this user
  await Message.updateMany(
    { 
      chat: chat._id, 
      "readBy.user": { $ne: req.user._id },
      sender: { $ne: req.user._id }
    },
    { 
      $addToSet: { 
        readBy: { 
          user: req.user._id, 
          readAt: new Date() 
        } 
      } 
    }
  );

  res.json(chat);
});

// @desc    Update chat
// @route   PUT /api/chats/:id
// @access  Private (admin only)
const updateChat = asyncHandler(async (req, res) => {
  const { name, description, participants, admins, aiAssistant } = req.body;
  
  const chat = await Chat.findById(req.params.id);
  
  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }
  
  // Check if user is an admin
  if (!chat.admins.includes(req.user._id)) {
    res.status(403);
    throw new Error("Only chat admins can update chat settings");
  }
  
  // Update fields
  if (name) chat.name = name;
  if (description !== undefined) chat.description = description;
  if (participants) chat.participants = [...new Set(participants)]; // Ensure unique
  if (admins) chat.admins = [...new Set(admins)]; // Ensure unique
  if (aiAssistant) chat.aiAssistant = { ...chat.aiAssistant, ...aiAssistant };
  
  await chat.save();
  
  const updatedChat = await Chat.findById(chat._id)
    .populate("participants", "name email profileImageURL")
    .populate("admins", "name email profileImageURL")
    .populate("associatedBug", "title status");
  
  res.json(updatedChat);
});

// @desc    Add/remove participants
// @route   PUT /api/chats/:id/participants
// @access  Private (admin only)
const updateParticipants = asyncHandler(async (req, res) => {
  const { add, remove } = req.body;
  
  if ((!add || !add.length) && (!remove || !remove.length)) {
    res.status(400);
    throw new Error("Please provide participants to add or remove");
  }
  
  const chat = await Chat.findById(req.params.id);
  
  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }
  
  // Check if user is an admin
  if (!chat.admins.includes(req.user._id)) {
    res.status(403);
    throw new Error("Only chat admins can manage participants");
  }
  
  // Add participants
  if (add && add.length) {
    // Verify all users exist
    const userIds = await User.find({ _id: { $in: add } }).select("_id");
    const validIds = userIds.map(u => u._id.toString());
    
    // Add valid users
    const newParticipants = [...chat.participants];
    validIds.forEach(id => {
      if (!newParticipants.includes(id)) {
        newParticipants.push(id);
      }
    });
    
    chat.participants = newParticipants;
  }
  
  // Remove participants
  if (remove && remove.length) {
    chat.participants = chat.participants.filter(
      p => !remove.includes(p.toString())
    );
    
    // Also remove from admins if present
    chat.admins = chat.admins.filter(
      a => !remove.includes(a.toString())
    );
  }
  
  await chat.save();
  
  const updatedChat = await Chat.findById(chat._id)
    .populate("participants", "name email profileImageURL")
    .populate("admins", "name email profileImageURL");
  
  res.json(updatedChat);
});

// @desc    Delete chat
// @route   DELETE /api/chats/:id
// @access  Private (admin only)
const deleteChat = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id);
  
  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }
  
  // Check if user is an admin
  if (!chat.admins.includes(req.user._id)) {
    res.status(403);
    throw new Error("Only chat admins can delete the chat");
  }
  
  // Delete all messages in the chat
  await Message.deleteMany({ chat: chat._id });
  
  // Delete the chat
  await chat.deleteOne();
  
  res.json({ message: "Chat deleted successfully" });
});

// @desc    Send a message to a chat
// @route   POST /api/chats/:chatId/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content, attachments } = req.body;
  
  if (!content && (!attachments || attachments.length === 0)) {
    res.status(400);
    throw new Error("Message must have content or attachments");
  }
  
  // Get the chat
  const chat = await Chat.findById(req.params.chatId);
  
  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }
  
  // Check if user is a participant or if it's a public chat
  const isParticipant = chat.participants.includes(req.user._id);
  const isPublicChat = chat.chatType === 'public';
  
  if (!isParticipant && !isPublicChat) {
    res.status(403);
    throw new Error("You are not a participant in this chat");
  }
  
  // Create message
  const message = await Message.create({
    sender: req.user._id,
    content,
    chat: req.params.chatId,
    readBy: [{ user: req.user._id }]
  });
  
  // Process attachments if any
  if (attachments && attachments.length > 0) {
    const savedAttachments = [];
    
    for (const file of attachments) {
      const attachment = await Attachment.create({
        filename: file.filename,
        originalname: file.originalname,
        contentType: file.contentType,
        size: file.size,
        url: file.url,
        uploader: req.user._id
      });
      
      savedAttachments.push(attachment._id);
    }
    
    message.attachments = savedAttachments;
    await message.save();
  }
  
  // Populate message data for response
  const populatedMessage = await Message.findById(message._id)
    .populate("sender", "name email profileImageURL")
    .populate({
      path: "attachments",
      select: "filename originalname contentType size url createdAt"
    });
  
  // Trigger AI response if the chat has an AI assistant enabled
  if (chat.aiAssistant && chat.aiAssistant.enabled) {
    // Process asynchronously so we don't block the response
    generateAIResponse(chat, content).catch(err => 
      console.error("Error generating AI response:", err)
    );
  }
  
  res.status(201).json(populatedMessage);
});

// @desc    Get messages from a chat
// @route   GET /api/chats/:chatId/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  
  // Get the chat
  const chat = await Chat.findById(req.params.chatId);
  
  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }
  
  // Check if user is a participant or if it's a public chat
  const isParticipant = chat.participants.includes(req.user._id);
  const isPublicChat = chat.chatType === 'public';
  
  if (!isParticipant && !isPublicChat) {
    res.status(403);
    throw new Error("You are not a participant in this chat");
  }
  
  // Calculate skip for pagination
  const skip = (parsedPage - 1) * parsedLimit;
  
  // Get message count for this chat
  const totalMessages = await Message.countDocuments({ 
    chat: req.params.chatId,
    isDeleted: { $ne: true } // Don't count deleted messages
  });
  
  // Get messages with pagination (newest first)
  const messages = await Message.find({ 
    chat: req.params.chatId,
    isDeleted: { $ne: true }
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit)
    .populate("sender", "name email profileImageURL")
    .populate({
      path: "attachments",
      select: "filename originalname contentType size url createdAt"
    })
    .populate("reactions.user", "name email profileImageURL");
  
  // Mark messages as read by this user
  if (messages.length > 0 && isParticipant) {
    const messageIds = messages.map(message => message._id);
    
    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        "readBy.user": { $ne: req.user._id }
      },
      { 
        $addToSet: { 
          readBy: { user: req.user._id, readAt: new Date() }
        }
      }
    );
  }
  
  // Return messages with pagination info
  res.json({
    messages,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      totalMessages,
      totalPages: Math.ceil(totalMessages / parsedLimit)
    }
  });
});

// @desc    Delete a message
// @route   DELETE /api/chats/:chatId/messages/:messageId
// @access  Private
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.messageId);
  
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  
  // Check if message belongs to the specified chat
  if (message.chat.toString() !== req.params.chatId) {
    res.status(400);
    throw new Error("Message does not belong to this chat");
  }
  
  // Check if user is sender or admin
  const chat = await Chat.findById(req.params.chatId);
  const isAdmin = chat.admins.includes(req.user._id);
  const isSender = message.sender.toString() === req.user._id.toString();
  
  if (!isAdmin && !isSender) {
    res.status(403);
    throw new Error("Not authorized to delete this message");
  }
  
  // Soft delete
  message.isDeleted = true;
  message.content = "This message has been deleted";
  await message.save();
  
  res.json({ message: "Message deleted successfully" });
});

// @desc    Add reaction to a message
// @route   POST /api/messages/:messageId/reactions
// @access  Private
const addReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  
  if (!emoji) {
    res.status(400);
    throw new Error("Emoji is required");
  }
  
  // Get the message
  const message = await Message.findById(req.params.messageId)
    .populate({
      path: "chat",
      select: "participants type"
    });
  
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  
  // Check if user is a participant or if it's a public chat
  const isParticipant = message.chat.participants.includes(req.user._id);
  const isPublicChat = message.chat.type === 'public';
  
  if (!isParticipant && !isPublicChat) {
    res.status(403);
    throw new Error("You are not a participant in this chat");
  }
  
  // Remove existing reaction from this user if any
  await Message.updateOne(
    { _id: message._id },
    { $pull: { reactions: { user: req.user._id } } }
  );
  
  // Add the new reaction
  const updatedMessage = await Message.findByIdAndUpdate(
    message._id,
    {
      $push: {
        reactions: {
          user: req.user._id,
          emoji
        }
      }
    },
    { new: true }
  ).populate("reactions.user", "name email profileImageURL");
  
  res.json(updatedMessage.reactions);
});

// @desc    Delete reaction from a message
// @route   DELETE /api/messages/:messageId/reactions/:reactionId
// @access  Private
const deleteReaction = asyncHandler(async (req, res) => {
  // Get the message
  const message = await Message.findById(req.params.messageId)
    .populate({
      path: "chat",
      select: "participants type"
    });
  
  if (!message) {
    res.status(404);
    throw new Error("Message not found");
  }
  
  // Check if user is a participant or if it's a public chat
  const isParticipant = message.chat.participants.includes(req.user._id);
  const isPublicChat = message.chat.type === 'public';
  
  if (!isParticipant && !isPublicChat) {
    res.status(403);
    throw new Error("You are not a participant in this chat");
  }
  
  // Find the reaction
  const reaction = message.reactions.id(req.params.reactionId);
  
  if (!reaction) {
    res.status(404);
    throw new Error("Reaction not found");
  }
  
  // Ensure user owns the reaction
  if (reaction.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("You can only delete your own reactions");
  }
  
  // Remove the reaction
  message.reactions.pull(req.params.reactionId);
  await message.save();
  
  res.json({ message: "Reaction removed" });
});

// Helper function to generate AI response using OpenRouter API
const generateAIResponse = async (chat, userMessage) => {
  try {
    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    
    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API key is not set");
      return;
    }
    
    // Get recent messages for context (up to 10)
    const recentMessages = await Message.find({ 
      chat: chat._id,
      isDeleted: false 
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("sender", "name");
    
    // Format messages for API
    const formattedMessages = recentMessages
      .reverse()
      .map(msg => ({
        role: msg.isAIMessage ? "assistant" : "user",
        content: msg.content,
        name: msg.sender.name
      }));
    
    // Add system message
    const messages = [
      {
        role: "system",
        content: chat.aiAssistant.systemPrompt || "You are a helpful AI assistant that helps the team solve technical issues."
      },
      ...formattedMessages
    ];
    
    // Call OpenRouter API
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: chat.aiAssistant.model || "openai/gpt-3.5-turbo",
        messages,
        max_tokens: 1000
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.REFERRER_URL || "https://taskmanagement.com"
        }
      }
    );
    
    // Create AI message
    if (response.data.choices && response.data.choices.length > 0) {
      const aiContent = response.data.choices[0].message.content;
      
      // Get AI user (create one if doesn't exist)
      let aiUser = await User.findOne({ email: "ai-assistant@system.local" });
      
      if (!aiUser) {
        aiUser = await User.create({
          name: "AI Assistant",
          email: "ai-assistant@system.local",
          password: "SYSTEM-GENERATED-" + Math.random().toString(36).substring(2),
          role: "admin" // Give admin role so it can participate in all chats
        });
      }
      
      // Create message
      await Message.create({
        chat: chat._id,
        sender: aiUser._id,
        content: aiContent,
        isAIMessage: true,
        readBy: [{ user: aiUser._id }]
      });
    }
  } catch (error) {
    console.error("Error generating AI response:", error.message);
  }
};

export {
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
}; 