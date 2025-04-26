import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { FiSend, FiPaperclip, FiX, FiSmile } from 'react-icons/fi';
import TextareaAutosize from 'react-textarea-autosize';
import Picker from 'emoji-picker-react';
import { toast } from 'react-hot-toast';

// Move the AttachmentPreview component outside of ChatInput
// This prevents it from being recreated on each render
const AttachmentPreview = memo(({ attachment, onRemove, isSending }) => (
  <div 
    className="relative bg-gray-100 rounded p-2 flex items-center gap-2"
  >
    {attachment.type.startsWith('image/') && (
      <div className="w-6 h-6 mr-1">
        <img 
          src={attachment.previewUrl} 
          alt={attachment.name}
          className="w-full h-full object-cover rounded"
          loading="lazy"
        />
      </div>
    )}
    <span className="text-xs truncate max-w-[150px]">
      {attachment.name}
    </span>
    <button
      onClick={() => onRemove(attachment.id)}
      className="text-gray-600 hover:text-red-500"
      disabled={isSending}
      type="button"
      aria-label={`Remove ${attachment.name}`}
    >
      <FiX size={16} />
    </button>
  </div>
));

// Use memo to prevent unnecessary re-renders with custom comparison
const ChatInput = memo(({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const textareaRef = useRef(null);
  const previousRenderRef = useRef({ disabled, isSending });
  
  // Close emoji picker when clicking outside - use useCallback
  const handleClickOutside = useCallback((event) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
      setShowEmojiPicker(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Reset isSending when disabled changes - track previous values to avoid updates
  useEffect(() => {
    if (!disabled && isSending && previousRenderRef.current.disabled !== disabled) {
      setIsSending(false);
    }
    previousRenderRef.current = { disabled, isSending };
  }, [disabled, isSending]);

  // Handle file selection
  const handleFileChange = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    
    if (files.length + attachments.length > 5) {
      toast.error("You can only upload up to 5 files at once");
      return;
    }
    
    // Check each file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = files.filter(file => file.size > maxSize);
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) exceed the 10MB limit`);
      return;
    }
    
    setIsUploading(true);
    
    // Process files with additional validation
    setTimeout(() => {
      try {
        // Validate each file is a proper File object
        for (const file of files) {
          if (!(file instanceof File)) {
            console.error('Invalid file object:', file);
            toast.error(`Invalid file: ${file.name || 'Unknown file'}`);
            setIsUploading(false);
            return;
          }
        }
        
        // Create new attachments with unique IDs
        const timestamp = Date.now();
        const newAttachments = files.map((file, index) => {
          // Ensure the file has the right properties for the server
          const attachmentId = `${timestamp}-${index}-${file.name.replace(/[^a-z0-9]/gi, '_')}`;
          
          console.log(`Processing file: ${file.name} (${file.size} bytes, ${file.type})`);
          
          // Store the original File object without modification
          return {
            id: attachmentId,
            file: file, // Keep the original File object
            previewUrl: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            type: file.type
          };
        });
        
        // Update state with new attachments
        setAttachments(prev => [...prev, ...newAttachments]);
        
        // Log successful file attachment for debugging
        console.log(`Added ${newAttachments.length} file attachments:`, 
          newAttachments.map(a => `${a.name} (${a.size} bytes, ${a.type})`));
      } catch (error) {
        console.error('Error adding attachments:', error);
        toast.error('Failed to add attachment');
      } finally {
        setIsUploading(false);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }, 0);
  }, [attachments.length]);

  // Optimize attachment removal
  const removeAttachment = useCallback((id) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.previewUrl) {
        // Make sure to revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(attachment.previewUrl);
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  // Cleanup all preview URLs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      attachments.forEach(attachment => {
        if (attachment.previewUrl) {
          URL.revokeObjectURL(attachment.previewUrl);
        }
      });
    };
  }, [attachments]);

  // Send message with attachments
  const sendFormattedMessage = useCallback(async () => {
    if ((!message.trim() && attachments.length === 0) || isUploading || disabled || isSending) return;
    
    try {
      setIsSending(true);
      
      // Validate files are proper File objects and extract them
      const validFiles = attachments
        .filter(att => att.file instanceof File)
        .map(att => att.file);
      
      if (attachments.length > 0 && validFiles.length === 0) {
        console.error('No valid file attachments found');
        toast.error('Invalid attachments. Please try again.');
        return;
      }
      
      // Create a messageData object with content and attachments
      const messageData = {
        content: message.trim(),
        attachments: validFiles
      };
      
      // Log what we're sending
      console.log(`Sending message: content=${message.trim() ? 'Yes' : 'No'}, attachments=${validFiles.length}`);
      
      // Call the onSendMessage function from the parent component
      await onSendMessage(messageData);
      
      // Reset input state
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  }, [message, attachments, isUploading, disabled, isSending, onSendMessage]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendFormattedMessage();
    }
  }, [sendFormattedMessage]);

  const handleSendMessage = useCallback(() => {
    sendFormattedMessage();
  }, [sendFormattedMessage]);

  const handleAttachmentClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleEmojiClick = useCallback((emojiData) => {
    const emoji = emojiData.emoji;
    
    setMessage(prevMessage => {
      const cursorPosition = textareaRef.current?.selectionStart || prevMessage.length;
      return prevMessage.substring(0, cursorPosition) + 
             emoji + 
             prevMessage.substring(cursorPosition);
    });
    
    // Wait for state update before focusing
    setTimeout(() => {
      if (textareaRef.current) {
        const cursorPosition = textareaRef.current.selectionStart || 0;
        const newPosition = cursorPosition + emoji.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newPosition, newPosition);
      }
      setShowEmojiPicker(false);
    }, 0);
  }, []);

  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  // Memoize button disabled state
  const isButtonDisabled = useMemo(() => {
    return (!message.trim() && attachments.length === 0) || isUploading || disabled || isSending;
  }, [message, attachments.length, isUploading, disabled, isSending]);
  
  // Replace the inner definition with a stable renderAttachmentsContainer
  const renderAttachmentsContainer = useMemo(() => {
    return attachments.length > 0 ? (
      <div className="flex flex-wrap gap-2 mb-2" style={{ contain: 'content', willChange: 'auto' }}>
        {attachments.map(attachment => (
          <AttachmentPreview 
            key={attachment.id}
            attachment={attachment}
            onRemove={removeAttachment}
            isSending={isSending}
          />
        ))}
      </div>
    ) : null;
  }, [attachments, isSending, removeAttachment]);

  return (
    <div className="border-t border-gray-200 p-4 bg-white">
      {/* Attachment previews */}
      {renderAttachmentsContainer}
      
      <div className="flex items-end">
        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="image/*,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          disabled={disabled || isSending || (attachments.length >= 5)}
        />

        {/* Attachment button */}
        <button
          onClick={handleAttachmentClick}
          className="text-gray-500 hover:text-blue-500 p-2"
          disabled={disabled || isSending || (attachments.length >= 5)}
          type="button"
          aria-label="Add attachment"
        >
          <FiPaperclip size={20} />
        </button>

        {/* Emoji picker button and dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(prev => !prev)}
            className="text-gray-500 hover:text-yellow-500 p-2"
            disabled={disabled || isSending}
            type="button"
            aria-label="Add emoji"
          >
            <FiSmile size={20} />
          </button>
          {showEmojiPicker && (
            <div 
              className="absolute bottom-12 left-0 z-10" 
              ref={emojiPickerRef}
            >
              <Picker onEmojiClick={handleEmojiClick} />
            </div>
          )}
        </div>

        {/* Message input */}
        <TextareaAutosize
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled || isSending}
          className="flex-grow bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-10 max-h-32"
          maxRows={5}
        />

        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={isButtonDisabled}
          className={`ml-2 p-2 rounded-full ${
            isButtonDisabled
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          type="button"
          aria-label="Send message"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimize re-renders based on both disabled state and onSendMessage function
  return prevProps.disabled === nextProps.disabled && 
         prevProps.onSendMessage === nextProps.onSendMessage;
});

export default ChatInput; 