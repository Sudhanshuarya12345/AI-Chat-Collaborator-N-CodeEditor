import axios from 'axios';

const axiosInstance = axios.create({   
    baseURL: import.meta.env.VITE_API_URL,
});

// Add a request interceptor to always use the latest token
axiosInstance.interceptors.request.use(
    (config) => {
        // Try localStorage first, then sessionStorage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        } else {
            delete config.headers['Authorization'];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default axiosInstance;