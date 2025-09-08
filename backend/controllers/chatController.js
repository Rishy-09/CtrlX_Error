import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import aiService from '../services/aiService.js';
import mongoose from 'mongoose';

const MESSAGES_PER_PAGE = 50;

/**
 * Create a new chat
 * @route POST /api/chats
 */
export const createChat = async (req, res) => {
  try {
    const { name, type, participants, aiAssistant } = req.body;
    const userId = req.user.id;

    // Validate participants exist
    let validParticipants = [];
    if (participants && participants.length > 0) {
      validParticipants = await User.find({
        _id: { $in: participants }
      }).select('_id');
      
      if (validParticipants.length !== participants.length) {
        return res.status(400).json({ message: 'One or more participants are invalid' });
      }
    }

    // Always include the creator
    const participantIds = [
      ...new Set([
        userId,
        ...validParticipants.map(p => p._id.toString())
      ])
    ];

    const newChat = new Chat({
      name,
      type: type || 'private',
      participants: participantIds,
      admins: [userId],
      aiAssistant: aiAssistant || { enabled: false }
    });

    await newChat.save();

    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email profileImageURL')
      .populate('admins', 'name email profileImageURL')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name profileImageURL'
        }
      });

    res.status(201).json(populatedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
};

/**
 * Get all chats for current user
 * @route GET /api/chats
 */
export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({
      participants: userId
    })
      .populate('participants', 'name email profileImageURL')
      .populate('admins', 'name email profileImageURL')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name profileImageURL'
        }
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Error getting chats:', error);
    res.status(500).json({ message: 'Failed to get chats' });
  }
};

/**
 * Get a specific chat by ID
 * @route GET /api/chats/:id
 */
export const getChatById = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email profileImageURL')
      .populate('admins', 'name email profileImageURL')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name profileImageURL'
        }
      });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p._id.toString() === userId)) {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    res.json(chat);
  } catch (error) {
    console.error('Error getting chat:', error);
    res.status(500).json({ message: 'Failed to get chat' });
  }
};

/**
 * Update a chat
 * @route PUT /api/chats/:id
 */
export const updateChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { name, participants, admins, aiAssistant } = req.body;

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is an admin
    if (!chat.admins.some(admin => admin.toString() === userId)) {
      return res.status(403).json({ message: 'Only chat admins can update chat settings' });
    }

    // Update fields if provided
    if (name) chat.name = name;
    
    // Update participants if provided
    if (participants) {
      const validParticipants = await User.find({
        _id: { $in: participants }
      }).select('_id');
      
      if (validParticipants.length !== participants.length) {
        return res.status(400).json({ message: 'One or more participants are invalid' });
      }
      
      chat.participants = validParticipants.map(p => p._id);
    }
    
    // Update admins if provided
    if (admins) {
      // Ensure all admins are also participants
      const isValidAdmins = admins.every(adminId => 
        chat.participants.some(p => p.toString() === adminId)
      );
      
      if (!isValidAdmins) {
        return res.status(400).json({ message: 'All admins must be participants' });
      }
      
      chat.admins = admins;
    }
    
    // Update AI assistant settings if provided
    if (aiAssistant) {
      chat.aiAssistant = {
        ...chat.aiAssistant,
        ...aiAssistant
      };
    }

    await chat.save();

    const updatedChat = await Chat.findById(chatId)
      .populate('participants', 'name email profileImageURL')
      .populate('admins', 'name email profileImageURL')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name profileImageURL'
        }
      });

    res.json(updatedChat);
  } catch (error) {
    console.error('Error updating chat:', error);
    res.status(500).json({ message: 'Failed to update chat' });
  }
};

/**
 * Delete a chat
 * @route DELETE /api/chats/:id
 */
