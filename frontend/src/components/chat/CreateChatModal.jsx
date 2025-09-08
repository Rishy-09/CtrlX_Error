import { useState, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import axios from 'axios';
import { useAuth } from '../../context/userContext';
import { FaTimes, FaRobot } from 'react-icons/fa';

const CreateChatModal = ({ onClose }) => {
  const { createChat, loading } = useChat();
  const { token } = useAuth();
  const [chatData, setChatData] = useState({
    name: '',
    type: 'private',
    participants: [],
    aiAssistant: {
      enabled: false,
      model: 'gpt-3.5-turbo',
      systemPrompt: 'You are a helpful assistant in a bug tracking application.'
    }
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

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
      await createChat(chatData);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
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
        return {
          ...prev,
          participants: prev.participants.filter(id => id !== userId)
        };
      } else {
        return {
          ...prev,
          participants: [...prev.participants, userId]
        };
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Create New Chat</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Chat Name */}
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
            />
          </div>
          
          {/* Chat Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chat Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['private', 'team', 'public', 'ai_assistant'].map((type) => (
                <label
                  key={type}
                  className={`
                    flex items-center border rounded-md p-2 cursor-pointer
                    ${chatData.type === type ? 'bg-blue-50 border-blue-500' : 'border-gray-300'}
                  `}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type}
                    checked={chatData.type === type}
                    onChange={handleChange}
                    className="hidden"
                  />
                  <span className="ml-2 capitalize">
                    {type === 'ai_assistant' ? 'AI Assistant' : type}
                  </span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Participants */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Participants
            </label>
            {loadingUsers ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-md max-h-40 overflow-y-auto">
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
                    />
                    <span>{user.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          
          {/* AI Assistant settings */}
          <div className="mb-4 border-t border-gray-200 pt-3">
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
                    rows="3"
                    placeholder="Instructions for the AI"
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={loading.createChat}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
              disabled={loading.createChat || !chatData.name.trim()}
            >
              {loading.createChat ? (
                <>
                  <span className="animate-spin inline-block h-4 w-4 border-t-2 border-white rounded-full mr-2"></span>
                  Creating...
                </>
              ) : (
                'Create Chat'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatModal; 