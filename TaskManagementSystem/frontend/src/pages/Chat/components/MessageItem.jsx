import React, { useState, useContext } from 'react';
import { format } from 'date-fns';
import { FaRobot, FaEllipsisV, FaTrashAlt, FaRegSmile, FaReply } from 'react-icons/fa';
import { useChat } from '../../../context/ChatContext';
import { FiDownload, FiFile } from 'react-icons/fi';
import { UserContext } from '../../../context/userContext';

const MessageItem = ({ message, onReply }) => {
  const { user } = useContext(UserContext);
  const isCurrentUser = message.sender._id === user?._id;
  const isAI = message.isAIMessage || message.sender.isAI;
  const { activeChat, deleteMessage, addReaction } = useChat();
  const [showActions, setShowActions] = useState(false);
  
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
  
  // Handle reply to message
  const handleReply = () => {
    if (onReply) {
      onReply(message);
      setShowActions(false);
    }
  };
  
  // Format attachments for display
  const renderAttachments = () => {
    if (!message.attachments || message.attachments.length === 0) return null;
    
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {message.attachments.map((attachment) => {
          const isImage = attachment.mimeType?.startsWith('image/') || 
                          attachment.type?.startsWith('image/');
          
          return (
            <div 
              key={attachment._id || attachment.id || attachment.name}
              className={`border rounded overflow-hidden ${isCurrentUser ? 'bg-blue-400' : 'bg-gray-100'}`}
            >
              {isImage ? (
                <div className="relative w-28 h-28 group">
                  <img 
                    src={attachment.previewUrl || `/api/attachments/view/${attachment._id}`}
                    alt={attachment.originalFilename || attachment.name}
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <a 
                      href={attachment.fileUrl || `/api/attachments/download/${attachment._id}`}
                      download={attachment.originalFilename || attachment.name}
                      className="p-1.5 bg-white rounded-full"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <FiDownload size={16} className="text-gray-700" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className={`flex items-center p-2 ${isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
                  <FiFile size={18} className="mr-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0 mr-2">
                    <p className="text-sm font-medium truncate max-w-[150px]">
                      {attachment.originalFilename || attachment.name}
                    </p>
                    {(attachment.size || attachment.fileSize) && (
                      <p className="text-xs opacity-75">
                        {formatFileSize(attachment.size || attachment.fileSize)}
                      </p>
                    )}
                  </div>
                  <a 
                    href={attachment.fileUrl || `/api/attachments/download/${attachment._id}`}
                    download={attachment.originalFilename || attachment.name}
                    className={`p-1 rounded ${isCurrentUser ? 'hover:bg-blue-600' : 'hover:bg-gray-200'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FiDownload size={14} />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
            title={users.map(u => u.name || u.username).join(', ')}
          >
            <span className="mr-1">{emoji}</span>
            <span>{users.length}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div 
      className={`mb-4 ${isCurrentUser ? 'ml-auto' : ''}`}
      style={{ maxWidth: '75%' }}
    >
      <div className="flex items-start">
        {/* Message content */}
        <div 
          className={`relative rounded-lg p-3 ${
            isCurrentUser 
              ? 'bg-blue-500 text-white' 
              : isAI 
                ? 'bg-purple-100 border border-purple-200 text-gray-800' 
                : 'bg-gray-100 text-gray-800'
          }`}
        >
          {/* Sender name for non-current user */}
          {!isCurrentUser && (
            <div className="flex items-center mb-1">
              {isAI ? (
                <div className="flex items-center">
                  <FaRobot className="mr-1 text-purple-500" />
                  <span className="font-medium text-xs text-purple-600">
                    AI Assistant
                  </span>
                </div>
              ) : (
                <span className="font-medium text-xs text-gray-600">
                  {message.sender.name || message.sender.username || 'User'}
                </span>
              )}
            </div>
          )}
          
          {/* Message text */}
          <div className={`text-sm whitespace-pre-wrap ${isAI ? 'prose prose-sm max-w-none' : ''}`}>
            {message.content}
          </div>
          
          {/* Attachments */}
          {renderAttachments()}
          
          {/* Message time */}
          <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-200' : isAI ? 'text-purple-400' : 'text-gray-500'}`}>
            {formatTime(message.createdAt)}
          </div>
          
          {/* Reactions */}
          {renderReactions()}
          
          {/* Message actions - don't show for AI messages */}
          {!isAI && (
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
                    {onReply && (
                      <button 
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={handleReply}
                      >
                        <FaReply className="mr-2" /> Reply
                      </button>
                    )}
                    
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
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageItem; 