export const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is an admin
    if (!chat.admins.some(admin => admin.toString() === userId)) {
      return res.status(403).json({ message: 'Only chat admins can delete the chat' });
    }

    // Delete all messages in the chat
    await Message.deleteMany({ chat: chatId });
    
    // Delete the chat
    await Chat.findByIdAndDelete(chatId);

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Error deleting chat:', error);
    res.status(500).json({ message: 'Failed to delete chat' });
  }
};

/**
 * Send a message to a chat
 * @route POST /api/chats/:id/messages
 */
export const sendMessage = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const { content, mentions, replyTo, attachments } = req.body;

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    // Validate reply message exists if provided
    if (replyTo && !await Message.exists({ _id: replyTo, chat: chatId })) {
      return res.status(400).json({ message: 'Reply message not found' });
    }

    // Create new message
    const newMessage = new Message({
      chat: chatId,
      sender: userId,
      content,
      mentions: mentions || [],
      replyTo: replyTo || null,
      attachments: attachments || [],
      readBy: [{ user: userId }]
    });

    await newMessage.save();

    // Update last message in chat
    chat.lastMessage = newMessage._id;
    await chat.save();

    // Populate the message with sender info
    const populatedMessage = await Message.findById(newMessage._id)
      .populate('sender', 'name email profileImageURL')
      .populate('mentions', 'name email profileImageURL')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'name profileImageURL'
        }
      });

    // If AI assistant is enabled, generate a response
    if (chat.aiAssistant && chat.aiAssistant.enabled) {
      try {
        // Get recent messages
        const recentMessages = await Message.find({ chat: chatId })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('sender', 'name')
          .sort({ createdAt: 1 });

        // Get AI response
        const aiResponseContent = await aiService.getAIResponse(recentMessages, chat);

        // Create AI message
        const aiMessage = new Message({
          chat: chatId,
          content: aiResponseContent,
          isAIMessage: true,
          readBy: chat.participants.map(participant => ({
            user: participant
          }))
        });

        await aiMessage.save();

        // Update last message
        chat.lastMessage = aiMessage._id;
        await chat.save();

        // Don't wait for this to complete
        Message.populate(aiMessage, {
          path: 'chat',
          select: 'name type'
        }).then(() => {
          // Here you could trigger a websocket event to notify clients
        });
      } catch (aiError) {
        console.error('AI response error:', aiError);
        // Continue without AI response, just log the error
      }
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Failed to send message' });
  }
};

/**
 * Get messages for a chat with pagination
 * @route GET /api/chats/:id/messages
 */
export const getMessages = async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const before = req.query.before; // Message ID to get messages before

    // Check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: 'Invalid chat ID' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    // Check if user is a participant
    if (!chat.participants.some(p => p.toString() === userId)) {
      return res.status(403).json({ message: 'You are not a participant in this chat' });
    }

    // Build query
    let query = { chat: chatId };
    
    // If before parameter is provided, get messages before that one
    if (before && mongoose.Types.ObjectId.isValid(before)) {
      const beforeMessage = await Message.findById(before);
      if (beforeMessage) {
        query.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    // Get messages with pagination
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * MESSAGES_PER_PAGE)
      .limit(MESSAGES_PER_PAGE)
      .populate('sender', 'name email profileImageURL')
      .populate('mentions', 'name email profileImageURL')
      .populate({
        path: 'replyTo',
        populate: {
          path: 'sender',
          select: 'name profileImageURL'
        }
      });

    // Mark messages as read
    const messageIds = messages.map(m => m._id);
    await Message.updateMany(
      { 
        _id: { $in: messageIds },
        'readBy.user': { $ne: userId }
      },
      { 
        $push: { readBy: { user: userId, readAt: new Date() } }
      }
    );

    res.json({
      messages: messages.reverse(), // Send in chronological order
      page,
      hasMore: messages.length === MESSAGES_PER_PAGE
    });
  } catch (error) {
    console.error('Error getting messages:', error);
    res.status(500).json({ message: 'Failed to get messages' });
  }
};

export default {
  createChat,
  getChats,
  getChatById,
  updateChat,
  deleteChat,
  sendMessage,
  getMessages
}; 