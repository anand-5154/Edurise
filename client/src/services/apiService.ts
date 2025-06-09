import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        "Content-Type": "application/json"
    }
});

// Add a request interceptor to add the auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        // Get the current path to determine which token to use
        const currentPath = window.location.pathname;
        let token = null;

        if (currentPath.startsWith('/instructors')) {
            token = localStorage.getItem('instructorToken');
        } else if (currentPath.startsWith('/admin')) {
            token = localStorage.getItem('adminToken');
        } else {
            token = localStorage.getItem('token');
        }
        
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear tokens based on the current path
            const currentPath = window.location.pathname;
            if (currentPath.startsWith('/instructors')) {
                localStorage.removeItem('instructorToken');
                window.location.href = '/instructors/login';
            } else if (currentPath.startsWith('/admin')) {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
            } else {
                localStorage.removeItem('token');
                window.location.href = '/users/login';
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance