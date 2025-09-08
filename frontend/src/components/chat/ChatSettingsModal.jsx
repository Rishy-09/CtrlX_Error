import { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/userContext';
import axios from 'axios';
import { FaTimes, FaRobot, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const ChatSettingsModal = ({ chat, onClose }) => {
  const { updateChat, deleteChat, loading } = useChat();
  const { user, token } = useAuth();
  const [chatData, setChatData] = useState({
    name: chat.name,
    participants: chat.participants.map(p => p._id),
    admins: chat.admins.map(a => a._id),
    aiAssistant: {
      enabled: chat.aiAssistant?.enabled || false,
      model: chat.aiAssistant?.model || 'gpt-3.5-turbo',
      systemPrompt: chat.aiAssistant?.systemPrompt || 'You are a helpful assistant in a bug tracking application.'
    }
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedTab, setSelectedTab] = useState('general');

  // Check if current user is admin
  const isAdmin = chat.admins.some(admin => admin._id === user?._id);

  // Fetch available users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setAvailableUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!chatData.name.trim()) {
      return;
    }
    
    try {
      await updateChat(chat._id, chatData);
      onClose();
    } catch (error) {
      console.error('Error updating chat:', error);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('aiAssistant.')) {
      const aiField = name.split('.')[1];
      setChatData({
        ...chatData,
        aiAssistant: {
          ...chatData.aiAssistant,
          [aiField]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setChatData({
        ...chatData,
        [name]: value
      });
    }
  };

  // Handle participant selection
  const handleParticipantChange = (userId) => {
    setChatData((prev) => {
      const isSelected = prev.participants.includes(userId);
      
      if (isSelected) {
        // Also remove from admins if present
        return {
          ...prev,
          participants: prev.participants.filter(id => id !== userId),
          admins: prev.admins.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          participants: [...prev.participants, userId]
        };
      }
    });
  };

  // Handle admin selection
  const handleAdminChange = (userId) => {
    setChatData((prev) => {
      const isSelected = prev.admins.includes(userId);
      
      if (isSelected) {
        return {
          ...prev,
          admins: prev.admins.filter(id => id !== userId)
        };
      } else {
        // Ensure admin is also a participant
        return {
          ...prev,
          admins: [...prev.admins, userId],
          participants: prev.participants.includes(userId) 
            ? prev.participants 
            : [...prev.participants, userId]
        };
      }
    });
  };

  // Handle chat deletion
  const handleDeleteChat = async () => {
    try {
      await deleteChat(chat._id);
      onClose();
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chat Settings</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setSelectedTab('general')}
              className={`px-4 py-2 font-medium text-sm ${
                selectedTab === 'general'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              General
            </button>
            <button
              onClick={() => setSelectedTab('members')}
              className={`px-4 py-2 font-medium text-sm ${
                selectedTab === 'members'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Members
            </button>
            <button
              onClick={() => setSelectedTab('ai')}
              className={`px-4 py-2 font-medium text-sm ${
                selectedTab === 'ai'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              AI Assistant
            </button>
            {isAdmin && (
              <button
                onClick={() => setSelectedTab('danger')}
                className={`px-4 py-2 font-medium text-sm ${
                  selectedTab === 'danger'
                    ? 'border-b-2 border-red-500 text-red-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Danger
              </button>
            )}
          </nav>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-4">
            {/* General Settings */}
            {selectedTab === 'general' && (
              <div>
                <div className="mb-4">
                  <label htmlFor="chat-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Chat Name
                  </label>
                  <input
                    id="chat-name"
                    type="text"
                    name="name"
                    value={chatData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter chat name"
                    required
                    disabled={!isAdmin}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chat Type
                  </label>
                  <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
                    {chat.type === 'ai_assistant' ? 'AI Assistant' : chat.type}
                    <span className="text-xs text-gray-500 block mt-1">
                      Chat type cannot be changed after creation
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Members */}
            {selectedTab === 'members' && (
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Participants
                  </label>
                  {loadingUsers ? (
                    <div className="flex justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
                      {availableUsers.map((user) => (
                        <label
                          key={user._id}
                          className="flex items-center p-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={chatData.participants.includes(user._id)}
                            onChange={() => handleParticipantChange(user._id)}
                            className="mr-2"
                            disabled={!isAdmin}
                          />
                          <span className="flex-1">{user.name}</span>
                          {isAdmin && (
                            <label className="flex items-center ml-4 text-xs">
                              <input
                                type="checkbox"
                                checked={chatData.admins.includes(user._id)}
                                onChange={() => handleAdminChange(user._id)}
                                disabled={!chatData.participants.includes(user._id)}
                                className="mr-1"
                              />
                              Admin
                            </label>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                  {!isAdmin && (
                    <p className="text-xs text-gray-500 mt-1">
                      Only chat admins can modify participants
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* AI Assistant */}
            {selectedTab === 'ai' && (
              <div>
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center text-sm font-medium text-gray-700">
                      <FaRobot className="mr-1 text-purple-500" />
                      AI Assistant
                    </label>
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="aiAssistant.enabled"
                        checked={chatData.aiAssistant.enabled}
                        onChange={handleChange}
                        className="mr-2"
                        disabled={!isAdmin}
                      />
                      <span className="text-sm">Enable</span>
                    </label>
                  </div>
                  
                  {chatData.aiAssistant.enabled && (
                    <>
                      {/* AI Model Selection */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          AI Model
                        </label>
                        <select
                          name="aiAssistant.model"
                          value={chatData.aiAssistant.model}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          disabled={!isAdmin}
                        >
                          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                          <option value="gpt-4">GPT-4</option>
                          <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                          <option value="claude-3-opus">Claude 3 Opus</option>
                        </select>
                      </div>
                      
                      {/* System Prompt */}
                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          System Prompt
                        </label>
                        <textarea
                          name="aiAssistant.systemPrompt"
                          value={chatData.aiAssistant.systemPrompt}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          rows="4"
                          placeholder="Instructions for the AI"
                          disabled={!isAdmin}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          This prompt guides the AI's behavior and responses.
                        </p>
                      </div>
                    </>
                  )}
                  
                  {!isAdmin && (
                    <p className="text-xs text-gray-500 mt-1">
                      Only chat admins can modify AI settings
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Danger Zone */}
            {selectedTab === 'danger' && isAdmin && (
              <div className="mt-2">
                <div className="border border-red-300 rounded-md bg-red-50 p-4">
                  <h3 className="text-lg font-medium text-red-800 flex items-center">
                    <FaExclamationTriangle className="mr-2" />
                    Danger Zone
                  </h3>
                  <p className="mt-2 text-sm text-red-700">
                    Deleting this chat will permanently remove all messages. This action cannot be undone.
                  </p>
                  
                  {!deleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirm(true)}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Delete Chat
                    </button>
                  ) : (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-red-800 mb-2">
                        Are you sure? Type the chat name to confirm:
                      </p>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                        placeholder={chat.name}
                        onChange={(e) => {
                          if (e.target.value === chat.name) {
                            handleDeleteChat();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(false)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Footer with buttons */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            {isAdmin && selectedTab !== 'danger' && (
              <button
                type="submit"
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                disabled={loading.updateChat || !chatData.name.trim()}
              >
                {loading.updateChat ? (
                  <>
                    <span className="animate-spin inline-block h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSettingsModal; 