import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { UserContext } from '../../context/userContext';
import { toast } from 'react-hot-toast';
import ChatMessages from './components/ChatMessages';
import ChatInput from './components/ChatInput';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const {
    chats,
    activeChat,
    messages,
    loading,
    messagesLoading,
    sendingMessage,
    fetchChats,
    fetchChatById,
    fetchMessages,
    sendMessage,
    setActiveChat,
    clearActiveChat
  } = useChat();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  const [chatNotFound, setChatNotFound] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const MAX_ERRORS = 3;
  const [newMessageReceived, setNewMessageReceived] = useState(false);
  
  // Fetch active chat when chatId changes
  useEffect(() => {
    let isActive = true; // For cleanup/cancellation
    
    const loadChat = async () => {
      if (chatId) {
        // Reset state for new chat
        setChatNotFound(false);
        setErrorCount(0);
        setNewMessageReceived(false);
        setHasScrolledToBottom(false);
        
        // Clear current messages before loading new ones
        setActiveChat(null);
        
        try {
          // First fetch the chat data
          const chat = await fetchChatById(chatId);
          
          if (isActive) {
            if (!chat) {
              const basePath = user?.role === 'admin' ? '/admin/chat' : '/user/chat';
              navigate(basePath);
              setChatNotFound(true);
              return;
            }
            
            // Now load chat messages
            try {
              await fetchMessages(chatId);
              console.log(`Loaded messages for chat ${chatId}`);
              
              // Force scroll to bottom on initial load
              setTimeout(() => {
                if (messagesEndRef.current) {
                  messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
                }
                setHasScrolledToBottom(true);
              }, 300);
            } catch (msgError) {
              console.error('Error loading messages:', msgError);
            }
          }
        } catch (error) {
          console.error('Error loading chat:', error);
          if (isActive) {
            const basePath = user?.role === 'admin' ? '/admin/chat' : '/user/chat';
            navigate(basePath);
          }
        }
      } else if (isActive) {
        clearActiveChat();
      }
    };
    
    loadChat();
    
    return () => {
      isActive = false;
    };
  }, [chatId, fetchChatById, fetchMessages, navigate, clearActiveChat, user?.role]);
  
  // Handle sending a message - memoize the callback to prevent rerenders
  const handleSendMessage = useCallback(async (messageData) => {
    try {
      // Validate that we have an active chat
      if (!activeChat || !activeChat._id) {
        toast.error('No active chat selected');
        return;
      }
      
      console.log('Processing message data');
      
      // Check if messageData is already FormData (direct approach)
      if (messageData instanceof FormData) {
        console.log('Sending FormData directly to the API');
        
        // Directly pass the FormData to sendMessage
        await sendMessage(activeChat._id, messageData);
        
        // Force scroll to bottom
        setHasScrolledToBottom(false);
        setNewMessageReceived(true);
        return;
      }
      
      // Legacy object-based approach 
      const hasContent = messageData.content && messageData.content.trim().length > 0;
      const hasAttachments = messageData.attachments && 
                            Array.isArray(messageData.attachments) && 
                            messageData.attachments.length > 0;
      
      if (!hasContent && !hasAttachments) {
        toast.error('Message cannot be empty');
        return;
      }
      
      // Call sendMessage with separate content and attachments
      await sendMessage(
        activeChat._id, 
        hasContent ? messageData.content : ' ', // Use space instead of empty string
        hasAttachments ? messageData.attachments : []
      );
      
      // Force scroll to bottom
      setHasScrolledToBottom(false);
      setNewMessageReceived(true);
    } catch (error) {
      console.error('Error sending message:', error);
      
      if (error.response) {
        const errorMessage = error.response.data?.message || 'Failed to send message';
        toast.error(errorMessage);
      } else {
        toast.error('Network error. Please check your connection.');
      }
    }
  }, [activeChat, sendMessage]);

  return (
    // Rest of the component code...
  );
};

export default ChatPage; 