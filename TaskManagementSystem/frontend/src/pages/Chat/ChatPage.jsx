import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '../../context/ChatContext';
import { useContext } from 'react';
import { UserContext } from '../../context/userContext';
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
  const { user } = useContext(UserContext);
  const {
    chats,
    activeChat,
    messages,
    loading,
    messagesLoading,
    fetchChats,
    fetchChatById,
    fetchMessages,
    sendMessage,
    setActiveChat,
    clearActiveChat
  } = useChat();
  
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Load chat data
  useEffect(() => {
    if (chatId) {
      fetchChatById(chatId);
      fetchMessages(chatId);
    } else {
      clearActiveChat();
    }
  }, [chatId]);
  
  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending a message
  const handleSendMessage = async (messageData) => {
    if (!messageData.content.trim() && messageData.attachments.length === 0) return;
    
    try {
      await sendMessage(chatId, messageData);
    } catch (error) {
      console.error('Error sending message:', error);
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
    
    return (
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <button 
            className="md:hidden mr-2 text-gray-600"
            onClick={() => navigate('/user/chat')}
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
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageItem 
            key={message._id} 
            message={message} 
            isCurrentUser={message.sender._id === user._id}
            isAI={message.isAIMessage}
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
          onSelectChat={(id) => navigate(`/user/chat/${id}`)}
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
              disabled={loading || !activeChat}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-xl mb-2">Select a chat or create a new one</div>
            <button 
              onClick={handleCreateChat} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create New Chat
            </button>
          </div>
        )}
      </div>
      
      {/* Modals */}
      {showCreateModal && (
        <CreateChatModal 
          onClose={() => setShowCreateModal(false)}
          onChatCreated={(chatId) => navigate(`/user/chat/${chatId}`)}
        />
      )}
      
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