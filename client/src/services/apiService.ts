import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        "Content-Type": "application/json"
    }
});

// Add a request interceptor to add the auth token to requests
axiosInstance.interceptors.request.use(
    (config) => {
        const currentPath = window.location.pathname;
        let token = null;

        // List of endpoints that should NOT have the Authorization header
        const publicEndpoints = [
            '/users/login',
            '/users/register',
            '/instructors/login',
            '/instructors/register',
            '/admin/login',
            '/admin/register',
        ];
        // If the request URL ends with a public endpoint, skip adding the token
        if (config.url && publicEndpoints.some(endpoint => config.url.endsWith(endpoint))) {
            return config;
        }

        if (currentPath.startsWith('/instructors')) {
            token = localStorage.getItem('instructorAccessToken');
        } else if (currentPath.startsWith('/admin')) {
            token = localStorage.getItem('adminAccessToken');
        } else {
            token = localStorage.getItem('accessToken');
        }
        
        if (token) {
            console.log('Axios interceptor using token:', token);
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });

    failedQueue = [];
};

// Add a response interceptor
axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function(resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = 'Bearer ' + token;
                    return axiosInstance(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                })
            }

            originalRequest._retry = true;
            isRefreshing = true;
            
            const currentPath = window.location.pathname;
            let refreshToken = null;
            let refreshEndpoint = '';
            let accessTokenKey = '';
            let refreshTokenKey = '';
            let loginUrl = '';

            if (currentPath.startsWith('/instructors')) {
                refreshToken = localStorage.getItem('instructorRefreshToken');
                refreshEndpoint = '/api/instructors/refresh-token';
                accessTokenKey = 'instructorAccessToken';
                refreshTokenKey = 'instructorRefreshToken';
                loginUrl = '/instructors/login';
            } else if (currentPath.startsWith('/admin')) {
                refreshToken = localStorage.getItem('adminRefreshToken');
                refreshEndpoint = '/api/admin/refresh-token'; // Assuming this exists
                accessTokenKey = 'adminAccessToken';
                refreshTokenKey = 'adminRefreshToken';
                loginUrl = '/admin/login';
            } else {
                refreshToken = localStorage.getItem('refreshToken');
                refreshEndpoint = '/api/users/refresh-token';
                accessTokenKey = 'accessToken';
                refreshTokenKey = 'refreshToken';
                loginUrl = '/users/login';
            }

            if (!refreshToken) {
                localStorage.removeItem(accessTokenKey);
                localStorage.removeItem(refreshTokenKey);
                if (currentPath.startsWith('/admin')) {
                    window.location.href = '/admin/login';
                } else {
                    window.location.href = loginUrl;
                }
                return Promise.reject(error);
            }

            try {
                const { data } = await axiosInstance.post(refreshEndpoint, { refreshToken });
                localStorage.setItem(accessTokenKey, data.accessToken);
                axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + data.accessToken;
                originalRequest.headers['Authorization'] = 'Bearer ' + data.accessToken;
                processQueue(null, data.accessToken);
                return axiosInstance(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem(accessTokenKey);
                localStorage.removeItem(refreshTokenKey);
                if (currentPath.startsWith('/admin')) {
                    window.location.href = '/admin/login';
                } else {
                    window.location.href = loginUrl;
                }
                processQueue(refreshError, null);
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    }
);

// Razorpay Payment APIs
export const createRazorpayOrder = async (amount: number, courseId: string) => {
  return axiosInstance.post('/api/payment/orders', { amount, courseId });
};

export const verifyRazorpayPayment = async (order_id: string, payment_id: string, signature: string, courseId: string, amount: number) => {
  return axiosInstance.post('/api/payment/verify', { order_id, payment_id, signature, courseId, amount });
};

export const checkUserEnrolled = async (courseId: string) => {
  return axiosInstance.get(`/api/users/courses/${courseId}/enrolled`);
};

export default axiosInstance