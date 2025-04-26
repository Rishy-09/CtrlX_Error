import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { FiSend, FiPaperclip, FiX, FiSmile } from 'react-icons/fi';
import TextareaAutosize from 'react-textarea-autosize';
import Picker from 'emoji-picker-react';
import { toast } from 'react-hot-toast';

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

  // Declare sendFormattedMessage outside both callbacks to break the dependency cycle
  const sendFormattedMessage = useCallback(async () => {
    // Don't proceed if there's no content AND no attachments, or if already sending/uploading
    if ((!message.trim() && attachments.length === 0) || isUploading || disabled || isSending) return;
    
    try {
      setIsSending(true);
      
      // Create the FormData directly here instead of passing objects
      const formData = new FormData();
      
      // Add message content if it exists
      if (message.trim()) {
        formData.append('content', message.trim());
      } else {
        // For empty messages with attachments, add a space to satisfy backend validation
        formData.append('content', ' ');
      }
      
      // Add each attachment directly to FormData
      if (attachments.length > 0) {
        attachments.forEach(att => {
          if (att.file && att.file instanceof File) {
            console.log(`Attaching file: ${att.file.name} (${att.file.size} bytes)`);
            formData.append('attachments', att.file);
          } else {
            console.error('Invalid attachment file:', att);
            throw new Error('Invalid attachment file');
          }
        });
      } else if (!message.trim()) {
        // If we somehow got here with neither content nor attachments, prevent the API call
        toast.error('Message cannot be empty');
        setIsSending(false);
        return;
      }
      
      console.log('Sending message with content:', message.trim() || '[empty]');
      console.log('Sending message with attachments:', attachments.length);
      
      // Call the onSendMessage function from the parent component with FormData
      await onSendMessage(formData);
      
      // Reset input state
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message with attachments:', error);
      toast.error('Failed to send message with attachments');
    } finally {
      // Use requestAnimationFrame instead of setTimeout for better timing
      requestAnimationFrame(() => {
        setIsSending(false);
      });
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
    
    try {
      // Convert to the format expected by the API - stable object references
      const timestamp = Date.now();
      const newAttachments = files.map((file, index) => {
        // Use both timestamp, index and filename for truly unique keys
        const uniqueId = `${timestamp}-${index}-${file.name.replace(/[^a-z0-9]/gi, '_')}`;
        
        // Ensure the file object is valid
        if (!(file instanceof File)) {
          console.error('Invalid file object:', file);
          throw new Error('Invalid file object');
        }
        
        console.log('Adding file attachment:', file.name, file.size, file.type);
        
        return {
          id: uniqueId,
          file: file, // Ensure this is a File object
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          size: file.size,
          type: file.type
        };
      });
      
      setAttachments(prevAttachments => [...prevAttachments, ...newAttachments]);
    } catch (error) {
      console.error('Error adding attachments:', error);
      toast.error('Failed to add attachment');
    } finally {
      // Use requestAnimationFrame for smoother UI updates
      requestAnimationFrame(() => {
        setIsUploading(false);
        
        // Reset the file input value
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
    }
  }, [attachments.length]);

  const removeAttachment = useCallback((id) => {
    setAttachments(prevAttachments => {
      const attachmentIndex = prevAttachments.findIndex(att => att.id === id);
      if (attachmentIndex === -1) return prevAttachments;
      
      const newAttachments = [...prevAttachments];
      // Revoke the object URL to prevent memory leaks
      URL.revokeObjectURL(newAttachments[attachmentIndex].previewUrl);
      newAttachments.splice(attachmentIndex, 1);
      return newAttachments;
    });
  }, []);

  const handleEmojiClick = useCallback((emojiData) => {
    const emoji = emojiData.emoji;
    
    setMessage(prevMessage => {
      const cursorPosition = textareaRef.current?.selectionStart || prevMessage.length;
      const newMessage = 
        prevMessage.substring(0, cursorPosition) + 
        emoji + 
        prevMessage.substring(cursorPosition);
      
      // Focus back on textarea with cursor after the inserted emoji - use RAF
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          const newCursorPosition = cursorPosition + emoji.length;
          textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      });
      
      return newMessage;
    });
    
    setShowEmojiPicker(false);
  }, []);

  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  const isButtonDisabled = (!message.trim() && attachments.length === 0) || isUploading || disabled || isSending;
  
  // Memoize the attachment components to prevent re-renders
  const attachmentPreviews = useMemo(() => {
    return attachments.map(attachment => (
      <div 
        key={attachment.id}
        className="relative bg-gray-100 rounded p-2 flex items-center gap-2"
        style={{ 
          contain: 'content', // Add CSS containment for better rendering performance
          willChange: 'contents', // Hint to browser about what will change
          transform: 'translateZ(0)' // Force GPU acceleration
        }}
      >
        {attachment.type.startsWith('image/') && (
          <div className="w-6 h-6 mr-1">
            <img 
              src={attachment.previewUrl} 
              alt={attachment.name}
              className="w-full h-full object-cover rounded"
              loading="lazy" // Improve performance with lazy loading
            />
          </div>
        )}
        <span className="text-xs truncate max-w-[150px]">
          {attachment.name}
        </span>
        <button
          onClick={() => removeAttachment(attachment.id)}
          className="text-gray-600 hover:text-red-500"
          disabled={isSending}
          type="button"
          aria-label={`Remove ${attachment.name}`}
        >
          <FiX size={16} />
        </button>
      </div>
    ));
  }, [attachments, isSending, removeAttachment]);

  // Memoize the entire attachments container to prevent flickering
  const attachmentsContainer = useMemo(() => {
    if (attachments.length === 0) return null;
    
    return (
      <div 
        className="flex flex-wrap gap-2 mb-2"
        style={{ 
          transform: 'translateZ(0)', // Force GPU acceleration
          willChange: 'contents', // Hint to browser about what will change
          contain: 'content' // Add CSS containment
        }}
      >
        {attachmentPreviews}
      </div>
    );
  }, [attachments.length, attachmentPreviews]);

  // Memoize the input area to prevent re-renders
  const messageInput = useMemo(() => (
    <TextareaAutosize
      ref={textareaRef}
      value={message}
      onChange={handleMessageChange}
      onKeyDown={handleKeyDown}
      placeholder="Type a message..."
      disabled={disabled || isSending}
      className="message-input flex-grow p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 max-h-[150px]"
      minRows={1}
      maxRows={6}
      style={{ 
        transform: 'translateZ(0)', // Force GPU acceleration for smoother rendering
        willChange: 'contents', // Hint to browser about what will change
        contain: 'content' // Add CSS containment to reduce repaints
      }}
    />
  ), [message, handleMessageChange, handleKeyDown, disabled, isSending]);

  return (
    <div 
      className="border-t p-3 mt-auto sticky bottom-0 bg-white"
      style={{ 
        contain: 'layout', // Improve rendering performance
        willChange: 'contents', // Hint to browser about what will change
        transform: 'translateZ(0)', // Force GPU acceleration
        zIndex: 10 // Ensure input stays on top
      }}
    >
      {/* Attachments preview - only rendered when needed */}
      {attachmentsContainer}
      
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button
          onClick={handleAttachmentClick}
          disabled={disabled || attachments.length >= 5 || isSending}
          className="text-gray-500 hover:text-blue-500 disabled:opacity-50 p-2"
          title="Attach file"
          type="button"
        >
          <FiPaperclip size={20} />
        </button>
        
        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          multiple
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          disabled={isSending}
        />
        
        {/* Emoji button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-blue-500 p-2"
            title="Add emoji"
            disabled={isSending}
            type="button"
          >
            <FiSmile size={20} />
          </button>
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-12 left-0 z-20"
              style={{ 
                transform: 'translateZ(0)', // Force GPU acceleration
                willChange: 'transform' // Hint to browser about what will change
              }}
            >
              <Picker 
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
              />
            </div>
          )}
        </div>
        
        {/* Message input - rendered from memoized component */}
        {messageInput}
        
        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={isButtonDisabled}
          className={`p-2 rounded-full ${
            isButtonDisabled
              ? 'text-gray-400 bg-gray-100'
              : 'text-white bg-blue-500 hover:bg-blue-600'
          }`}
          title="Send message"
          type="button"
        >
          {isSending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <FiSend size={20} />
          )}
        </button>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo - extended to ensure stability
  // Only re-render if disabled state changes or onSendMessage reference changes
  return (
    prevProps.disabled === nextProps.disabled && 
    prevProps.onSendMessage === nextProps.onSendMessage &&
    Object.is(prevProps, nextProps)
  );
});

export default ChatInput; 