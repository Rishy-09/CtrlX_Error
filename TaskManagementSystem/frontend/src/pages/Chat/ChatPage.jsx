import React, { useState, useEffect, useRef, useContext } from 'react';
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
  
  // Fetch active chat when chatId changes
  useEffect(() => {
    let isActive = true; // For cleanup/cancellation
    
    const loadChat = async () => {
      if (chatId) {
        try {
          const chat = await fetchChatById(chatId);
          // Only update state if component is still mounted
          if (isActive && !chat) {
            toast.error('Chat not found or you do not have access');
            // Navigate to the correct path based on user role
            const basePath = user.role === 'admin' ? '/admin/chat' : '/user/chat';
            navigate(basePath);
          }
        } catch (error) {
          console.error('Error loading chat:', error);
          if (isActive) {
            toast.error('Failed to load chat');
            // Navigate to the correct path based on user role
            const basePath = user.role === 'admin' ? '/admin/chat' : '/user/chat';
            navigate(basePath);
          }
        }
      } else if (isActive) {
        clearActiveChat();
      }
    };
    
    loadChat();
    
    // Cleanup function
    return () => {
      isActive = false;
    };
  }, [chatId, fetchChatById, navigate, clearActiveChat, user.role]);
  
  // Fetch messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id);
      setHasScrolledToBottom(false);
    }
  }, [activeChat, fetchMessages]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current && !hasScrolledToBottom) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      setHasScrolledToBottom(true);
    }
  }, [messages, hasScrolledToBottom]);
  
  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && messagesEndRef.current && hasScrolledToBottom) {
      const isScrolledToBottom = messagesContainerRef.current && 
        (messagesContainerRef.current.scrollHeight - messagesContainerRef.current.scrollTop - messagesContainerRef.current.clientHeight < 100);
      
      if (isScrolledToBottom || sendingMessage) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages, sendingMessage, hasScrolledToBottom]);
  
  // Check for new messages and AI responses periodically
  useEffect(() => {
    if (activeChat && activeChat._id) {
      // Initial fetch only if we don't have messages already
      if (messages.length === 0) {
        fetchMessages(activeChat._id);
      }
      
      // Set up polling for new messages - especially important for AI responses
      const interval = setInterval(() => {
        if (activeChat.aiAssistant?.enabled) {
          fetchMessages(activeChat._id);
        }
      }, 5000); // Poll every 5 seconds - only if AI is enabled
      
      return () => clearInterval(interval);
    }
  }, [activeChat, fetchMessages, messages.length]);
  
  // Handle sending a message
  const handleSendMessage = async (messageData) => {
    if (!messageData.content.trim() && (!messageData.attachments || messageData.attachments.length === 0)) {
      return;
    }
    
    try {
      // Format the data to match what the backend expects
      const formData = new FormData();
      formData.append('content', messageData.content);
      
      // Add attachments if any
      if (messageData.attachments && messageData.attachments.length > 0) {
        messageData.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }
      
      // Send the message through the chat context
      await sendMessage(chatId, formData);
      
      // If AI assistant is enabled, automatically fetch messages again after a delay
      // to show the AI response
      if (activeChat?.aiAssistant?.enabled) {
        setTimeout(() => {
          fetchMessages(chatId);
        }, 1000);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    }
  };
  
  // Create new chat
  const handleCreateChat = () => {
    setShowCreateModal(true);
  };
  
  // Open chat settings
  const handleOpenSettings = () => {
    setShowSettingsModal(true);
  };
  
  // Chat header
  const renderChatHeader = () => {
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
                {activeChat.participants.length} participants
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
  };
  
  // Message list
  const renderMessages = () => {
    if (messagesLoading && messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <div className="mt-2 text-gray-500">Loading messages...</div>
        </div>
      );
    }
    
    if (messages.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-lg mb-2">No messages yet</div>
          <div className="text-sm">Be the first to send a message!</div>
        </div>
      );
    }
    
    return (
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
        style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 160px)' }}
      >
        {messages.map((message) => (
          <MessageItem 
            key={message._id} 
            message={message} 
            isCurrentUser={message.sender._id === user?._id}
            isAI={message.isAIMessage || message.sender.isAI}
            onReply={(replyMessage) => {
              // Scroll message input into view and focus it
              document.querySelector('.message-input')?.focus();
              // You could also add functionality to show which message is being replied to
            }}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    );
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - hidden on mobile when a chat is active */}
      <div className={`w-full md:w-80 bg-white border-r border-gray-200 ${chatId ? 'hidden md:block' : 'block'}`}>
        <ChatSidebar 
          onCreateChat={handleCreateChat} 
          onSelectChat={(id) => {
            // Navigate to the correct path based on user role
            const basePath = user.role === 'admin' ? '/admin/chat' : '/user/chat';
            navigate(`${basePath}/${id}`);
          }}
        />
      </div>
      
      {/* Main chat area */}
      <div className={`flex flex-col flex-1 ${!chatId ? 'hidden md:flex' : 'flex'}`}>
        {activeChat ? (
          <>
            {renderChatHeader()}
            {renderMessages()}
            <ChatInput 
              onSendMessage={handleSendMessage} 
              disabled={loading || !activeChat || sendingMessage}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-xl mb-2">Select a chat or create a new one</div>
            <button
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              onClick={handleCreateChat}
            >
              Create New Chat
            </button>
          </div>
        )}
      </div>
      
      {/* Create Chat Modal */}
      {showCreateModal && (
        <CreateChatModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(chatId) => {
            setShowCreateModal(false);
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
    </div>
  );
};

export default ChatPage; 