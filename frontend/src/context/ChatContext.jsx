import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./userContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState({
    chats: false,
    messages: false,
    sendMessage: false,
    createChat: false,
  });
  const [error, setError] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [messagePage, setMessagePage] = useState(1);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  // Fetch all chats for the current user
  const fetchChats = useCallback(async () => {
    if (!token) return;

    setLoading((prev) => ({ ...prev, chats: true }));
    setError(null);

    try {
      const response = await api.get("/chats");
      setChats(response.data);
    } catch (err) {
      console.error("Error fetching chats:", err);
      setError(err.response?.data?.message || "Failed to fetch chats");
    } finally {
      setLoading((prev) => ({ ...prev, chats: false }));
    }
  }, [token]);

  // Fetch a specific chat by ID
  const fetchChatById = useCallback(
    async (chatId) => {
      if (!token || !chatId) return;

      setLoading((prev) => ({ ...prev, chats: true }));
      setError(null);

      try {
        const response = await api.get(`/chats/${chatId}`);
        setActiveChat(response.data);
        return response.data;
      } catch (err) {
        console.error("Error fetching chat:", err);
        setError(err.response?.data?.message || "Failed to fetch chat");
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, chats: false }));
      }
    },
    [token]
  );

  // Fetch messages for the active chat
  const fetchMessages = useCallback(
    async (chatId, page = 1, reset = false) => {
      if (!token || !chatId) return;

      setLoading((prev) => ({ ...prev, messages: page === 1 || reset }));
      setError(null);

      try {
        const response = await api.get(`/chats/${chatId}/messages`, {
          params: { page },
        });

        if (reset || page === 1) {
          setMessages(response.data.messages);
        } else {
          // When loading older messages, prepend them to the beginning
          setMessages((prev) => [...response.data.messages, ...prev]);
        }

        setHasMoreMessages(response.data.hasMore);
        setMessagePage(page);
        return response.data;
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err.response?.data?.message || "Failed to fetch messages");
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, messages: false }));
      }
    },
    [token]
  );

  // Create a new chat
  const createChat = useCallback(
    async (chatData) => {
      if (!token) return;

      setLoading((prev) => ({ ...prev, createChat: true }));
      setError(null);

      try {
        const response = await api.post("/chats", chatData);
        setChats((prev) => [response.data, ...prev]);
        setActiveChat(response.data);
        return response.data;
      } catch (err) {
        console.error("Error creating chat:", err);
        setError(err.response?.data?.message || "Failed to create chat");
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, createChat: false }));
      }
    },
    [token]
  );

  // Update a chat
  const updateChat = useCallback(
    async (chatId, chatData) => {
      if (!token || !chatId) return;

      setError(null);

      try {
        const response = await api.put(`/chats/${chatId}`, chatData);

        // Update in chats list
        setChats((prev) =>
          prev.map((chat) => (chat._id === chatId ? response.data : chat))
        );

        // Update active chat if it's the one being updated
        if (activeChat?._id === chatId) {
          setActiveChat(response.data);
        }

        return response.data;
      } catch (err) {
        console.error("Error updating chat:", err);
        setError(err.response?.data?.message || "Failed to update chat");
        return null;
      }
    },
    [token, activeChat]
  );

  // Delete a chat
  const deleteChat = useCallback(
    async (chatId) => {
      if (!token || !chatId) return;

      setError(null);

      try {
        await api.delete(`/chats/${chatId}`);

        // Remove from chats list
        setChats((prev) => prev.filter((chat) => chat._id !== chatId));

        // Clear active chat if it's the one being deleted
        if (activeChat?._id === chatId) {
          setActiveChat(null);
          setMessages([]);
        }

        return true;
      } catch (err) {
        console.error("Error deleting chat:", err);
        setError(err.response?.data?.message || "Failed to delete chat");
        return false;
      }
    },
    [token, activeChat]
  );

  // Send a message
  const sendMessage = useCallback(
    async (chatId, messageData) => {
      if (!token || !chatId) return;

      setLoading((prev) => ({ ...prev, sendMessage: true }));
      setError(null);

      // Create temporary message for optimistic UI
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        _id: tempId,
        chat: chatId,
        sender: {
          _id: user._id,
          name: user.name,
          profileImageURL: user.profileImageURL,
        },
        content: messageData.content,
        attachments: [],
        mentions: [],
        isDeleted: false,
        createdAt: new Date().toISOString(),
        isTemp: true,
      };

      // Optimistic update
      setMessages((prev) => [...prev, tempMessage]);

      try {
        // Set up form data if there are attachments
        let data;
        let headers = {};

        if (messageData.attachments?.length > 0) {
          data = new FormData();
          data.append("content", messageData.content);

          if (messageData.mentions?.length) {
            for (const mention of messageData.mentions) {
              data.append("mentions[]", mention);
            }
          }

          if (messageData.replyTo) {
            data.append("replyTo", messageData.replyTo);
          }

          for (const file of messageData.attachments) {
            data.append("attachments", file);
          }

          headers = {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          };
        } else {
          data = messageData;
        }

        const response = await (messageData.attachments?.length > 0
          ? api.post(`/chats/${chatId}/messages`, data, { headers })
          : api.post(`/chats/${chatId}/messages`, data));

        // Replace temp message with real one
        setMessages((prev) =>
          prev.map((msg) => (msg._id === tempId ? response.data : msg))
        );

        // Update lastMessage in chat lists
        setChats((prev) =>
          prev.map((chat) => {
            if (chat._id === chatId) {
              return {
                ...chat,
                lastMessage: response.data,
              };
            }
            return chat;
          })
        );

        return response.data;
      } catch (err) {
        console.error("Error sending message:", err);
        setError(err.response?.data?.message || "Failed to send message");

        // Remove temp message on error
        setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, sendMessage: false }));
      }
    },
    [token, user]
  );

  // Check for new chats periodically
  useEffect(() => {
    if (!token) return;

    fetchChats();

    // Poll for new chats every 60 seconds
    const interval = setInterval(fetchChats, 60000);

    return () => clearInterval(interval);
  }, [fetchChats, token]);

  // Reset messages when active chat changes
  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat._id, 1, true);
    } else {
      setMessages([]);
      setMessagePage(1);
      setHasMoreMessages(false);
    }
  }, [activeChat, fetchMessages]);

  // Set active chat and reset messages
  const setActiveChatAndReset = useCallback(
    (chat) => {
      setActiveChat(chat);
      setMessages([]);
      setMessagePage(1);
      setHasMoreMessages(false);
      if (chat) {
        fetchMessages(chat._id, 1, true);
      }
    },
    [fetchMessages]
  );

  const value = {
    chats,
    activeChat,
    setActiveChat,
    setActiveChatAndReset,
    messages,
    loading,
    error,
    hasMoreMessages,
    messagePage,
    fetchChats,
    fetchChatById,
    fetchMessages,
    createChat,
    updateChat,
    deleteChat,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export default ChatContext;
