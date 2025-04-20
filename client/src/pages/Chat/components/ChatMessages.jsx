import React, { useEffect, useRef, useContext } from 'react';
import MessageItem from './MessageItem';
import { UserContext } from '../../../context/userContext';

const ChatMessages = ({ 
  messages, 
  loading, 
  hasMessages, 
  isNewMessage 
}) => {
  const { user } = useContext(UserContext);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  
  // Scroll to bottom helper function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Check if user was already at bottom before new message
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    
    const container = messagesContainerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    // Within 100px of bottom is considered "at bottom"
    return scrollHeight - scrollTop - clientHeight < 100;
  };
  
  // Scroll to bottom on mount and when messages change
  useEffect(() => {
    // If loading, don't scroll
    if (loading) return;
    
    // If no messages, don't scroll
    if (!hasMessages) return;
    
    // If new message and user was at bottom, scroll to bottom
    // Or if this is the first render, scroll to bottom
    const wasAtBottom = isAtBottom();
    if (isNewMessage && wasAtBottom) {
      scrollToBottom();
    }
  }, [messages, loading, hasMessages, isNewMessage]);
  
  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="loader"></div>
      </div>
    );
  }
  
  if (!hasMessages) {
    return (
      <div className="flex-grow flex items-center justify-center text-gray-500">
        <p>No messages yet. Send a message to start the conversation!</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={messagesContainerRef}
      className="flex-grow overflow-y-auto px-4 py-2"
      style={{ scrollBehavior: 'smooth' }}
    >
      {messages.map((message) => (
        <MessageItem
          key={message._id}
          message={message}
          isCurrentUser={message.sender._id === user?._id}
          isAI={message.sender.isAI}
        />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages; 