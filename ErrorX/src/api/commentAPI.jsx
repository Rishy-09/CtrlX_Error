import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchComments = async (bugId) => {
  try {
    const response = await axios.get(`${API_URL}/bugs/${bugId}/comments`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch comments');
  }
};

export const createComment = async (bugId, commentData) => {
  try {
    const response = await axios.post(`${API_URL}/bugs/${bugId}/comments`, commentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create comment');
  }
};

export const deleteComment = async (bugId, commentId) => {
  try {
    await axios.delete(`${API_URL}/bugs/${bugId}/comments/${commentId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete comment');
  }
};