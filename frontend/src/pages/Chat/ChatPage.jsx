import React, { useState, useEffect, useRef, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { UserContext } from '../../context/userContext';
import { toast } from 'react-hot-toast';
import { MdArrowBack } from 'react-icons/md';
import { FaRobot } from 'react-icons/fa';
import { BsThreeDotsVertical } from 'react-icons/bs';
import ChatSidebar from './components/ChatSidebar';
import MessageItem from './components/MessageItem';
import CreateChatModal from './components/CreateChatModal';
import ChatSettingsModal from './components/ChatSettingsModal';
import ChatInput from './components/ChatInput';
import ChatMessages from './components/ChatMessages';
import { isValidMongoId } from '../../utils/routeValidators';

// Create stable empty state components to prevent re-renders
const EmptyStateScreen = React.memo(({ onCreateChat }) => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <div className="text-xl mb-2">Select a chat or create a new one</div>
    <button
      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
      onClick={onCreateChat}
    >
      Create New Chat
    </button>
  </div>
));

// Component for "No chat selected" state
const NoChatSelectedScreen = React.memo(({ onCreateChat }) => (
  <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
    <div className="text-xl mb-2">No chat selected</div>
    <p className="text-gray-500 mb-4">Select a chat from the sidebar or create a new one.</p>
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      onClick={onCreateChat}
    >
      Create New Chat
    </button>
  </div>
));

