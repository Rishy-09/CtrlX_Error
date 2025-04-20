import axios from 'axios';
import { BASE_URL } from './apiPaths';
import { toast } from 'react-hot-toast';

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000, // Increase timeout to 30 seconds
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add JWT token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token'); // Assuming token is stored in localStorage
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors globally
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common error globally
        if (error.response) {
            if (error.response.status === 401) {
                // Redirect to login page 
                localStorage.removeItem('token'); // Clear invalid token
                toast.error('Your session has expired. Please log in again.');
                window.location.href = '/login';
            } else if (error.response.status === 403) {
                toast.error('You do not have permission to perform this action');
            } else if (error.response.status === 500) {
                toast.error('Server error. Please try again later.');
            } else if (error.response.status === 400) {
                // Don't show toast for 400 errors as they will be handled by specific components
                console.error('Bad request:', error.response.data?.message || 'Invalid request');
            }
        } 
        else if (error.code === 'ECONNABORTED') {
            // Handle timeout error
            toast.error('Request timed out. Please check your connection and try again.');
            console.error('Request timed out. Please try again later.');
        } else if (error.message === 'Network Error') {
            toast.error('Network error. Please check your connection.');
            console.error('Network error. Please check your connection.');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;