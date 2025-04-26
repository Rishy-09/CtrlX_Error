import React, { useState, useContext, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useChat } from '../../../context/ChatContext';
import { FaPlus, FaUser, FaUsers, FaGlobe, FaRobot } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../../../context/userContext';

// Optimize the chat item to prevent render issues
const ChatItem = memo(({ chat, isActive, onClick, currentUserId }) => {
  // Memoize icon to prevent re-renders
  const chatIcon = useMemo(() => {
    switch (chat.chatType) {
      case 'private':
        return <FaUser className="text-gray-500" />;
      case 'team':
        return <FaUsers className="text-blue-500" />;
      case 'public':
        return <FaGlobe className="text-green-500" />;
      case 'ai_assistant':
        return <FaRobot className="text-purple-500" />;
      default:
        return <FaGlobe className="text-gray-500" />;
    }
  }, [chat.chatType]);
  
  // Format time for display
  const formattedTime = useMemo(() => {
    if (!chat.lastMessage?.createdAt) return '';
    const date = new Date(chat.lastMessage.createdAt);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return format(date, 'h:mm a');
    }
    
    // If this week, show day
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return format(date, 'EEE');
    }
    
    // Otherwise show date
    return format(date, 'MM/dd/yy');
  }, [chat.lastMessage?.createdAt]);
  
  // Get sender display name
  const displaySenderName = useMemo(() => {
    const message = chat.lastMessage;
    if (!message || !message.sender) return '';
    
    // Check if it's an AI message
    if (message.sender.isAI || message.isAIMessage || 
        (message.sender.name && message.sender.name.includes('AI'))) {
      return 'AI: ';
    }
    
    // Check if it's the current user
    if (message.sender._id === currentUserId) {
      return 'You: ';
    }
    
    // Otherwise use the sender's first name
    const name = message.sender.name || message.sender.username || 'User';
    return `${name.split(' ')[0]}: `;
  }, [chat.lastMessage, currentUserId]);

  // Optimize chatItem rendering
  return (
    <div 
      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150 ${isActive ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className="mr-3 flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            {chatIcon}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {chat.name}
            </h3>
            {chat.lastMessage && (
              <span className="text-xs text-gray-500">
                {formattedTime}
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <p className="text-xs text-gray-500 truncate">
              {chat.lastMessage ? (
                <>
                  <span className="font-medium">
                    {displaySenderName}
                  </span>
                  {chat.lastMessage.content}
                </>
              ) : (
                'No messages yet'
              )}
            </p>
            
            {chat.unreadCount > 0 && (
              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {chat.unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.chat._id === nextProps.chat._id &&
    prevProps.chat.lastMessage?.createdAt === nextProps.chat.lastMessage?.createdAt &&
    prevProps.chat.unreadCount === nextProps.chat.unreadCount
  );
});

// Main sidebar component
const ChatSidebar = memo(({ onCreateChat, onSelectChat }) => {
  const { chats, loading, activeChat, fetchChats } = useChat();
  const { user } = useContext(UserContext);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const { chatId } = useParams(); // Get current chatId from URL
  const initialFetchDone = useRef(false);
  
  // Fetch chats when component mounts - but only once
  useEffect(() => {
    if (!initialFetchDone.current) {
      // Fetch all chats initially
      fetchChats();
      initialFetchDone.current = true;
    }
  }, [fetchChats]);
  
  // Filter chats by type - memoized to prevent unnecessary re-renders
  const handleFilterChange = useCallback((type) => {
    if (type !== filter) {
      setFilter(type);
      fetchChats(type === 'all' ? null : type);
    }
  }, [filter, fetchChats]);
  
  // Handle chat selection with stable reference
  const handleChatClick = useCallback((selectedChatId) => {
    if (selectedChatId === chatId) {
      return; // Prevent re-navigation to the same chat
    }
    
    // Navigate to the correct path based on user role
    const basePath = user.role === 'admin' ? '/admin/chat' : '/user/chat';
    navigate(`${basePath}/${selectedChatId}`);
    
    if (onSelectChat) {
      onSelectChat(selectedChatId);
    }
  }, [user?.role, navigate, onSelectChat, chatId]);
  
  // Memoize the filter buttons to prevent re-renders
  const filterButtons = useMemo(() => (
    <div className="flex p-2 bg-gray-50 border-b border-gray-200">
      <button 
        className={`flex-1 py-2 text-sm font-medium rounded-md ${filter === 'all' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => handleFilterChange('all')}
      >
        All
      </button>
      <button 
        className={`flex-1 py-2 text-sm font-medium rounded-md ${filter === 'public' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => handleFilterChange('public')}
      >
        Public
      </button>
      <button 
        className={`flex-1 py-2 text-sm font-medium rounded-md ${filter === 'team' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => handleFilterChange('team')}
      >
        Team
      </button>
      <button 
        className={`flex-1 py-2 text-sm font-medium rounded-md ${filter === 'private' ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
        onClick={() => handleFilterChange('private')}
      >
        Private
      </button>
    </div>
  ), [filter, handleFilterChange]);
  
  // Memoize the chat list to prevent unnecessary re-renders
  const chatList = useMemo(() => {
    if (loading && chats.length === 0) {
      return (
        <div className="flex justify-center items-center h-32">
          <div className="spinner"></div>
        </div>
      );
    }
    
    if (chats.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          <p>No chats available</p>
          <button 
            className="mt-2 text-blue-500 hover:underline"
            onClick={onCreateChat}
          >
            Create your first chat
          </button>
        </div>
      );
    }
    
    return (
      <div className="space-y-1">
        {chats.map(chat => (
          <ChatItem 
            key={chat._id}
            chat={chat}
            isActive={activeChat?._id === chat._id || chatId === chat._id}
            onClick={() => handleChatClick(chat._id)}
            currentUserId={user?._id}
          />
        ))}
      </div>
    );
  }, [chats, loading, activeChat, chatId, handleChatClick, onCreateChat, user?._id]);
  
  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <h2 className="text-xl font-semibold">Chats</h2>
        <button 
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors duration-150"
          onClick={onCreateChat}
        >
          <FaPlus />
        </button>
      </div>
      
      {/* Chat type filters */}
      {filterButtons}
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {chatList}
      </div>
    </div>
  );
});

export default ChatSidebar; 