// Loading component
const LoadingScreen = React.memo(() => (
  <div className="flex-grow flex justify-center items-center">
    <div className="text-center">
      <div className="spinner mb-2"></div>
      <p>Loading chat...</p>
    </div>
  </div>
));

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
  
  // Ensure refs are created at component initialization and persist between renders
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  const [chatNotFound, setChatNotFound] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const MAX_ERRORS = 3;
  const [newMessageReceived, setNewMessageReceived] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeout = useRef(null);
  
  // Add a state to track chats we've already attempted to load messages for
  // This will prevent continuous loading attempts for empty chats
  const [loadedChatIds, setLoadedChatIds] = useState(new Set());
  
  // Quick validation to prevent any operations with invalid IDs
  const isValidChatId = !chatId || isValidMongoId(chatId);
  
  // Clear interval on component unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
      }
    };
  }, [pollingIntervalId]);
  
  // Optimize the chat loading and transition flow
  useEffect(() => {
    let isActive = true; // For cleanup/cancellation
    let transitionTimeout = null;
    
    const loadChat = async () => {
      if (chatId) {
        // Check if we've already loaded this chat's messages, regardless of count
        const chatAlreadyLoaded = activeChat && 
                                  activeChat._id === chatId && 
                                  (messages.length > 0 || loadedChatIds.has(chatId)) && 
                                  !messagesLoading;
        
        // Skip loading if we already have this chat active with messages or previously loaded
        if (chatAlreadyLoaded) {
          console.log('Chat already loaded or attempted to load, skipping fetch:', chatId);
          return;
        }
        
        // Additional validation before proceeding
        if (!isValidChatId) {
          console.error('Invalid MongoDB ID format in loadChat:', chatId);
          const basePath = user?.role === 'admin' ? '/admin/chat' : '/user/chat';
          navigate(basePath, { replace: true });
          toast.error('Invalid chat ID format');
          return;
        }
        
        // Clear existing polling interval if there is one
        if (pollingIntervalId) {
          clearInterval(pollingIntervalId);
          setPollingIntervalId(null);
        }
        
        // Reset states
        setChatNotFound(false);
        setErrorCount(0);
        
        try {
          // IMPORTANT: Don't clear the active chat or set loading immediately
          // Instead, keep the current chat visible during the transition
          
          // Only fetch chat if it's different from current active chat
          let chat = activeChat;
          if (!activeChat || activeChat._id !== chatId) {
            // First fetch the chat data without showing loading indicators
            chat = await fetchChatById(chatId);
          }
          
          // Only update state if component is still mounted AND we got a valid chat
          if (isActive) {
            if (!chat) {
              const basePath = user?.role === 'admin' ? '/admin/chat' : '/user/chat';
              navigate(basePath);
              setChatNotFound(true);
              return;
            }
            
            // Use a small delay before applying the chat change
            // This prevents flickering by ensuring all data is ready before transition
            clearTimeout(transitionTimeout);
            transitionTimeout = setTimeout(() => {
              if (isActive) {
                // Set the active chat first, then fetch messages in this order
                if (!activeChat || activeChat._id !== chatId) {
                  setActiveChat(chat);
                }
                
                // Only fetch messages if we haven't loaded this chat before
                if (!loadedChatIds.has(chatId)) {
                  // Now fetch messages for this chat (after active chat is set)
                  fetchMessages(chatId)
                    .then(() => {
                      // Mark this chat as loaded regardless of message count
                      setLoadedChatIds(prev => new Set([...prev, chatId]));
                    })
                    .catch(msgError => {
                      console.error('Error loading chat messages:', msgError);
                      // Still mark as loaded to prevent continuous attempts
                      setLoadedChatIds(prev => new Set([...prev, chatId]));
                      if (msgError.response && msgError.response.status === 404) {
                        setChatNotFound(true);
                      }
                    });
                }
                
                setHasScrolledToBottom(false);
              }
            }, 50); // Small delay to batch the state updates
          }
        } catch (error) {
          console.error('Error loading chat:', error);
          if (isActive) {
            const basePath = user?.role === 'admin' ? '/admin/chat' : '/user/chat';
            navigate(basePath);
          }
        }
      } else if (isActive) {
        // Only clear active chat if no chatId provided
        clearActiveChat();
        
        // Clear polling interval
        if (pollingIntervalId) {
          clearInterval(pollingIntervalId);
          setPollingIntervalId(null);
        }
      }
    };
    
    // Only proceed if the chatId is valid
    if (isValidChatId) {
      loadChat();
    }
    
    // Cleanup function
    return () => {
      isActive = false;
      clearTimeout(transitionTimeout);
      
      // Clear any polling interval
      if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        setPollingIntervalId(null);
      }
    };
  }, [chatId, fetchChatById, fetchMessages, navigate, clearActiveChat, user?.role, 
      pollingIntervalId, isValidChatId, activeChat, messages.length, messagesLoading, loadedChatIds]);
  
  // Scroll to bottom when messages change 
  useEffect(() => {
    // Only handle this if we have messages and aren't loading more
    if (!hasScrolledToBottom && messagesContainerRef.current && messages.length > 0 && !messagesLoading) {
      // Use requestAnimationFrame instead of setTimeout for better performance
      requestAnimationFrame(() => {
        const scrollContainer = messagesContainerRef.current;
        if (scrollContainer) {
          scrollContainer.scrollTop = scrollContainer.scrollHeight;
          setHasScrolledToBottom(true);
        }
      });
    }
  }, [messages, hasScrolledToBottom, messagesLoading]);
  
  // Check for new messages and AI responses periodically
  useEffect(() => {
    if (!activeChat || chatNotFound || messagesLoading || sendingMessage) {
      return; // Don't poll if chat is not active, not found, or messages are loading/sending
    }

    // Clear any existing polling interval
    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
    }

    // Local error counter to avoid unnecessary state updates
    let localErrorCount = 0;
    
    const newPollInterval = setInterval(async () => {
      // Skip polling if we're actively sending messages or component is unmounting
      if (sendingMessage) return;
      
      try {
        if (activeChat && localErrorCount < MAX_ERRORS) {
          // Use lastMessageId for efficient polling
          const lastMessageId = messages.length > 0 ? messages[messages.length - 1]._id : 'none';
          
          const response = await fetch(`/api/chats/${activeChat._id}/messages/poll?lastMessageId=${lastMessageId}`);
          
          if (!response.ok) {
            throw new Error(`Error polling messages: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Only fetch messages if there are actually new ones
          if (data.hasNewMessages) {
            await fetchMessages(activeChat._id);
            // Only update newMessageReceived if it's not already true
            // to avoid unnecessary state updates and re-renders
            if (!newMessageReceived) {
              setNewMessageReceived(true);
            }
          }
          
          // Reset error count on success, but only update state if changed
          localErrorCount = 0;
          if (errorCount !== 0) {
            setErrorCount(0);
          }
        }
      } catch (err) {
        console.error('Error polling for new messages:', err);
        localErrorCount += 1;
        
        // Only update error count in state if it changes
        if (errorCount !== localErrorCount) {
          setErrorCount(localErrorCount);
        }
        
        if (localErrorCount >= MAX_ERRORS) {
          console.error('Stopping polling due to consecutive errors');
          clearInterval(newPollInterval);
          setPollingIntervalId(null);
        }
      }
    }, 15000); // Poll every 15 seconds
    
    // Save the interval ID for cleanup
    setPollingIntervalId(newPollInterval);
    
    return () => {
      clearInterval(newPollInterval);
      setPollingIntervalId(null);
    };
  }, [activeChat, chatNotFound, messagesLoading, messages, newMessageReceived, errorCount, sendingMessage]);
  
  // Update the useEffect for handling scroll behavior - optimize to reduce rerenders
  useEffect(() => {
    // Only handle scroll updates if:
    // 1. Messages have loaded (not in loading state)
    // 2. There are messages to scroll to
    // 3. Either we have a new message or we're actively sending one
    if (messagesLoading || messages.length === 0 || (!newMessageReceived && !sendingMessage)) {
      return;
    }
    
    // Use a single requestAnimationFrame to batch DOM operations
    const frameId = requestAnimationFrame(() => {
      if (!messagesContainerRef.current || !messagesEndRef.current) return;
      
      try {
        const container = messagesContainerRef.current;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
        
        if (isNearBottom) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.error('Error handling scroll update:', error);
      }
    });
    
    return () => cancelAnimationFrame(frameId);
  }, [messages, messagesLoading, newMessageReceived, sendingMessage]);
  
  // Handle sending a message - memoize the callback to prevent rerenders
  const handleSendMessage = useCallback(async (messageData) => {
    if (!activeChat || !activeChat._id) {
      toast.error('No active chat selected');
      return;
    }
    
    try {
      // Create a simple flag to track if we should scroll after sending
      const shouldScrollAfter = true;
      
      // Validate messageData format
      const hasContent = messageData.content && messageData.content.trim().length > 0;
      const hasAttachments = messageData.attachments && 
                            Array.isArray(messageData.attachments) && 
                            messageData.attachments.length > 0;
      
      if (!hasContent && !hasAttachments) {
        toast.error('Message cannot be empty');
        return;
      }

      // Call the sendMessage function without validating each attachment again
      // to prevent unnecessary object iteration
      await sendMessage(
        activeChat._id, 
        hasContent ? messageData.content : '', 
        hasAttachments ? messageData.attachments : []
      );
      
      // If this was previously an empty chat, it now has messages
      if (messages.length === 0 && activeChat._id) {
        // Ensure it stays in loadedChatIds to prevent reload
        setLoadedChatIds(prev => new Set([...prev, activeChat._id]));
      }
      
      // Set a single state update after message is sent to trigger scroll
      if (shouldScrollAfter) {
        setNewMessageReceived(true);
      }
      
      // Don't fetch messages immediately after sending - the backend should return
      // the sent message and our context should update automatically,
      // and we already have polling in place
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Simplify error handling
      let errorMessage = 'Failed to send message';
      
      if (error.response) {
        if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid message format';
        } else if (error.response.status === 413) {
          errorMessage = 'File(s) too large. Maximum size is 10MB per file';
        } else {
          errorMessage = error.response.data?.message || errorMessage;
        }
      }
      
      toast.error(errorMessage);
    }
  }, [activeChat, sendMessage, messages.length]);
  
  // Create new chat - Stable reference
  const handleCreateChat = useCallback(() => {
    setShowCreateModal(true);
  }, []);
  
  // Open chat settings - Stable reference
  const handleOpenSettings = useCallback(() => {
    setShowSettingsModal(true);
  }, []);
  
  // Chat header - Memoized to prevent re-renders
  const chatHeader = useMemo(() => {
    if (!activeChat) return null;
    
    // Get the correct base path based on user role
    const basePath = user.role === 'admin' ? '/admin/chat' : '/user/chat';
    
    return (
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-2 text-gray-600"
            onClick={() => navigate(basePath)}
          >
            <MdArrowBack size={24} />
          </button>
          
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-semibold">
              {activeChat?.name?.charAt(0).toUpperCase() || 'C'}
            </div>
            <div className="ml-3">
              <div className="font-medium">{activeChat.name}</div>
              <div className="text-xs text-gray-500">
                {activeChat.participants && activeChat.participants.length} participants
                {activeChat.aiAssistant?.enabled && (
                  <span className="ml-2 flex items-center text-green-600">
                    <FaRobot className="mr-1" /> AI Assistant
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <button 
          className="text-gray-600 hover:text-gray-800"
          onClick={handleOpenSettings}
        >
          <BsThreeDotsVertical size={20} />
        </button>
      </div>
    );
  }, [activeChat, user?.role, navigate, handleOpenSettings]);
  
  // Memoize the ChatInput component to prevent needless re-renders
  const chatInputComponent = useMemo(() => {
    if (!activeChat) return null;
    
    return (
      <ChatInput 
        onSendMessage={handleSendMessage}
        disabled={!activeChat || sendingMessage || messagesLoading}
      />
    );
  }, [activeChat, handleSendMessage, sendingMessage, messagesLoading]);
  
  // Use a single memoized component for messages instead of duplicating
  const chatMessageSection = useMemo(() => {
    if (loading) {
      return <LoadingScreen />;
    }
    
    if (!activeChat) {
      return <NoChatSelectedScreen onCreateChat={handleCreateChat} />;
    }
    
    // Reset newMessageReceived when rendering new messages to prevent continuous scrolling
    if (newMessageReceived && !messagesLoading) {
      // Use setTimeout to ensure state update occurs after render
      setTimeout(() => {
        setNewMessageReceived(false);
      }, 100);
    }
    
    return (
      <ChatMessages
        key={`chat-${activeChat?._id || 'empty'}`}
        messages={messages}
        messagesLoading={messagesLoading}
        messagesEndRef={messagesEndRef}
        messagesContainerRef={messagesContainerRef}
        isNewMessage={newMessageReceived}
        sendingMessage={sendingMessage}
        user={user}
      />
    );
  }, [activeChat, loading, messages, messagesLoading, newMessageReceived, sendingMessage, user, handleCreateChat]);
  
  // Handle chat navigation - Stable reference with useCallback
  const handleChatSelect = useCallback((id) => {
    // Reset chat not found state
    setChatNotFound(false);
    setErrorCount(0);
    
    // Navigate to the correct path based on user role
    const basePath = user.role === 'admin' ? '/admin/chat' : '/user/chat';
    navigate(`${basePath}/${id}`);
  }, [user?.role, navigate]);
  
  // Optimize the main content rendering with better transition control
  const mainContent = useMemo(() => {
    // Pre-render both screens to avoid transition flicker
    return (
      <div 
        className={`flex flex-col flex-1 h-full overflow-hidden chat-transition ${!chatId ? 'hidden md:flex' : 'flex'}`}
        style={{
          transition: 'opacity 0.25s ease-in-out',
          opacity: messagesLoading && !messages.length ? 0.7 : 1,
          contain: 'content'
        }}
      >
        {activeChat ? (
          <div className="flex flex-col h-full fixed-container">
            {chatHeader}
            <div className="flex-grow overflow-hidden flex flex-col relative contain-layout">
              {chatMessageSection}
              {chatInputComponent}
            </div>
          </div>
        ) : (
          <EmptyStateScreen onCreateChat={handleCreateChat} />
        )}
      </div>
    );
  }, [chatId, activeChat, chatHeader, chatMessageSection, chatInputComponent, handleCreateChat, messagesLoading, messages.length]);
  
  // Memoize the sidebar component
  const sidebarComponent = useMemo(() => (
    <div className={`w-full md:w-80 bg-white border-r border-gray-200 ${chatId ? 'hidden md:block' : 'block'}`}>
      <ChatSidebar 
        onCreateChat={handleCreateChat} 
        onSelectChat={handleChatSelect}
      />
    </div>
  ), [chatId, handleCreateChat, handleChatSelect]);
  
  // Memoize modals to prevent re-renders
  const modalsComponent = useMemo(() => (
    <>
      {/* Create Chat Modal */}
      {showCreateModal && (
        <CreateChatModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(chatId) => {
            setShowCreateModal(false);
            // Reset chat not found state
            setChatNotFound(false);
            setErrorCount(0);
            // Navigate to the correct path based on user role
            const basePath = user.role === 'admin' ? '/admin/chat' : '/user/chat';
            navigate(`${basePath}/${chatId}`);
          }}
        />
      )}
      
      {/* Chat Settings Modal */}
      {showSettingsModal && activeChat && (
        <ChatSettingsModal
          chat={activeChat}
          onClose={() => setShowSettingsModal(false)}
        />
      )}
    </>
  ), [showCreateModal, showSettingsModal, activeChat, user?.role, navigate]);
  
  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarComponent}
      {mainContent}
      {modalsComponent}
    </div>
  );
};

export default ChatPage; 