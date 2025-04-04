import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const fetchDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/stats/dashboard`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
  }
};

export const fetchBugTrends = async (timeframe = '7d') => {
  try {
    const response = await axios.get(`${API_URL}/stats/trends?timeframe=${timeframe}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch bug trends');
  }
};

export const fetchUserStats = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/stats/users/${userId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user stats');
  }
};