import React, { useState, useEffect } from 'react';
import { useChat } from '../../../context/ChatContext';
import { FaTimes, FaGlobe, FaUsers, FaUser, FaRobot } from 'react-icons/fa';
import axiosInstance from '../../../utils/axiosInstance';

const CreateChatModal = ({ onClose, onSuccess }) => {
  const { createChat } = useChat();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [chatType, setChatType] = useState('public');
  const [participants, setParticipants] = useState([]);
  const [associatedBug, setAssociatedBug] = useState('');
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiModel, setAiModel] = useState('openai/gpt-3.5-turbo');
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful AI assistant that helps the team solve technical issues.'
  );
  
  const [users, setUsers] = useState([]);
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch users and bugs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, bugsResponse] = await Promise.all([
          axiosInstance.get('/api/users'),
          axiosInstance.get('/api/bugs')
        ]);
        
        setUsers(usersResponse.data || []);
        setBugs(bugsResponse.data?.bugs || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
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
      const chatData = {
        name,
        description,
        chatType,
        participants: chatType !== 'public' ? participants : [],
        associatedBug: associatedBug || undefined,
        aiAssistant: aiEnabled ? {
          enabled: true,
          model: aiModel,
          systemPrompt
        } : undefined
      };
      
      const newChat = await createChat(chatData);
      onSuccess(newChat._id);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      alert('Failed to create chat. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] my-4 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Create New Chat</h2>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 flex-grow">
          <form id="create-chat-form" onSubmit={handleSubmit}>
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
                Description (optional)
              </label>
              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter chat description"
                rows={2}
              />
            </div>
            
            {/* Chat Type */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Chat Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-2 rounded ${
                    chatType === 'public' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                  onClick={() => setChatType('public')}
                >
                  <FaGlobe size={20} />
                  <span className="text-xs mt-1">Public</span>
                </button>
                
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-2 rounded ${
                    chatType === 'team' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                  onClick={() => setChatType('team')}
                >
                  <FaUsers size={20} />
                  <span className="text-xs mt-1">Team</span>
                </button>
                
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-2 rounded ${
                    chatType === 'private' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                  onClick={() => setChatType('private')}
                >
                  <FaUser size={20} />
                  <span className="text-xs mt-1">Private</span>
                </button>
                
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-2 rounded ${
                    chatType === 'ai_assistant' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'
                  }`}
                  onClick={() => {
                    setChatType('ai_assistant');
                    setAiEnabled(true);
                  }}
                >
                  <FaRobot size={20} />
                  <span className="text-xs mt-1">AI Chat</span>
                </button>
              </div>
            </div>
            
            {/* Participants (for non-public chats) */}
            {chatType !== 'public' && (
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
            
            {/* Associated Bug */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Associated Bug (optional)
              </label>
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={associatedBug}
                onChange={(e) => setAssociatedBug(e.target.value)}
              >
                <option value="">None</option>
                {bugs.map(bug => (
                  <option key={bug._id} value={bug._id}>
                    {bug.title}
                  </option>
                ))}
              </select>
            </div>
            
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
                <label htmlFor="aiEnabled" className="text-gray-700 text-sm font-bold">
                  Enable AI Assistant
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
          </form>
        </div>
        
        {/* Footer with buttons - fixed at bottom */}
        <div className="border-t p-4 bg-gray-50 rounded-b-lg">
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
              form="create-chat-form"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-b-2 border-white rounded-full"></div>
                  Creating...
                </>
              ) : 'Create Chat'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChatModal; 