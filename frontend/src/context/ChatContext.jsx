import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { UserContext } from './userContext';
import { toast } from 'react-hot-toast';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const { user } = useContext(UserContext);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Get all chats for the logged-in user
  const fetchChats = useCallback(async (type = null) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const queryParams = type ? `?type=${type}` : '';
      const response = await axiosInstance.get(`/api/chats${queryParams}`);
      setChats(response.data);
      
      // Calculate total unread messages
      const totalUnread = response.data.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching chats:', error);
      // Don't show toast here as axiosInstance will handle global errors
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Get a specific chat by ID
  const fetchChatById = useCallback(async (chatId) => {
    if (!chatId) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/chats/${chatId}`);
      setActiveChat(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat:', error);
      // Don't show toast here as axiosInstance will handle global errors
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new chat
  const createChat = async (chatData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/chats', chatData);
      setChats(prevChats => [response.data, ...prevChats]);
      setActiveChat(response.data);
      toast.success('Chat created successfully');
      return response.data;
    } catch (error) {
      console.error('Error creating chat:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update chat details
  const updateChat = async (chatId, chatData) => {
    setLoading(true);
    try {
      const response = await axiosInstance.put(`/api/chats/${chatId}`, chatData);
      
      // Update in chats list
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === chatId ? response.data : chat
        )
      );
      
      // Update active chat if it's the one being edited
      if (activeChat && activeChat._id === chatId) {
        setActiveChat(response.data);
      }
      
      toast.success('Chat updated successfully');
      return response.data;
    } catch (error) {
      console.error('Error updating chat:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a chat
  const deleteChat = async (chatId) => {
    try {
      await axiosInstance.delete(`/api/chats/${chatId}`);
      
      // Remove from chats list
      setChats(prevChats => prevChats.filter(chat => chat._id !== chatId));
      
      // Clear active chat if it's the one being deleted
      if (activeChat && activeChat._id === chatId) {
        setActiveChat(null);
        setMessages([]);
      }
      
      toast.success('Chat deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  };

  // Get messages for a chat
  const fetchMessages = useCallback(async (chatId, limit = 50, before = null) => {
    if (!chatId) return;
    
    setMessagesLoading(true);
    try {
      let url = `/api/chats/${chatId}/messages?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      
      const response = await axiosInstance.get(url);
      
      // If we're loading previous messages, append them to the end
      // Otherwise replace messages
      if (before) {
        setMessages(prevMessages => [...prevMessages, ...response.data]);
      } else {
        setMessages(response.data.reverse()); // Reverse to show oldest first
      }
      
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Don't show toast here as axiosInstance will handle global errors
      return [];
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Send a message
  const sendMessage = async (chatId, messageData) => {
    // Prevent duplicate sends
    if (sendingMessage) return;
    
    setSendingMessage(true);
    try {
      let content = '';
      let attachments = [];
      
      // Check if messageData is FormData (from ChatPage) or plain object (from API calls)
      if (messageData instanceof FormData) {
        content = messageData.get('content') || '';
        
        // Extract files if present
        if (messageData.getAll('attachments')) {
          attachments = messageData.getAll('attachments');
        }
      } else {
        content = messageData.content || '';
        attachments = messageData.attachments || [];
      }
      
      // Optimistically add message to UI
      const optimisticMessage = {
        _id: `temp-${Date.now()}`,
        content: content,
        sender: {
          _id: user._id,
          name: user.name,
          profileImageURL: user.profileImageURL
        },
        createdAt: new Date().toISOString(),
        isOptimistic: true, // Flag to identify optimistic updates
        attachments: attachments.length > 0 ? attachments.map(file => ({
          _id: `temp-${Date.now()}-${file.name}`,
          originalFilename: file.name,
          filename: file.name,
          size: file.size,
          mimetype: file.type,
          isOptimistic: true
        })) : []
      };
      
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      // Use the original messageData for the API call, whether it's FormData or plain object
      const response = await axiosInstance.post(
        `/api/chats/${chatId}/messages`, 
        messageData,
        {
          headers: {
            'Content-Type': messageData instanceof FormData ? 'multipart/form-data' : 'application/json'
          }
        }
      );
      
      // Replace optimistic message with real one
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.isOptimistic ? response.data : msg
        )
      );
      
      // Update lastMessage in chat list
      setChats(prevChats => 
        prevChats.map(chat => {
          if (chat._id === chatId) {
            return {
              ...chat,
              lastMessage: {
                ...response.data,
                sender: response.data.sender
              },
              updatedAt: new Date().toISOString()
            };
          }
          return chat;
        })
      );
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prevMessages => 
        prevMessages.filter(msg => !msg.isOptimistic)
      );
      
      toast.error('Failed to send message. Please try again.');
      throw error;
    } finally {
      setSendingMessage(false);
    }
  };

  // Delete a message
  const deleteMessage = async (chatId, messageId) => {
    try {
      await axiosInstance.delete(`/api/chats/${chatId}/messages/${messageId}`);
      
      // Update in messages list
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId 
            ? { ...msg, isDeleted: true, content: "This message has been deleted" } 
            : msg
        )
      );
      
      toast.success('Message deleted');
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  };

  // Add reaction to a message
  const addReaction = async (chatId, messageId, emoji) => {
    try {
      const response = await axiosInstance.post(
        `/api/chats/${chatId}/messages/${messageId}/reactions`,
        { emoji }
      );
      
      // Update reactions in message
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg._id === messageId ? { ...msg, reactions: response.data } : msg
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  };

  // Clear active chat and messages
  const clearActiveChat = useCallback(() => {
    setActiveChat(null);
    setMessages([]);
  }, []);

  // Auto-refresh chats periodically
  useEffect(() => {
    if (user) {
      fetchChats();
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchChats();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, fetchChats]);

  const value = {
    chats,
    activeChat,
    messages,
    loading,
    messagesLoading,
    unreadCount,
    sendingMessage,
    fetchChats,
    fetchChatById,
    createChat,
    updateChat,
    deleteChat,
    fetchMessages,
    sendMessage,
    deleteMessage,
    addReaction,
    setActiveChat,
    clearActiveChat
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}; 