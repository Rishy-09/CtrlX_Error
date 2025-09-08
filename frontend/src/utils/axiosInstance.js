import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 30000, // 30 seconds timeout
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Request interceptor to add JWT token to headers
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem('token');
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
        if (error.response) {
            const { data } = error.response;

            if (error.response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/login';
            } else if (error.response.status === 500) {
                console.error("Server error. Please try again later.");
            } else if (data && data.message) {
                console.error(`Error: ${data.message}`);
            }
        } 
        else if (error.code === 'ECONNABORTED') {
            console.error('Request timed out. Please try again later.');
        } else {
            console.error('An unexpected error occurred.');
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;