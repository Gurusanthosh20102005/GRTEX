import axios from 'axios';

let baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Safety check: Auto-append '/api' suffix if the configured URL lacks it
if (baseUrl && !baseUrl.endsWith('/api') && !baseUrl.endsWith('/api/')) {
    baseUrl = baseUrl.replace(/\/$/, '') + '/api';
}

const api = axios.create({
    baseURL: baseUrl,
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
