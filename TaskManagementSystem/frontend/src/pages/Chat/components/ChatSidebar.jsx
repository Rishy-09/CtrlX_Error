import React, { useState, useContext } from 'react';
import { useChat } from '../../../context/ChatContext';
import { FaPlus, FaUser, FaUsers, FaGlobe, FaRobot } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../../context/userContext';

const ChatSidebar = ({ onCreateChat, onSelectChat }) => {
  const { chats, loading, activeChat, fetchChats } = useChat();
  const { user } = useContext(UserContext);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  
  // Filter chats by type
  const handleFilterChange = (type) => {
    setFilter(type);
    fetchChats(type === 'all' ? null : type);
  };
  
  // Get chat icon based on type
  const getChatIcon = (chatType) => {
    switch (chatType) {
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
  };
  
  // Format time for display
  const formatMessageTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
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
  };

  // Handle chat selection
  const handleChatClick = (chatId) => {
    // Navigate to the correct path based on user role
    const basePath = user.role === 'admin' ? '/admin/chat' : '/user/chat';
    navigate(`${basePath}/${chatId}`);
    
    if (onSelectChat) {
      onSelectChat(chatId);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-white">
        <h2 className="text-xl font-semibold">Chats</h2>
        <button 
          className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          onClick={onCreateChat}
        >
          <FaPlus />
        </button>
      </div>
      
      {/* Chat type filters */}
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
      
      {/* Chat list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No chats available</p>
            <button 
              className="mt-2 text-blue-500 hover:underline"
              onClick={onCreateChat}
            >
              Create your first chat
            </button>
          </div>
        ) : (
          chats.map(chat => (
            <div 
              key={chat._id}
              className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${activeChat?._id === chat._id ? 'bg-blue-50' : ''}`}
              onClick={() => handleChatClick(chat._id)}
            >
              <div className="flex items-center">
                <div className="mr-3 flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                    {getChatIcon(chat.chatType)}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {chat.name}
                    </h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatMessageTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <p className="text-xs text-gray-500 truncate">
                      {chat.lastMessage ? (
                        <>
                          <span className="font-medium">
                            {chat.lastMessage.sender.name === 'AI Assistant' ? 'AI: ' : 
                              chat.lastMessage.sender._id === activeChat?.admins[0] ? 'You: ' : 
                              `${chat.lastMessage.sender.name.split(' ')[0]}: `}
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
          ))
        )}
      </div>
    </div>
  );
};

export default ChatSidebar; 