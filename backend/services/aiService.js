import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const MAX_HISTORY_LENGTH = 10;

/**
 * Formats chat messages for OpenRouter API
 * @param {Array} messages - Chat messages to format
 * @param {Object} chat - Chat object with AI configuration
 * @returns {Array} Formatted messages for API
 */
const formatConversation = (messages, chat) => {
  // Add system message
  const formattedMessages = [
    {
      role: 'system',
      content: chat.aiAssistant.systemPrompt || 'You are a helpful assistant in a bug tracking application.'
    }
  ];
  
  // Add recent conversation messages (limit to prevent token overflow)
  const recentMessages = messages.slice(-MAX_HISTORY_LENGTH);
  
  recentMessages.forEach(message => {
    // Skip deleted messages
    if (message.isDeleted) return;
    
    formattedMessages.push({
      role: message.isAIMessage ? 'assistant' : 'user',
      content: message.content,
      // Include names for better context
      name: message.sender?.name
    });
  });
  
  return formattedMessages;
};

/**
 * Calls OpenRouter API to get AI response
 * @param {Array} messages - Formatted messages
 * @param {String} model - AI model to use
 * @returns {Promise<String>} AI response content
 */
export const getAIResponse = async (messages, chat) => {
  try {
    if (!OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured');
    }
    
    const formattedMessages = formatConversation(messages, chat);
    
    const response = await axios.post(
      OPENROUTER_URL,
      {
        messages: formattedMessages,
        model: chat.aiAssistant.model || 'gpt-3.5-turbo',
        max_tokens: 1000,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APPLICATION_URL || 'http://localhost:5000',
        }
      }
    );
    
    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error('No response from AI service');
    }
  } catch (error) {
    console.error('AI Service Error:', error.message);
    if (error.response) {
      console.error('API Response:', error.response.data);
    }
    throw new Error(`AI response failed: ${error.message}`);
  }
};

export default {
  getAIResponse
}; 