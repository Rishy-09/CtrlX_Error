import axios from 'axios';
import { BASE_URL } from './apiPaths';
import { toast } from 'react-hot-toast';

// Track session expiry to prevent multiple notifications
let isSessionExpired = false;
// List of public routes that don't require redirection
const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/landing', '/'];

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
                // Check if we've already handled session expiry
                if (!isSessionExpired) {
                    isSessionExpired = true;
                    localStorage.removeItem('token'); // Clear invalid token
                    
                    // Only show notification once
                    toast.error('Your session has expired. Please log in again.');
                    
                    // Only redirect if not already on a public route
                    const currentPath = window.location.pathname;
                    const isPublicRoute = publicRoutes.some(route => 
                        currentPath === route || currentPath.startsWith(route + '/')
                    );
                    
                    if (!isPublicRoute) {
                        // Store the current URL to redirect back after login
                        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                        // Redirect with a small delay to allow the toast to show
                        setTimeout(() => {
                            window.location.href = '/login';
                        }, 1500);
                    }
                }
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

// Reset session expired flag when the user successfully logs in
export const resetSessionExpiredFlag = () => {
    isSessionExpired = false;
};

export default axiosInstance;