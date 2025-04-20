import React, { useState, useRef } from 'react';
import { FiSend, FiPaperclip, FiX, FiSmile } from 'react-icons/fi';
import TextareaAutosize from 'react-textarea-autosize';
import Picker from 'emoji-picker-react';
import { toast } from 'react-hot-toast';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const textareaRef = useRef(null);

  // Close emoji picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if ((!message.trim() && attachments.length === 0) || isUploading || disabled) return;
    
    try {
      // Create a messageData object with content and attachments
      const messageData = {
        content: message.trim(),
        attachments: attachments.map(att => att.file)
      };
      
      // Call the onSendMessage function from the parent component
      onSendMessage(messageData);
      
      // Reset input state
      setMessage('');
      setAttachments([]);
    } catch (error) {
      console.error('Error sending message with attachments:', error);
      toast.error('Failed to send message with attachments');
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
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
      // Convert to the format expected by the API
      const newAttachments = files.map(file => ({
        file,
        previewUrl: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type
      }));
      
      setAttachments(prevAttachments => [...prevAttachments, ...newAttachments]);
      
      // Log for debugging
      console.log('Attachments added:', newAttachments);
    } catch (error) {
      console.error('Error adding attachments:', error);
      toast.error('Failed to add attachment');
    } finally {
      setIsUploading(false);
      
      // Reset the file input value
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeAttachment = (index) => {
    const newAttachments = [...attachments];
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newAttachments[index].previewUrl);
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };

  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = textareaRef.current?.selectionStart || message.length;
    const newMessage = 
      message.substring(0, cursorPosition) + 
      emoji + 
      message.substring(cursorPosition);
    
    setMessage(newMessage);
    setShowEmojiPicker(false);
    
    // Focus back on textarea with cursor after the inserted emoji
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPosition = cursorPosition + emoji.length;
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }
    }, 10);
  };

  return (
    <div className="border-t p-3">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((attachment, index) => (
            <div 
              key={index} 
              className="relative bg-gray-100 rounded p-2 flex items-center gap-2"
            >
              {attachment.type.startsWith('image/') && (
                <div className="w-6 h-6 mr-1">
                  <img 
                    src={attachment.previewUrl} 
                    alt={attachment.name}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <span className="text-xs truncate max-w-[150px]">
                {attachment.name}
              </span>
              <button
                onClick={() => removeAttachment(index)}
                className="text-gray-600 hover:text-red-500"
              >
                <FiX size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <button
          onClick={handleAttachmentClick}
          disabled={disabled || attachments.length >= 5}
          className="text-gray-500 hover:text-blue-500 disabled:opacity-50 p-2"
          title="Attach file"
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
        />
        
        {/* Emoji button */}
        <div className="relative">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-blue-500 p-2"
            title="Add emoji"
          >
            <FiSmile size={20} />
          </button>
          
          {/* Emoji picker */}
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-12 left-0 z-10"
            >
              <Picker 
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
              />
            </div>
          )}
        </div>
        
        {/* Message input */}
        <TextareaAutosize
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="message-input flex-grow p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 max-h-[150px]"
          minRows={1}
          maxRows={6}
        />
        
        {/* Send button */}
        <button
          onClick={handleSendMessage}
          disabled={(!message.trim() && attachments.length === 0) || isUploading || disabled}
          className={`p-2 rounded-full ${
            (!message.trim() && attachments.length === 0) || isUploading || disabled
              ? 'text-gray-400 bg-gray-100'
              : 'text-white bg-blue-500 hover:bg-blue-600'
          }`}
          title="Send message"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput; 