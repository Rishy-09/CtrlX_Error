import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch users');
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}/role`, { role });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update user role');
  }
};

export const updateUserProfile = async (userId, profileData) => {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}/profile`, profileData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to update profile');
  }
};