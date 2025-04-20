import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Bug from "../models/Bug.js";
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

  let filter = {
    participants: req.user._id
  };

  // Apply type filter if provided
  if (type && ["public", "team", "private", "ai_assistant"].includes(type)) {
    filter.chatType = type;
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

// @desc    Get single chat by ID
// @route   GET /api/chats/:id
// @access  Private
const getChatById = asyncHandler(async (req, res) => {
  const chat = await Chat.findById(req.params.id)
    .populate("participants", "name email profileImageURL")
    .populate("admins", "name email profileImageURL")
    .populate("associatedBug", "title status");

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }

  // Check if user is a participant
  if (!chat.participants.some(p => p._id.toString() === req.user._id.toString())) {
    res.status(403);
    throw new Error("Not authorized to access this chat");
  }

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

// @desc    Send a message
// @route   POST /api/chats/:id/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  try {
    const { content } = req.body;
    const mentions = req.body.mentions || [];
    const replyTo = req.body.replyTo;
    
    // Check if content exists and is not just whitespace when no attachments are provided
    if ((!content || content.trim() === "") && (!req.files || req.files.length === 0)) {
      return res.status(400).json({
        message: "Message content or attachment is required"
      });
    }
    
    const chat = await Chat.findById(req.params.id);
    
    if (!chat) {
      return res.status(404).json({
        message: "Chat not found"
      });
    }
    
    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === req.user._id.toString())) {
      return res.status(403).json({
        message: "You are not a participant in this chat"
      });
    }
    
    // Validate reply if provided
    if (replyTo) {
      const replyExists = await Message.findOne({ 
        _id: replyTo,
        chat: chat._id
      });
      
      if (!replyExists) {
        return res.status(404).json({
          message: "Reply message not found in this chat"
        });
      }
    }
    
    // Process attachments if any
    let attachmentIds = [];
    if (req.files && req.files.length > 0) {
      const attachmentPromises = req.files.map(async (file) => {
        const attachment = await Attachment.create({
          filename: file.filename,
          originalFilename: file.originalname,
          path: file.path,
          mimetype: file.mimetype,
          size: file.size,
          uploadedBy: req.user._id
        });
        return attachment._id;
      });
      
      attachmentIds = await Promise.all(attachmentPromises);
    }
    
    // Create message
    const message = await Message.create({
      chat: chat._id,
      sender: req.user._id,
      content: content || "",
      attachments: attachmentIds,
      mentions: mentions,
      readBy: [{ user: req.user._id }], // Mark as read by sender
      replyTo: replyTo || null
    });
    
    // Populate message
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email profileImageURL")
      .populate("mentions", "name email profileImageURL")
      .populate({
        path: "replyTo",
        populate: {
          path: "sender",
          select: "name profileImageURL"
        }
      })
      .populate({
        path: "attachments",
        select: "filename originalFilename mimetype size"
      });
    
    // Update chat's updatedAt
    chat.updatedAt = Date.now();
    await chat.save();
    
    // If AI assistant is enabled, generate response asynchronously
    if (chat.aiAssistant && chat.aiAssistant.enabled) {
      // Don't await this - let it run in the background
      generateAIResponse(chat, populatedMessage).catch(err => 
        console.error('Error generating AI response:', err)
      );
    }
    
    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error in sendMessage controller:', error);
    res.status(500).json({
      message: "Failed to send message",
      error: error.message
    });
  }
});

// @desc    Get messages for a chat
// @route   GET /api/chats/:id/messages
// @access  Private
const getMessages = asyncHandler(async (req, res) => {
  const { limit = 50, before } = req.query;
  
  const chat = await Chat.findById(req.params.id);
  
  if (!chat) {
    res.status(404);
    throw new Error("Chat not found");
  }
  
  // Check if user is a participant
  if (!chat.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error("You are not a participant in this chat");
  }
  
  // Build query
  let query = { 
    chat: chat._id,
    isDeleted: false
  };
  
  // If before param is provided, get messages before that timestamp
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }
  
  // Get messages
  const messages = await Message.find(query)
    .populate("sender", "name email profileImageURL")
    .populate("mentions", "name email profileImageURL")
    .populate({
      path: "replyTo",
      populate: {
        path: "sender",
        select: "name profileImageURL"
      }
    })
    .populate({
      path: "attachments",
      select: "filename originalFilename mimetype size"
    })
    .sort({ createdAt: -1 })
    .limit(Number(limit));
  
  // Mark messages as read
  const messageIds = messages.map(m => m._id);
  await Message.updateMany(
    {
      _id: { $in: messageIds },
      sender: { $ne: req.user._id },
      "readBy.user": { $ne: req.user._id }
    },
    { 
      $push: { 
        readBy: { 
          user: req.user._id,
          readAt: new Date()
        } 
      } 
    }
  );
  
  res.json(messages);
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
// @route   POST /api/chats/:chatId/messages/:messageId/reactions
// @access  Private
const addReaction = asyncHandler(async (req, res) => {
  const { emoji } = req.body;
  
  if (!emoji) {
    res.status(400);
    throw new Error("Emoji is required");
  }
  
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
  
  // Check if user already reacted with this emoji
  const existingReaction = message.reactions.find(
    r => r.user.toString() === req.user._id.toString() && r.emoji === emoji
  );
  
  if (existingReaction) {
    // Remove reaction if it already exists (toggle)
    message.reactions = message.reactions.filter(
      r => !(r.user.toString() === req.user._id.toString() && r.emoji === emoji)
    );
  } else {
    // Add new reaction
    message.reactions.push({
      emoji,
      user: req.user._id
    });
  }
  
  await message.save();
  
  // Populate reactions
  const updatedMessage = await Message.findById(message._id)
    .populate("reactions.user", "name profileImageURL");
  
  res.json(updatedMessage.reactions);
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
  addReaction
}; 