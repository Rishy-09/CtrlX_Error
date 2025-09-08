import { useEffect, useMemo } from 'react';
import { useChat } from '../../context/ChatContext';
import { FaRobot, FaUsers, FaGlobe, FaUser } from 'react-icons/fa';

const ChatSidebar = () => {
  const { chats, activeChat, setActiveChat, loading, fetchChats } = useChat();

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Get chat type icon
  const getChatTypeIcon = (type) => {
    switch (type) {
      case 'ai_assistant':
        return <FaRobot className="text-purple-500" />;
      case 'team':
        return <FaUsers className="text-blue-500" />;
      case 'public':
        return <FaGlobe className="text-green-500" />;
      case 'private':
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  // Format date for last message
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      // Today - show time
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      // Yesterday
      return 'Yesterday';
    } else if (diffInDays < 7) {
      // Within a week - show day name
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      // Older - show date
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  // Get last message preview
  const getMessagePreview = (chat) => {
    if (!chat.lastMessage) return 'No messages yet';
    
    if (chat.lastMessage.isDeleted) {
      return 'This message was deleted';
    }
    
    // Truncate message if too long
    const content = chat.lastMessage.content || '';
    return content.length > 30 ? `${content.substring(0, 30)}...` : content;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {loading.chats ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center p-4 text-gray-500">
          No chats yet. Create one to get started.
        </div>
      ) : (
        <ul>
          {chats.map((chat) => (
            <li 
              key={chat._id}
              onClick={() => setActiveChat(chat)}
              className={`
                p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 
                ${activeChat?._id === chat._id ? 'bg-blue-50' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getChatTypeIcon(chat.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="font-medium text-gray-900 truncate">
                      {chat.name}
                    </p>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500">
                        {formatDate(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage ? (
                      <>
                        {chat.lastMessage.sender?.name !== undefined && (
                          <span className="font-medium">
                            {chat.lastMessage.isAIMessage 
                              ? 'AI: ' 
                              : `${chat.lastMessage.sender.name}: `}
                          </span>
                        )}
                        {getMessagePreview(chat)}
                      </>
                    ) : (
                      'No messages yet'
                    )}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ChatSidebar; 