import { useEffect, useRef, useState } from "react";
import { useChat } from "../../context/ChatContext";
import { useAuth } from "../../context/userContext";
import {
  FaRobot,
  FaReply,
  FaPaperclip,
  FaTrash,
  FaChevronDown,
} from "react-icons/fa";
import { format } from "date-fns";

const ChatMessages = () => {
  const {
    activeChat,
    messages,
    loading,
    fetchMessages,
    hasMoreMessages,
    messagePage,
  } = useChat();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Scroll to bottom for new messages only if user is at bottom
  useEffect(() => {
    if (isAtBottom && messages.length > 0 && !loading.messages) {
      scrollToBottom();
    }
  }, [messages, isAtBottom, loading.messages]);

  // Auto scroll to bottom when chat changes
  useEffect(() => {
    if (activeChat) {
      setIsAtBottom(true);
      setTimeout(scrollToBottom, 100);
    }
  }, [activeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // Check if user is at the bottom (within 50px)
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(atBottom);

    // Load more messages when scrolling to top
    if (
      scrollTop < 100 &&
      hasMoreMessages &&
      !loadingMore &&
      !loading.messages
    ) {
      handleLoadMore();
    }
  };

  const handleLoadMore = async () => {
    if (!activeChat || loadingMore || !hasMoreMessages) return;

    setLoadingMore(true);
    const container = containerRef.current;

    // Save current scroll position
    const oldScrollHeight = container?.scrollHeight || 0;
    const oldScrollTop = container?.scrollTop || 0;

    try {
      await fetchMessages(activeChat._id, messagePage + 1);

      // Restore scroll position after new messages load
      setTimeout(() => {
        if (container) {
          const newScrollHeight = container.scrollHeight;
          const heightDiff = newScrollHeight - oldScrollHeight;
          container.scrollTop = oldScrollTop + heightDiff;
        }
      }, 100);
    } catch (error) {
      console.error("Error loading more messages:", error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Format message timestamp
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "h:mm a");
  };

  // Check if message belongs to current user
  const isOwnMessage = (message) => {
    return message.sender?._id === user?._id;
  };

  // Render attachment
  const renderAttachment = (attachment) => {
    const { mimetype, path, filename } = attachment;

    if (mimetype.startsWith("image/")) {
      return (
        <a
          href={`http://localhost:8000/${path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block mt-1 max-w-xs"
        >
          <img
            src={`http://localhost:8000/${path}`}
            alt={filename}
            className="rounded border border-gray-200 max-h-40 object-contain"
          />
        </a>
      );
    } else {
      return (
        <a
          href={`http://localhost:8000/${path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center mt-1 p-2 bg-gray-100 rounded"
        >
          <FaPaperclip className="mr-2 text-blue-500" />
          <span className="text-sm text-blue-500">{filename}</span>
        </a>
      );
    }
  };

  // Get message style based on type
  const getMessageStyle = (message) => {
    const own = isOwnMessage(message);
    const isAI = message.isAIMessage;

    let baseClasses = "mb-4 rounded-lg p-3 max-w-md overflow-hidden";

    if (isAI) {
      return `${baseClasses} bg-purple-50 border border-purple-100 text-gray-800`;
    } else if (own) {
      return `${baseClasses} bg-blue-500 text-white ml-auto`;
    } else {
      return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="relative h-full">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full p-4 overflow-y-auto"
        style={{
          scrollBehavior: "smooth",
        }}
      >
        {/* Loading more messages indicator */}
        {loadingMore && (
          <div className="flex justify-center p-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* No messages */}
        {!loading.messages && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p>No messages yet</p>
            <p className="text-sm mt-1">
              Send a message to start the conversation
            </p>
          </div>
        )}

        {/* Messages list */}
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              isOwnMessage(message) ? "justify-end" : "justify-start"
            }`}
          >
            <div className={getMessageStyle(message)}>
              {/* Message header with sender info */}
              {!isOwnMessage(message) && !message.isAIMessage && (
                <div className="flex items-center mb-1">
                  <span className="font-medium text-sm">
                    {message.sender?.name}
                  </span>
                </div>
              )}

              {/* AI Message indicator */}
              {message.isAIMessage && (
                <div className="flex items-center mb-1">
                  <FaRobot className="text-purple-500 mr-1" />
                  <span className="font-medium text-sm">AI Assistant</span>
                </div>
              )}

              {/* Reply indicator */}
              {message.replyTo && (
                <div className="flex items-center text-xs bg-gray-200 dark:bg-gray-700 rounded p-1 mb-1">
                  <FaReply className="mr-1" />
                  <span className="truncate">
                    {message.replyTo.isDeleted
                      ? "This message was deleted"
                      : `${message.replyTo.sender?.name || "User"}: ${
                          message.replyTo.content
                        }`}
                  </span>
                </div>
              )}

              {/* Message content */}
              <div className="whitespace-pre-wrap break-words">
                {message.isDeleted ? (
                  <span className="italic text-gray-500">
                    This message was deleted
                  </span>
                ) : (
                  message.content
                )}
              </div>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-1">
                  {message.attachments.map((attachment, index) => (
                    <div key={index}>{renderAttachment(attachment)}</div>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-xs mt-1 ${
                  isOwnMessage(message) ? "text-blue-200" : "text-gray-500"
                }`}
              >
                {formatMessageTime(message.createdAt)}
                {message.isTemp && " · Sending..."}
              </div>
            </div>
          </div>
        ))}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />

        {/* Loading indicator */}
        {loading.messages && !loadingMore && (
          <div className="flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {!isAtBottom && messages.length > 0 && (
        <div className="absolute bottom-4 right-4 z-10">
          <button
            onClick={scrollToBottom}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200"
            aria-label="Scroll to bottom"
          >
            <FaChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;
