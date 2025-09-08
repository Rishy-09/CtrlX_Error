import { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { FaPaperPlane, FaPaperclip, FaTimes } from 'react-icons/fa';

const ChatInput = () => {
  const { activeChat, sendMessage, loading } = useChat();
  const [messageText, setMessageText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const fileInputRef = useRef(null);

  // Handle message submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!messageText.trim() && attachments.length === 0) return;
    
    try {
      const messageData = {
        content: messageText.trim(),
        attachments,
        replyTo: replyTo?._id
      };
      
      await sendMessage(activeChat._id, messageData);
      
      // Reset form
      setMessageText('');
      setAttachments([]);
      setReplyTo(null);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 0) {
      // Create object URLs for preview
      const newAttachments = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
        type: file.type
      }));
      
      setAttachments([...attachments, ...newAttachments]);
    }
    
    // Reset file input
    e.target.value = null;
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Trigger file dialog
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle message input keydown
  const handleKeyDown = (e) => {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Preview attachments
  const renderAttachmentPreviews = () => {
    return attachments.map((attachment, index) => {
      const isImage = attachment.type.startsWith('image/');
      
      return (
        <div key={index} className="relative inline-block mr-2 mb-2">
          <div className="border rounded p-1 bg-gray-50">
            {isImage ? (
              <img 
                src={attachment.preview} 
                alt={attachment.name} 
                className="h-16 w-16 object-cover"
              />
            ) : (
              <div className="h-16 w-16 flex items-center justify-center bg-gray-100">
                <span className="text-xs text-center text-gray-600 p-1 truncate">
                  {attachment.name}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => removeAttachment(index)}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
            aria-label="Remove attachment"
          >
            <FaTimes size={10} />
          </button>
        </div>
      );
    });
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      {/* Attachments preview */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap">
          {renderAttachmentPreviews()}
        </div>
      )}
      
      {/* Reply indicator */}
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-100 rounded-lg flex items-center">
          <div className="flex-1 text-sm truncate">
            <span className="font-medium">{replyTo.sender?.name}:</span> {replyTo.content}
          </div>
          <button
            type="button"
            onClick={() => setReplyTo(null)}
            className="ml-2 text-gray-500 hover:text-gray-700"
            aria-label="Cancel reply"
          >
            <FaTimes size={16} />
          </button>
        </div>
      )}
      
      <div className="flex items-center bg-white rounded-lg border border-gray-300 overflow-hidden">
        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          multiple
        />
        
        {/* Attach button */}
        <button
          type="button"
          onClick={triggerFileInput}
          className="p-3 text-gray-500 hover:text-gray-700"
          disabled={loading.sendMessage}
          aria-label="Attach files"
        >
          <FaPaperclip />
        </button>
        
        {/* Message input */}
        <textarea
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows="1"
          className="flex-1 p-3 focus:outline-none resize-none"
          disabled={loading.sendMessage}
        />
        
        {/* Send button */}
        <button
          type="submit"
          className={`p-3 ${
            messageText.trim() || attachments.length > 0
              ? 'text-blue-500 hover:text-blue-700'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          disabled={
            loading.sendMessage || (!messageText.trim() && attachments.length === 0)
          }
          aria-label="Send message"
        >
          {loading.sendMessage ? (
            <div className="w-5 h-5 border-t-2 border-blue-500 rounded-full animate-spin" />
          ) : (
            <FaPaperPlane />
          )}
        </button>
      </div>
    </form>
  );
};

export default ChatInput; 