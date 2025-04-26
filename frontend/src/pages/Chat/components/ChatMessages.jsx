import React, { useRef, useEffect, useState, useCallback, useContext, memo, useMemo } from 'react';
import { format } from 'date-fns';
import Spinner from '../../../components/Spinner';
import MessageItem from './MessageItem';
import { UserContext } from '../../../context/userContext';

// Use memo to prevent unnecessary re-renders
const ChatMessages = memo(({ 
  messages, 
  messagesLoading, 
  messagesEndRef = null,
  messagesContainerRef = null,
  user: propUser, // Accept user as prop to avoid potential context issues
  isNewMessage,
  sendingMessage
}) => {
  const { user: contextUser } = useContext(UserContext);
  const user = propUser || contextUser; // Use provided user or fallback to context
  
  const [isAtBottom, setIsAtBottom] = useState(true);
  const localEndRef = useRef(null);
  const localContainerRef = useRef(null);
  const prevMessagesRef = useRef([]); // Track previous messages to avoid unnecessary rerenders
  const scrollTimeoutRef = useRef(null); // Ref to store the scroll timeout
  
  // Use provided refs or fallback to local refs
  const endRef = messagesEndRef || localEndRef;
  const containerRef = messagesContainerRef || localContainerRef;
  
  // Optimized scroll to bottom function with safety checks
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    // Clear any existing scroll timeout to prevent multiple attempts
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    
    // Schedule the scroll with a short delay to ensure DOM is ready
    scrollTimeoutRef.current = setTimeout(() => {
      // Ensure the reference exists before attempting to scroll
      if (endRef?.current) {
        try {
          // Use requestAnimationFrame for smoother scrolling
          requestAnimationFrame(() => {
            // Double-check the ref is still valid when the frame fires
            if (endRef.current) {
              endRef.current.scrollIntoView({ 
                behavior, 
                block: 'end',
                inline: 'nearest'
              });
            }
          });
        } catch (error) {
          console.error('Error scrolling to bottom:', error);
        }
      } else if (containerRef?.current) {
        // Fallback: if endRef isn't available, try scrolling the container
        try {
          containerRef.current.scrollTop = containerRef.current.scrollHeight;
        } catch (error) {
          console.error('Error scrolling container to bottom:', error);
        }
      }
    }, 50); // Short delay to ensure DOM is ready
  }, [endRef, containerRef]);
  
  // Optimized function to check if user is at bottom
  const checkIfAtBottom = useCallback(() => {
    if (!containerRef?.current) return true;
    
    try {
      const container = containerRef.current;
      const threshold = 150; // pixels from bottom
      const atBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      
      // Only update state if value changed to avoid re-renders
      if (atBottom !== isAtBottom) {
        setIsAtBottom(atBottom);
      }
      
      return atBottom;
    } catch (error) {
      console.error('Error checking scroll position:', error);
      return true; // Assume at bottom in case of error
    }
  }, [containerRef, isAtBottom]);
  
  // Handle scroll events with debounce
  const handleScroll = useCallback(() => {
    // Use a more reliable approach to debounce
    if (window.scrollDebounceTimeout) {
      clearTimeout(window.scrollDebounceTimeout);
    }
    
    window.scrollDebounceTimeout = setTimeout(() => {
      checkIfAtBottom();
      window.scrollDebounceTimeout = null;
    }, 100);
  }, [checkIfAtBottom]);
  
  // Scroll to bottom on initial render and when messages change
  useEffect(() => {
    // Skip if no messages or loading
    if (messagesLoading || !messages || messages.length === 0) {
      return;
    }
    
    // Keep track of intended scrolling
    let shouldScroll = false;
    
    // Determine if we should scroll based on various conditions:
    // 1. We're at the bottom already 
    // 2. OR there's a new message flag set
    // 3. OR we're currently sending a message
    if (isAtBottom || isNewMessage || sendingMessage) {
      shouldScroll = true;
    }
    
    // Skip scrolling if conditions aren't met
    if (!shouldScroll) {
      return;
    }
    
    // Defer scrolling slightly to ensure render is complete
    const timeoutId = setTimeout(() => {
      scrollToBottom(isNewMessage ? 'smooth' : 'auto');
    }, 50);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [messages, messagesLoading, isAtBottom, isNewMessage, sendingMessage, scrollToBottom]);
  
  // Add scroll event listener
  useEffect(() => {
    const container = containerRef?.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      
      // Initial check
      checkIfAtBottom();
      
      return () => {
        container.removeEventListener('scroll', handleScroll);
        
        // Clear any pending debounce
        if (window.scrollDebounceTimeout) {
          clearTimeout(window.scrollDebounceTimeout);
          window.scrollDebounceTimeout = null;
        }
      };
    }
  }, [containerRef, handleScroll, checkIfAtBottom]);

  // Clean up any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    };
  }, []);

  // Pre-compute message list with useMemo to avoid re-creating on render
  const messageItems = useMemo(() => {
    if (!messages || messages.length === 0) return [];
    
    // Efficient reference comparison
    const prevMessages = prevMessagesRef.current;
    
    // If messages array reference is the same, reuse previous message items
    if (messages === prevMessages && prevMessages.length > 0) {
      return prevMessages.map((message) => (
        <MessageItem 
          key={message._id || `temp-${message.tempId || Date.now()}`} 
          message={message} 
        />
      ));
    }
    
    // Generate stable keys for messages to prevent re-renders
    const result = messages.map((message) => {
      // Use existing _id or create a stable temporary ID
      const key = message._id || 
        (message.tempId ? `temp-${message.tempId}` : `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
      
      // Store tempId if we created one
      if (!message._id && !message.tempId) {
        message.tempId = key.replace('temp-', '');
      }
      
      return (
        <MessageItem 
          key={key} 
          message={message}
          className="chat-message" // Add optimized CSS class
        />
      );
    });
    
    // Store current messages for future comparison
    prevMessagesRef.current = messages;
    
    return result;
  }, [messages]);

  // If loading and no messages yet, show a spinner
  if (messagesLoading && messages.length === 0) {
    return (
      <div ref={containerRef} className="flex-grow overflow-y-auto p-4 space-y-4 chat-transition contain-paint">
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <div className="spinner mb-2"></div>
            <p className="text-gray-500">Loading messages...</p>
          </div>
        </div>
        {/* Always include the end ref to avoid null issues */}
        <div ref={endRef} style={{ height: 1, width: '100%' }} />
      </div>
    );
  }

  // If no messages, show a message
  if (messages.length === 0) {
    return (
      <div ref={containerRef} className="flex-grow overflow-y-auto p-4 space-y-4 chat-transition contain-paint">
        <div className="flex flex-col justify-center items-center h-full">
          <p className="text-gray-500">No messages yet</p>
          <p className="text-sm text-gray-400">Start the conversation by sending a message</p>
        </div>
        {/* Always include the end ref to avoid null issues */}
        <div ref={endRef} style={{ height: 1, width: '100%' }} />
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex-grow overflow-y-auto p-4 space-y-4 chat-transition contain-paint"
      style={{ 
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden'
      }}
    >
      {messageItems}
      
      {/* Add a loading indicator when sending */}
      {sendingMessage && (
        <div className="flex justify-center py-2">
          <div className="spinner" style={{ width: '1rem', height: '1rem' }}></div>
        </div>
      )}
      
      {/* Invisible element for scrolling to bottom - always render this */}
      <div ref={endRef} style={{ height: 1, width: '100%' }} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Enhanced custom comparison for memo to prevent unnecessary renders
  
  // Check loading state
  if (prevProps.messagesLoading !== nextProps.messagesLoading) return false;
  if (prevProps.isNewMessage !== nextProps.isNewMessage) return false;
  if (prevProps.sendingMessage !== nextProps.sendingMessage) return false;
  
  // Compare message arrays
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  
  // If arrays are same length and not empty, check the last message
  if (prevProps.messages.length > 0) {
    const lastPrevMessage = prevProps.messages[prevProps.messages.length - 1];
    const lastNextMessage = nextProps.messages[nextProps.messages.length - 1];
    
    // If last message IDs don't match, render should update
    if (lastPrevMessage._id !== lastNextMessage._id) return false;
    
    // Check if content of last message changed (like if message was edited)
    if (lastPrevMessage.content !== lastNextMessage.content) return false;
  }
  
  // Otherwise don't re-render
  return true;
});

export default ChatMessages; 