import React, { useState, useRef, useEffect, memo, useCallback, useMemo } from 'react';
import { FiSend, FiPaperclip, FiX, FiSmile } from 'react-icons/fi';
import { FaRobot, FaUser } from 'react-icons/fa';
import TextareaAutosize from 'react-textarea-autosize';
import Picker from 'emoji-picker-react';
import { toast } from 'react-hot-toast';
import { useChat } from '../../../context/ChatContext';

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
const ChatInput = memo(({ onSendMessage, disabled, chatId }) => {
  const { simulateMessage } = useChat();
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSimulateButtons, setShowSimulateButtons] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const textareaRef = useRef(null);
  const simulateButtonsRef = useRef(null);
  const previousRenderRef = useRef({ disabled, isSending });
  
  // Close emoji picker when clicking outside - use useCallback
  const handleClickOutside = useCallback((event) => {
    if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
      setShowEmojiPicker(false);
    }
    if (simulateButtonsRef.current && !simulateButtonsRef.current.contains(event.target)) {
      setShowSimulateButtons(false);
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
        setIsSending(false);
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
      
      // Reset input state only on success
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // More specific error messages based on the error type
      if (error.response && error.response.status === 400) {
        if (error.response.data && error.response.data.message) {
          toast.error(`Failed to send: ${error.response.data.message}`);
        } else {
          toast.error('Invalid message format. Please check your input.');
        }
      } else if (error.response && error.response.status === 413) {
        toast.error('File size too large. Maximum total size is 15MB.');
      } else {
        toast.error('Failed to send message. Please try again.');
      }
    } finally {
      setIsSending(false);
    }
  }, [message, attachments, isUploading, disabled, isSending, onSendMessage]);

  // Handle simulating messages
  const handleSimulateMessage = useCallback(async (type) => {
    if (!message.trim() || !chatId) return;
    
    try {
      setIsSending(true);
      
      // Simulate message based on type
      await simulateMessage(chatId, message.trim(), type);
      
      // Reset input state
      setMessage('');
      setShowSimulateButtons(false);
    } catch (error) {
      console.error('Error simulating message:', error);
      toast.error('Failed to simulate message');
    } finally {
      setIsSending(false);
    }
  }, [message, chatId, simulateMessage]);

  // Handle submitting the form
  const handleFormSubmit = useCallback((e) => {
    e.preventDefault();
    sendFormattedMessage();
  }, [sendFormattedMessage]);

  // Handle message change
  const handleMessageChange = useCallback((e) => {
    setMessage(e.target.value);
  }, []);

  // Handle emoji selection
  const handleEmojiSelect = useCallback((emojiData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    
    // Focus the textarea after adding an emoji
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // File input trigger
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  // Toggle emoji picker
  const toggleEmojiPicker = useCallback(() => {
    setShowEmojiPicker(prev => !prev);
  }, []);

  // Toggle simulate buttons
  const toggleSimulateButtons = useCallback(() => {
    setShowSimulateButtons(prev => !prev);
  }, []);

  // Key press handler
  const handleKeyPress = useCallback((e) => {
    // Send message on Enter (but not with Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendFormattedMessage();
    }
  }, [sendFormattedMessage]);
  
  return (
    <div className="border-t border-gray-200 bg-white pt-2 pb-3 px-4">
      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map(attachment => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              onRemove={removeAttachment}
              isSending={isSending}
            />
          ))}
        </div>
      )}
      
      {/* Message input form */}
      <form onSubmit={handleFormSubmit} className="relative">
        <div className="flex items-end border rounded-lg overflow-hidden relative">
          {/* Textarea for message */}
          <TextareaAutosize
            ref={textareaRef}
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-grow py-2 px-3 focus:outline-none resize-none max-h-32"
            disabled={disabled || isSending}
            maxRows={6}
          />
          
          {/* Input actions */}
          <div className="flex items-center space-x-1 px-2">
            {/* Emoji picker button */}
            <button
              type="button"
              onClick={toggleEmojiPicker}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full"
              disabled={disabled || isSending}
              aria-label="Add emoji"
            >
              <FiSmile size={20} />
            </button>
            
            {/* File attachment button */}
            <button
              type="button"
              onClick={triggerFileInput}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full"
              disabled={disabled || isSending || attachments.length >= 5}
              aria-label="Attach file"
            >
              <FiPaperclip size={20} />
            </button>
            
            {/* Simulate message button */}
            <button
              type="button"
              onClick={toggleSimulateButtons}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full"
              disabled={disabled || isSending}
              aria-label="Simulate messages"
            >
              <FaRobot size={20} className={showSimulateButtons ? "text-purple-500" : ""} />
            </button>
            
            {/* Send button */}
            <button
              type="submit"
              className={`p-2 rounded-full ${
                (!message.trim() && attachments.length === 0) || disabled || isSending
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-500 hover:text-blue-700'
              }`}
              disabled={(!message.trim() && attachments.length === 0) || disabled || isSending}
              aria-label="Send message"
            >
              <FiSend size={20} />
            </button>
          </div>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip"
            disabled={disabled || isSending || attachments.length >= 5}
          />
          
          {/* Emoji picker popup */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute right-12 bottom-14 z-10"
            >
              <Picker onEmojiClick={handleEmojiSelect} />
            </div>
          )}
          
          {/* Simulate buttons popup */}
          {showSimulateButtons && (
            <div 
              ref={simulateButtonsRef}
              className="absolute right-14 bottom-14 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10"
            >
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSimulateMessage('ai')}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-purple-100 text-purple-700"
                  disabled={!message.trim() || disabled || isSending}
                >
                  <FaRobot size={16} />
                  <span>Simulate AI Message</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateMessage('user')}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-blue-100 text-blue-700"
                  disabled={!message.trim() || disabled || isSending}
                >
                  <FaUser size={16} />
                  <span>Simulate Other User</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}, (prevProps, nextProps) => {
  // Optimize re-renders by comparing only the props we care about
  return (
    prevProps.disabled === nextProps.disabled &&
    prevProps.onSendMessage === nextProps.onSendMessage
  );
});

export default ChatInput; 