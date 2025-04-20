import React, { useState, useEffect } from 'react';
import { useChat } from '../../../context/ChatContext';
import { FaTimes, FaTrash, FaRobot } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const ChatSettingsModal = ({ chat, onClose }) => {
  const { updateChat, deleteChat } = useChat();
  const navigate = useNavigate();
  
  const [name, setName] = useState(chat.name || '');
  const [description, setDescription] = useState(chat.description || '');
  const [participants, setParticipants] = useState(
    chat.participants.map(p => p._id || p) || []
  );
  const [aiEnabled, setAiEnabled] = useState(chat.aiAssistant?.enabled || false);
  const [aiModel, setAiModel] = useState(chat.aiAssistant?.model || 'openai/gpt-3.5-turbo');
  const [systemPrompt, setSystemPrompt] = useState(
    chat.aiAssistant?.systemPrompt || 'You are a helpful AI assistant that helps the team solve technical issues.'
  );
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  
  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axiosInstance.get('/api/users');
        setUsers(response.data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    
    fetchUsers();
  }, []);
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert('Please enter a chat name');
      return;
    }
    
    setLoading(true);
    
    try {
      await updateChat(chat._id, {
        name,
        description,
        participants,
        aiAssistant: {
          enabled: aiEnabled,
          model: aiModel,
          systemPrompt
        }
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating chat:', error);
      alert('Failed to update chat settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle chat deletion
  const handleDeleteChat = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }
    
    setLoading(true);
    
    try {
      await deleteChat(chat._id);
      navigate('/user/chat');
      onClose();
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat. Please try again.');
    } finally {
      setLoading(false);
      setDeleteConfirm(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-90vh overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Chat Settings</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Chat Name */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Chat Name
            </label>
            <input
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter chat name"
              required
            />
          </div>
          
          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter chat description"
              rows={2}
            />
          </div>
          
          {/* Participants */}
          {chat.chatType !== 'public' && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Participants
              </label>
              <select
                multiple
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={participants}
                onChange={(e) => setParticipants(
                  Array.from(e.target.selectedOptions, option => option.value)
                )}
                size={4}
              >
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple users
              </p>
            </div>
          )}
          
          {/* AI Assistant Settings */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="aiEnabled"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="aiEnabled" className="text-gray-700 text-sm font-bold flex items-center">
                <FaRobot className="mr-1" /> Enable AI Assistant
              </label>
            </div>
            
            {aiEnabled && (
              <div className="ml-6 mt-2 space-y-3">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">
                    AI Model
                  </label>
                  <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                  >
                    <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="openai/gpt-4">GPT-4</option>
                    <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                    <option value="anthropic/claude-3-sonnet">Claude 3 Sonnet</option>
                    <option value="google/gemini-pro">Gemini Pro</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-1">
                    System Prompt
                  </label>
                  <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Delete Chat Button */}
          <div className="mb-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              className={`w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center ${
                deleteConfirm 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-100 hover:bg-red-200 text-red-600'
              }`}
              onClick={handleDeleteChat}
              disabled={loading}
            >
              <FaTrash className="mr-2" />
              {deleteConfirm ? 'Confirm Delete' : 'Delete Chat'}
            </button>
            {deleteConfirm && (
              <p className="text-xs text-red-500 mt-1 text-center">
                This action cannot be undone. All messages will be permanently deleted.
              </p>
            )}
          </div>
          
          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatSettingsModal; 