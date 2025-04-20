import React, { useState } from 'react';
import { format } from 'date-fns';
import { FaRobot, FaEllipsisV, FaTrashAlt, FaRegSmile } from 'react-icons/fa';
import { useChat } from '../../../context/ChatContext';

const MessageItem = ({ message, isCurrentUser, isAI }) => {
  const [showActions, setShowActions] = useState(false);
  const { activeChat, deleteMessage, addReaction } = useChat();
  
  // Format message time
  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };
  
  // Handle message deletion
  const handleDelete = () => {
    deleteMessage(activeChat._id, message._id);
    setShowActions(false);
  };
  
  // Handle adding reaction
  const handleAddReaction = (emoji) => {
    addReaction(activeChat._id, message._id, emoji);
  };
  
  // Render message attachments
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="mt-2 space-y-2">
        {message.attachments.map((attachment) => (
          <div 
            key={attachment._id}
            className="bg-gray-100 rounded p-2 text-xs flex items-center"
          >
            <span className="truncate max-w-xs">{attachment.originalFilename}</span>
            <a 
              href={`/api/attachments/download/${attachment._id}`}
              className="ml-2 text-blue-500 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </div>
        ))}
      </div>
    );
  };
  
  // Render message reactions
  const renderReactions = () => {
    if (!message.reactions || message.reactions.length === 0) return null;
    
    // Group reactions by emoji
    const reactionGroups = message.reactions.reduce((groups, reaction) => {
      if (!groups[reaction.emoji]) {
        groups[reaction.emoji] = [];
      }
      groups[reaction.emoji].push(reaction.user);
      return groups;
    }, {});
    
    return (
      <div className="flex mt-1 space-x-1">
        {Object.entries(reactionGroups).map(([emoji, users]) => (
          <div 
            key={emoji}
            className="bg-gray-100 rounded-full px-2 py-0.5 text-xs flex items-center cursor-pointer hover:bg-gray-200"
            onClick={() => handleAddReaction(emoji)}
            title={users.map(u => u.name).join(', ')}
          >
            <span className="mr-1">{emoji}</span>
            <span>{users.length}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className={`mb-4 max-w-3/4 ${isCurrentUser ? 'ml-auto' : ''}`}>
      <div className="flex items-start">
        {/* Message content */}
        <div className={`relative rounded-lg p-3 ${isCurrentUser ? 'bg-blue-500 text-white' : isAI ? 'bg-purple-100' : 'bg-gray-100'}`}>
          {/* Sender name for non-current user */}
          {!isCurrentUser && (
            <div className="flex items-center mb-1">
              {isAI && <FaRobot className="mr-1 text-purple-500" />}
              <span className="font-medium text-xs text-gray-600">
                {message.sender.name}
              </span>
            </div>
          )}
          
          {/* Message text */}
          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
          
          {/* Attachments */}
          {renderAttachments()}
          
          {/* Message time */}
          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </div>
          
          {/* Reactions */}
          {renderReactions()}
          
          {/* Message actions */}
          <div className="absolute top-2 right-2">
            <button 
              className={`p-1 rounded-full ${isCurrentUser ? 'text-white hover:bg-blue-600' : 'text-gray-500 hover:bg-gray-200'}`}
              onClick={() => setShowActions(!showActions)}
            >
              <FaEllipsisV size={12} />
            </button>
            
            {showActions && (
              <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setShowActions(false)}
                  >
                    <FaRegSmile className="mr-2" /> Add Reaction
                  </button>
                  
                  {isCurrentUser && (
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      onClick={handleDelete}
                    >
                      <FaTrashAlt className="mr-2" /> Delete
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 