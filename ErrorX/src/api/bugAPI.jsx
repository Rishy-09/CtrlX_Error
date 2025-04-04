import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchBugs = async () => {
  try {
    const response = await axios.get(`${API_URL}/bugs`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bugs');
  }
};

export const createBug = async (bugData) => {
  try {
    const response = await axios.post(`${API_URL}/bugs`, bugData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create bug');
  }
};

export const updateBug = async (bugId, bugData) => {
  try {
    const response = await axios.put(`${API_URL}/bugs/${bugId}`, bugData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update bug');
  }
};

export const deleteBug = async (bugId) => {
  try {
    await axios.delete(`${API_URL}/bugs/${bugId}`);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to delete bug');
  }
};