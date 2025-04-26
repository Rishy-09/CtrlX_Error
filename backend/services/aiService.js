import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const REFERRER_URL = process.env.REFERRER_URL || 'http://localhost:5173/';

/**
 * Generate an AI response to a message based on chat history
 * @param {string} chatId - The ID of the chat
 * @param {Array} messages - Array of message objects with sender and content
 * @param {Object} aiConfig - Configuration for the AI assistant
 * @returns {Promise<string>} - The AI generated response
 */
export const generateAIResponse = async (chatId, messages, aiConfig = {}) => {
  // Check if API key is available
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API key not found in environment variables');
    throw new Error('AI configuration error: API key missing');
  }

  try {
    // Default model if not specified
    const model = aiConfig.model || 'openai/gpt-3.5-turbo';
    
    // Format the messages for the API
    const formattedMessages = messages.map(msg => ({
      role: msg.sender?.isAI ? 'assistant' : 'user',
      content: msg.content
    }));

    // Add system message if specified in config
    if (aiConfig.systemPrompt) {
      formattedMessages.unshift({
        role: 'system',
        content: aiConfig.systemPrompt
      });
    } else {
      // Default system prompt
      formattedMessages.unshift({
        role: 'system',
        content: 'You are a helpful assistant responding in a chat application. Keep your answers concise and helpful.'
      });
    }

    console.log(`Generating AI response using model: ${model}, with ${formattedMessages.length} messages`);
    
    // Make the API call with proper authentication
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: formattedMessages,
        max_tokens: aiConfig.maxTokens || 1000,
        temperature: aiConfig.temperature || 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': REFERRER_URL,
          'X-Title': 'Task Management System Chat',
          'Content-Type': 'application/json',
        }
      }
    );

    // Extract and return the generated text
    if (response.data?.choices?.[0]?.message?.content) {
      return response.data.choices[0].message.content.trim();
    } else {
      console.error('Unexpected API response format:', response.data);
      throw new Error('Invalid response from AI service');
    }
  } catch (error) {
    console.error('Error generating AI response:', error.message);
    
    // Provide more specific error information
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      if (status === 401) {
        console.error('Authentication error with AI service:', data);
        throw new Error('AI service authentication failed. Please check your API key.');
      } else if (status === 429) {
        throw new Error('AI service rate limit exceeded. Please try again later.');
      } else {
        console.error('AI service error response:', data);
        throw new Error(`AI service error: ${status} - ${data?.error?.message || 'Unknown error'}`);
      }
    }
    
    throw new Error(`Failed to generate AI response: ${error.message}`);
  }
};

export default {
  generateAIResponse
}; 