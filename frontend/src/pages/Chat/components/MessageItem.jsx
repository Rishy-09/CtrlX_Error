import React, { useState, useContext, memo, useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { FaRobot, FaEllipsisV, FaTrashAlt, FaRegSmile, FaReply } from 'react-icons/fa';
import { useChat } from '../../../context/ChatContext';
import { FiDownload, FiFile } from 'react-icons/fi';
import { UserContext } from '../../../context/userContext';

// Format file size helper
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format message time with error handling
const formatTime = (dateString) => {
  if (!dateString) return '';
  try {
    return format(new Date(dateString), 'h:mm a');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Helper function to compare attachment objects for equality
const areAttachmentsEqual = (prevAttachments, nextAttachments) => {
  if (!prevAttachments && !nextAttachments) return true;
  if (!prevAttachments || !nextAttachments) return false;
  if (prevAttachments.length !== nextAttachments.length) return false;
  
  // Compare each attachment by its ID or other unique identifier
  return prevAttachments.every((prevAtt, index) => {
    const nextAtt = nextAttachments[index];
    // Use _id if available, otherwise fall back to other identifiers
    const prevId = prevAtt._id || prevAtt.id || prevAtt.name;
    const nextId = nextAtt._id || nextAtt.id || nextAtt.name;
    return prevId === nextId;
  });
};

// Attachment component to optimize rendering
const Attachment = memo(({ attachment, isCurrentUser }) => {
  const [imageError, setImageError] = useState(false);
  
  // Determine if this is an image based on MIME type or file type
  const isImage = !imageError && (
    attachment.mimeType?.startsWith('image/') || 
    attachment.type?.startsWith('image/')
  );
  
  // Handle image loading errors
  const handleImageError = () => {
    console.error('Error loading image:', attachment);
    setImageError(true);
  };
  
  // Select the appropriate URL for preview and download
  const previewUrl = attachment.previewUrl || 
                     (attachment._id ? `/api/attachments/view/${attachment._id}` : null);
  
  const downloadUrl = attachment.fileUrl || 
                      (attachment._id ? `/api/attachments/download/${attachment._id}` : null);
  
  // For temporary messages with attachments that are still being uploaded
  const isTemporary = attachment.isTemporary || !attachment._id;
  
  if (isImage && previewUrl) {
    return (
      <div className="relative w-28 h-28 group">
        <img 
          src={previewUrl}
          alt={attachment.originalFilename || attachment.name || 'Image attachment'}
          className={`w-full h-full object-cover ${isTemporary ? 'opacity-70' : ''}`} 
          loading="lazy"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
          {!isTemporary && downloadUrl && (
            <a 
              href={downloadUrl}
              download={attachment.originalFilename || attachment.name}
              className="p-1.5 bg-white rounded-full"
              onClick={(e) => e.stopPropagation()}
            >
              <FiDownload size={16} className="text-gray-700" />
            </a>
          )}
          {isTemporary && (
            <div className="p-1.5 bg-white rounded-full">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center p-2 ${isCurrentUser ? 'text-white' : 'text-gray-700'}`}>
      <FiFile size={18} className="mr-2 flex-shrink-0" />
      <div className="flex-1 min-w-0 mr-2">
        <p className="text-sm font-medium truncate max-w-[150px]">
          {attachment.originalFilename || attachment.name || 'File attachment'}
        </p>
        {(attachment.size || attachment.fileSize) && (
          <p className="text-xs opacity-75">
            {formatFileSize(attachment.size || attachment.fileSize)}
          </p>
        )}
      </div>
      {!isTemporary && downloadUrl ? (
        <a 
          href={downloadUrl}
          download={attachment.originalFilename || attachment.name}
          className={`p-1 rounded ${isCurrentUser ? 'hover:bg-blue-600' : 'hover:bg-gray-200'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <FiDownload size={14} />
        </a>
      ) : (
        <div className="p-1">
          <div className="animate-spin h-3 w-3 border-2 border-gray-400 border-t-transparent rounded-full" />
        </div>
      )}
    </div>
  );
});

// Reaction component to optimize rendering
const Reactions = memo(({ reactions, onAddReaction }) => {
  if (!reactions || reactions.length === 0) return null;
  
  // Group reactions by emoji
  const reactionGroups = reactions.reduce((groups, reaction) => {
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
          onClick={() => onAddReaction(emoji)}
          title={users.map(u => u.name || u.username).join(', ')}
        >
          <span className="mr-1">{emoji}</span>
          <span>{users.length}</span>
        </div>
      ))}
    </div>
  );
});

// Main MessageItem component with optimized rendering
const MessageItem = memo(({ message, className = '' }) => {
  const { user } = useContext(UserContext);
  const { deleteMessage, addReaction } = useChat();
  const [showActions, setShowActions] = useState(false);
  
  const isCurrentUser = useMemo(() => {
    return message.sender?._id === user?._id;
  }, [message.sender?._id, user?._id]);

  // Cache the message ID to avoid lookups in multiple places
  const messageId = useMemo(() => message._id, [message._id]);
  
  // Memoize handler functions to avoid recreating them on each render
  const handleDeleteMessage = useCallback(() => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessage(messageId);
    }
  }, [deleteMessage, messageId]);
  
  const handleAddReaction = useCallback((emoji) => {
    addReaction(messageId, emoji);
  }, [addReaction, messageId]);
  
  // Create a stable attachments array reference with deep comparison
  const attachmentsArray = useMemo(() => {
    if (!message.attachments || message.attachments.length === 0) {
      return [];
    }
    
    // Log attachment debugging info
    if (process.env.NODE_ENV !== 'production') {
      console.log(`Processing ${message.attachments.length} attachments for message:`, 
        message.attachments.map(a => ({
          id: a._id || a.id,
          name: a.originalFilename || a.name,
          type: a.mimeType || a.type,
          size: a.size || a.fileSize
        }))
      );
    }
    
    // Ensure attachments are properly formatted with consistent property names
    return message.attachments.map(attachment => {
      // Standardize attachment properties to handle both server and client-side formats
      const standardizedAttachment = {
        ...attachment,
        _id: attachment._id || attachment.id || `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: attachment.originalFilename || attachment.name || 'Unnamed file',
        type: attachment.mimeType || attachment.type || 'application/octet-stream',
        size: attachment.size || attachment.fileSize || 0,
        isTemporary: attachment.isTemporary || false
      };
      
      // If this is a temporary attachment being uploaded, keep the local preview URL
      if (!standardizedAttachment.previewUrl && 
          standardizedAttachment.type.startsWith('image/') && 
          standardizedAttachment._id) {
        standardizedAttachment.previewUrl = `/api/attachments/view/${standardizedAttachment._id}`;
      }
      
      return standardizedAttachment;
    });
  }, [message.attachments]);

  // Memoize attachments rendering with proper dependency tracking
  const attachmentsContent = useMemo(() => {
    if (attachmentsArray.length === 0) return null;
    
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {attachmentsArray.map((attachment) => (
          <div 
            key={attachment._id || attachment.id || attachment.name}
            className={`border rounded overflow-hidden ${isCurrentUser ? 'bg-blue-400' : 'bg-gray-100'}`}
            style={{ contain: 'content', willChange: 'auto' }}
          >
            <Attachment 
              attachment={attachment} 
              isCurrentUser={isCurrentUser} 
            />
          </div>
        ))}
      </div>
    );
  }, [attachmentsArray, isCurrentUser]);
  
  // Memoize reactions rendering
  const reactionsContent = useMemo(() => {
    return (
      <Reactions 
        reactions={message.reactions} 
        onAddReaction={handleAddReaction} 
      />
    );
  }, [message.reactions, handleAddReaction]);
    
  // Memoize the time format to avoid recalculation
  const formattedTime = useMemo(() => {
    return formatTime(message.createdAt);
  }, [message.createdAt]);
  
  // Optimize message action buttons
  const actionButtons = useMemo(() => {
    if (!showActions) return null;
    
    return (
      <div className="absolute right-0 -top-10 bg-white shadow rounded-lg flex">
        <button 
          className="p-2 hover:bg-gray-100 rounded-l-lg"
          onClick={() => handleAddReaction('👍')}
        >
          <FaRegSmile size={14} />
        </button>
        <button 
          className="p-2 hover:bg-gray-100"
          onClick={() => console.log('Reply to message')}
        >
          <FaReply size={14} />
        </button>
        {isCurrentUser && (
          <button 
            className="p-2 hover:bg-gray-100 text-red-500 rounded-r-lg"
            onClick={handleDeleteMessage}
          >
            <FaTrashAlt size={14} />
          </button>
        )}
      </div>
    );
  }, [showActions, handleAddReaction, isCurrentUser, handleDeleteMessage]);
  
  // Memoize the entire message container to reduce re-renders
  return (
    <div 
      className={`relative message-item group ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      style={{ contain: 'content', willChange: 'auto' }}
    >
      <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[85%] relative ${isCurrentUser ? 'order-2' : 'order-1'}`}>
          {/* Message bubble */}
          <div 
            className={`rounded-lg p-3 ${
              isCurrentUser 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {/* Sender name - only show if not current user */}
            {!isCurrentUser && (
              <div className="font-semibold text-sm mb-1">
                {message.sender?.username || message.sender?.name || 'Unknown User'}
                {message.sender?.isAI && (
                  <FaRobot className="inline-block ml-1 text-blue-500" />
                )}
              </div>
            )}
            
            {/* Message content */}
            <div className="whitespace-pre-wrap break-words">{message.content}</div>
            
            {/* Attachments section */}
            {attachmentsContent}
          </div>
          
          {/* Reactions */}
          <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
            {reactionsContent}
          </div>
          
          {/* Message time */}
          <div 
            className={`text-xs text-gray-500 mt-1 ${
              isCurrentUser ? 'text-right' : 'text-left'
            }`}
          >
            {formattedTime}
          </div>
        </div>
        
        {/* Action buttons */}
        {actionButtons}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memoization to prevent unnecessary re-renders
  // Only re-render if important props change
  
  // If message ID is different, definitely re-render
  if (prevProps.message._id !== nextProps.message._id) return false;
  
  // If message content changed, re-render
  if (prevProps.message.content !== nextProps.message.content) return false;
  
  // If deleted state changed, re-render
  if (prevProps.message.deleted !== nextProps.message.deleted) return false;
  
  // If reactions changed (in length), re-render
  if (
    (!prevProps.message.reactions && nextProps.message.reactions) ||
    (prevProps.message.reactions && !nextProps.message.reactions) ||
    (prevProps.message.reactions?.length !== nextProps.message.reactions?.length)
  ) return false;
  
  // Deep compare attachments
  if (!areAttachmentsEqual(prevProps.message.attachments, nextProps.message.attachments)) {
    return false;
  }
  
  // Otherwise, don't re-render
  return true;
});

export default MessageItem; 