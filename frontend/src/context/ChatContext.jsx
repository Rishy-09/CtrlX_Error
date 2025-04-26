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

  // Send a message
  const sendMessage = async (chatId, content, attachmentFiles = null) => {
    // Prevent duplicate sends
    if (sendingMessage) return null;
    
    // Validate MongoDB ID format
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(chatId);
    if (!isValidMongoId) {
      console.error('Invalid chat ID format in sendMessage:', chatId);
      toast.error('Invalid chat ID format');
      return null;
    }
    
    // Validate that there's either content or attachments
    const trimmedContent = (content || '').trim();
    
    // Ensure attachments are valid File objects
    let validAttachments = [];
    if (attachmentFiles && Array.isArray(attachmentFiles) && attachmentFiles.length > 0) {
      validAttachments = attachmentFiles.filter(file => file instanceof File);
      
      if (validAttachments.length !== attachmentFiles.length) {
        console.error('Some attachments are not valid File objects:', 
          attachmentFiles.filter(file => !(file instanceof File)));
      }
    }
    
    const hasAttachments = validAttachments.length > 0;
    
    if (!trimmedContent && !hasAttachments) {
      toast.error('Message must have content or attachments');
      return null;
    }
    
    setSendingMessage(true);
    try {
      const formData = new FormData();
      
      // Add content (may be empty if only attachments)
      formData.append('content', trimmedContent);
      
      // Add attachments if provided
      if (hasAttachments) {
        // Debug the attachment files to ensure they are valid
        console.log('Sending attachments:', validAttachments.length);
        
        for (let i = 0; i < validAttachments.length; i++) {
          const file = validAttachments[i];
          
          // Ensure it's a valid File object
          if (file instanceof File) {
            console.log(`Adding attachment ${i+1}/${validAttachments.length}:`, file.name, file.size, file.type);
            formData.append('attachments', file);
          }
        }
      }
      
      // For debugging - log FormData contents
      console.log('FormData created with content and attachments');
      // Verify formData contents
      let formDataEntries = [];
      for (const pair of formData.entries()) {
        const entryInfo = pair[0] === 'attachments' 
          ? `${pair[0]}: File (${pair[1].name}, ${pair[1].size} bytes)` 
          : `${pair[0]}: ${pair[1]}`;
        formDataEntries.push(entryInfo);
        console.log(entryInfo);
      }
      
      if (formDataEntries.length === 1 && formDataEntries[0].startsWith('content:') && !trimmedContent) {
        console.error('FormData only contains empty content and no attachments');
        toast.error('Message must have content or attachments');
        return null;
      }
      
      // Create a unique temporary ID for the message
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Create a temporary message to display while the actual message is being sent
      const tempMessage = {
        _id: tempId,
        content: trimmedContent,
        createdAt: new Date().toISOString(),
        sender: user,
        isTemporary: true,
        attachments: hasAttachments ? validAttachments.map(file => ({
          _id: `temp-attach-${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          originalFilename: file.name,
          size: file.size,
          type: file.type,
          mimeType: file.type,
          // Create a local preview URL for image files
          previewUrl: file.type?.startsWith('image/') ? URL.createObjectURL(file) : null,
          isTemporary: true
        })) : []
      };
      
      // Only add temp message to UI if we have valid content/attachments
      if (trimmedContent || hasAttachments) {
        // Add the temporary message to the UI immediately
        setMessages(prevMessages => [...prevMessages, tempMessage]);
      }
      
      console.log('Sending message to API...');
      
      // Send the actual message to the server
      const response = await axiosInstance.post(`/api/chats/${chatId}/messages`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('Message sent successfully:', response.data);
      
      // Replace the temporary message with the real one from the server
      setMessages(prevMessages => {
        const updatedMessages = prevMessages.filter(msg => msg._id !== tempId);
        return [...updatedMessages, response.data];
      });
      
      // Clean up any temporary object URLs
      if (hasAttachments) {
        tempMessage.attachments.forEach(attachment => {
          if (attachment.previewUrl) {
            URL.revokeObjectURL(attachment.previewUrl);
          }
        });
      }
      
      // If the chat has AI assistant, inform the user it's thinking
      if (activeChat?.aiAssistant?.enabled) {
        toast.success('Message sent. AI is thinking...', {
          duration: 3000,
          id: 'ai-thinking-toast'
        });
      }
      
      // Update unread count if needed
      if (activeChat && activeChat._id === chatId) {
        fetchChats(); // Update chat list to refresh unread counts
      }
      
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Remove the temporary message on error
      setMessages(prevMessages => prevMessages.filter(msg => !msg.isTemporary));
      
      // Handle specific error types
      if (error.response) {
        if (error.response.status === 404) {
          toast.error('Chat not found or has been deleted');
        } else if (error.response.status === 403) {
          toast.error('You do not have permission to send messages in this chat');
        } else if (error.response.status === 413) {
          toast.error('File(s) too large. Maximum file size is 10MB');
        } else if (error.response.status === 400) {
          // Try to parse the error message from HTML response if needed
          let errorMsg = 'Invalid message format. Please try again.';
          
          if (error.response.data) {
            if (typeof error.response.data === 'string' && error.response.data.includes('Error:')) {
              // Extract error message from HTML
              const match = error.response.data.match(/Error: ([^<]+)/);
              if (match && match[1]) {
                errorMsg = match[1].trim();
              }
            } else if (error.response.data.message) {
              errorMsg = error.response.data.message;
            }
          }
          
          toast.error(errorMsg);
          console.error('Server validation error:', error.response.data);
        } else {
          toast.error('Failed to send message. Please try again.');
        }
        
        // Add specific handling for AI errors
        if (error.response.data && typeof error.response.data === 'string') {
          if (error.response.data.includes('Error generating AI response') || 
              error.response.data.includes('status code 401')) {
            console.warn('AI response generation failed:', error.response.data);
            toast.error('Your message was sent, but the AI response could not be generated.', { 
              duration: 5000,
              id: 'ai-error-toast'
            });
            // Still consider this a success since the user's message was sent
            return true;
          }
        }
      } else {
        toast.error('Network error. Please check your connection.');
      }
      
      return null;
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
    deleteMessage,
    addReaction,
    setActiveChat,
    clearActiveChat
  ]);

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}; 