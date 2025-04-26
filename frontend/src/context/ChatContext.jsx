import React, { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from 'react';
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
  const prevMessagesRef = useRef(messages); // Track previous messages to prevent unnecessary updates

  // Get all chats for the logged-in user
  const fetchChats = useCallback(async (type = null) => {
    if (!user) return;
    
    // Don't set loading to true if we already have chats - prevents flickering
    const shouldShowLoading = chats.length === 0;
    if (shouldShowLoading) {
      setLoading(true);
    }
    
    try {
      const queryParams = type ? `?type=${type}` : '';
      const response = await axiosInstance.get(`/api/chats${queryParams}`);
      
      // Only update if the chats have actually changed
      if (JSON.stringify(response.data) !== JSON.stringify(chats)) {
        setChats(response.data);
        
        // Calculate total unread messages
        const totalUnread = response.data.reduce((acc, chat) => acc + (chat.unreadCount || 0), 0);
        if (totalUnread !== unreadCount) {
          setUnreadCount(totalUnread);
        }
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      // Don't show toast here as axiosInstance will handle global errors
    } finally {
      if (shouldShowLoading) {
        setLoading(false);
      }
    }
  }, [user, chats, unreadCount]);

  // Get a specific chat by ID
  const fetchChatById = useCallback(async (chatId) => {
    if (!chatId) return null;
    
    // Validate MongoDB ID format
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(chatId);
    if (!isValidMongoId) {
      console.error('Invalid chat ID format in fetchChatById:', chatId);
      toast.error('Invalid chat ID format');
      return null;
    }
    
    // Don't immediately clear messages or set loading state
    // This causes flickering when switching between chats
    let showLoadingAfterDelay = true;
    const loadingTimeout = setTimeout(() => {
      if (showLoadingAfterDelay) {
        setLoading(true);
      }
    }, 300); // Only show loading indicator if fetch takes longer than 300ms
    
    try {
      const response = await axiosInstance.get(`/api/chats/${chatId}`);
      
      // Cancel the loading state timeout
      showLoadingAfterDelay = false;
      clearTimeout(loadingTimeout);
      
      // Check if response contains a valid chat
      if (response.data && response.data._id) {
        // Don't immediately set the active chat here
        // Let the parent component handle this to prevent state flashing
        return response.data;
      } else {
        console.error('Invalid chat data received');
        toast.error('Chat data is invalid');
        return null;
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      
      // Cancel the loading state timeout
      showLoadingAfterDelay = false;
      clearTimeout(loadingTimeout);
      
      // Handle specific error conditions
      if (error.response) {
        if (error.response.status === 404) {
          toast.error('Chat not found or has been deleted');
        } else if (error.response.status === 403) {
          toast.error('You do not have permission to access this chat');
        } else if (error.response.status === 500) {
          toast.error('Server error while fetching chat. Please try again later');
        } else {
          toast.error('Failed to load chat');
        }
      } else {
        toast.error('Network error. Please check your connection');
      }
      return null;
    } finally {
      // Clear loading state if it was set
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
    if (!chatId) return [];
    
    // Validate MongoDB ID format
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(chatId);
    if (!isValidMongoId) {
      console.error('Invalid chat ID format in fetchMessages');
      toast.error('Invalid chat ID format');
      return [];
    }
    
    // Delay showing loading state to prevent flickering on quick loads
    let shouldShowLoading = true;
    const loadingTimeout = setTimeout(() => {
      if (shouldShowLoading) {
        setMessagesLoading(true);
      }
    }, 100);
    
    try {
      let url = `/api/chats/${chatId}/messages?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }
      
      const response = await axiosInstance.get(url);
      const messageData = response.data;
      
      // Cancel loading indicator timeout
      shouldShowLoading = false;
      clearTimeout(loadingTimeout);
      
      // If we're loading previous messages, append them to the end
      // Otherwise replace messages with efficient state update
      if (before) {
        // Only update if we actually got new data
        if (messageData.length > 0) {
          setMessages(prevMessages => [...prevMessages, ...messageData]);
        }
      } else {
        // Even an empty array is a valid response - the chat exists but has no messages yet
        const reversedMessages = Array.isArray(messageData) ? messageData.reverse() : [];
        
        // Only update state if messages have changed
        const currentMessagesJson = JSON.stringify(prevMessagesRef.current);
        const newMessagesJson = JSON.stringify(reversedMessages);
        
        if (currentMessagesJson !== newMessagesJson) {
          setMessages(reversedMessages);
          prevMessagesRef.current = reversedMessages;
        }
      }
      
      // Always return a valid array, empty or not
      return messageData || [];
    } catch (error) {
      // Cancel loading indicator timeout
      shouldShowLoading = false;
      clearTimeout(loadingTimeout);
      
      console.error('Error fetching messages:', error);
      
      // Handle specific errors more gracefully
      if (error.response && error.response.status === 404) {
        // Don't clear messages immediately to prevent UI flash
        if (!before) {
          setMessages([]);
          prevMessagesRef.current = []; // Clear reference too
        }
        
        // Only show toast for first error
        if (!before && !messagesLoading) {
          toast.error('Chat not found or has been deleted');
        }
      } else if (error.response && error.response.status === 403) {
        toast.error('You do not have permission to view these messages');
      } else {
        // Don't show toast for every polling error
        if (!before) {
          toast.error('Failed to load messages. Please try again.');
        }
      }
      
      return [];
    } finally {
      setMessagesLoading(false);
    }
  }, [activeChat, messagesLoading]);

  // Send a message to a chat
  const sendMessage = async (chatId, content, attachmentFiles = null, senderOverride = null) => {
    if (!chatId) {
      console.error('No chat ID provided in sendMessage');
      toast.error('Failed to send message: No chat selected');
      return null;
    }
    
    // Validate MongoDB ID format
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(chatId);
    if (!isValidMongoId) {
      console.error('Invalid chat ID format in sendMessage:', chatId);
      toast.error('Invalid chat ID format');
      return null;
    }
    
    setSendingMessage(true);
    
    // Create a temporary message ID outside the try block so it's available in catch
    const tempMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Create form data object to handle both text content and file attachments
      let formData;
      
      // Check if content is already FormData (direct pass from ChatInput)
      if (content instanceof FormData) {
        formData = content;
        
        // Add sender override if provided
        if (senderOverride) {
          formData.append('senderOverride', JSON.stringify(senderOverride));
        }
      } else {
        formData = new FormData();
        
        // If content is an object (with text and files), extract them
        if (typeof content === 'object' && content !== null && !(content instanceof File)) {
          if (content.text) {
            formData.append('content', content.text);
          }
          
          if (content.files && content.files.length > 0) {
            for (let i = 0; i < content.files.length; i++) {
              formData.append('attachments', content.files[i]);
            }
          }
        } else {
          // Otherwise, assume content is a string
          formData.append('content', typeof content === 'string' ? content : JSON.stringify(content));
        }
        
        // Add attachment files if they exist
        if (attachmentFiles) {
          if (Array.isArray(attachmentFiles)) {
            for (let i = 0; i < attachmentFiles.length; i++) {
              formData.append('attachments', attachmentFiles[i]);
            }
          } else {
            formData.append('attachments', attachmentFiles);
          }
        }
        
        // Add sender override if provided
        if (senderOverride) {
          formData.append('senderOverride', JSON.stringify(senderOverride));
        }
      }
      
      // Create a temporary message (removed duplicate declaration)
      const tempMessage = {
        _id: tempMessageId,
        content: formData.get('content') || '',
        sender: senderOverride || user,
        createdAt: new Date().toISOString(),
        chatId,
        isTemporary: true,
        tempId: tempMessageId,
        // If there are files in the FormData, create temporary attachments
        attachments: formData.getAll('attachments').map(file => ({
          _id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          originalFilename: file.name,
          size: file.size,
          type: file.type,
          isTemporary: true
        }))
      };
      
      // Only add the temp message if we actually have content or attachments
      if (tempMessage.content || (tempMessage.attachments && tempMessage.attachments.length > 0)) {
        // Add to messages with proper immutability pattern
        setMessages(prevMessages => [...prevMessages, tempMessage]);
        
        // Update UI immediately without waiting for API
        if (activeChat && activeChat._id === chatId) {
          // Also update the chat's last message in the list
          setChats(prevChats => 
            prevChats.map(chat => 
              chat._id === chatId 
                ? { 
                    ...chat, 
                    lastMessage: { 
                      content: tempMessage.content, 
                      createdAt: tempMessage.createdAt,
                      sender: tempMessage.sender 
                    } 
                  } 
                : chat
            )
          );
        }
      }
      
      // Send the real message to the API
      const response = await axiosInstance.post(`/api/chats/${chatId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // If we get a successful response, replace the temporary message with the real one
      if (response.data) {
        setMessages(prevMessages => 
          prevMessages.map(msg => 
            msg._id === tempMessageId ? response.data : msg
          )
        );
        
        // Refresh chat list to update last message
        fetchChats();
        
        return response.data;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle specific error types
      if (error.response) {
        if (error.response.status === 404) {
          toast.error('Chat not found or has been deleted');
        } else if (error.response.status === 403) {
          toast.error('You do not have permission to send messages in this chat');
        } else {
          toast.error('Failed to send message');
        }
      } else if (error.request) {
        toast.error('Network error. Please check your connection');
      } else {
        toast.error('Error sending message');
      }
      
      // Remove the temporary message on error
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg._id !== tempMessageId)
      );
      
      return null;
    } finally {
      setSendingMessage(false);
    }
  };

  // Function to simulate AI or other user messages for testing
  const simulateMessage = async (chatId, content, senderType = 'ai') => {
    if (!chatId) return null;
    
    const sender = senderType === 'ai' 
      ? {
          _id: 'ai-assistant',
          name: 'AI Assistant',
          username: 'ai-assistant',
          isAI: true
        }
      : {
          _id: `other-user-${Date.now()}`,
          name: 'Other User',
          username: 'other-user'
        };
        
    return await sendMessage(chatId, content, null, sender);
  };

  // Delete a message
  const deleteMessage = async (messageId) => {
    try {
      await axiosInstance.delete(`/api/chats/${messageId}`);
      
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
    prevMessagesRef.current = [];
  }, []);

  // Auto-refresh chats periodically
  useEffect(() => {
    let isMounted = true;
    
    // Initial fetch
    if (user && chats.length === 0 && isMounted) {
      fetchChats();
    }
    
    // Setup refresh interval
    let interval = null;
    if (user && isMounted) {
      interval = setInterval(() => {
        // Only fetch if component is still mounted and not in a loading state
        if (isMounted && !loading && !messagesLoading && !sendingMessage) {
          fetchChats();
        }
      }, 60000); // Every 60 seconds
    }
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (interval) {
        clearInterval(interval);
      }
    };
    // We're removing chats.length from dependencies to avoid re-creating the interval
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchChats, loading, messagesLoading, sendingMessage]);

  const value = useMemo(() => ({
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
    simulateMessage,
    deleteMessage,
    addReaction,
    setActiveChat,
    clearActiveChat
  }), [
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
    simulateMessage,
    deleteMessage,
    addReaction,
    setActiveChat,
    clearActiveChat
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}; 