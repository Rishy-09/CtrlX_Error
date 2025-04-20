import React, { useState, useRef } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import { BsEmojiSmile, BsPaperclip } from 'react-icons/bs';
import EmojiPicker from 'emoji-picker-react';

const ChatInput = ({ onSendMessage, disabled }) => {
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!messageText.trim() && attachments.length === 0) return;
    
    onSendMessage({
      content: messageText,
      attachments
    });
    
    // Clear form
    setMessageText('');
    setAttachments([]);
    setShowEmojiPicker(false);
  };
  
  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };
  
  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };
  
  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };
  
  // Add emoji to message
  const handleEmojiClick = (emojiData) => {
    setMessageText(prev => prev + emojiData.emoji);
  };
  
  // Toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
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
  
  // Attachment previews
  const renderAttachmentPreviews = () => {
    if (attachments.length === 0) return null;
    
    return (
      <div className="px-4 py-2 border-t border-gray-200">
        <div className="flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div 
              key={index} 
              className="relative bg-gray-100 rounded p-2 text-xs flex items-center"
            >
              <span className="truncate max-w-[100px]">{file.name}</span>
              <button 
                className="ml-1 text-red-500 font-bold"
                onClick={() => removeAttachment(index)}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4 bg-white">
      {renderAttachmentPreviews()}
      
      <div className="flex items-center relative">
        <button 
          type="button" 
          className="p-2 rounded-full text-gray-500 hover:text-gray-700"
          onClick={toggleEmojiPicker}
        >
          <BsEmojiSmile size={20} />
        </button>
        
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="absolute bottom-14 left-0 z-10"
          >
            <EmojiPicker onEmojiClick={handleEmojiClick} />
          </div>
        )}
        
        <button 
          type="button" 
          className="p-2 rounded-full text-gray-500 hover:text-gray-700"
          onClick={openFilePicker}
        >
          <BsPaperclip size={20} />
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            multiple
          />
        </button>
        
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 mx-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your message..."
          disabled={disabled}
        />
        
        <button 
          type="submit" 
          className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled || (!messageText.trim() && attachments.length === 0)}
        >
          <IoSendSharp size={20} />
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 