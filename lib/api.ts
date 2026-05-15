import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api/v1';
const MOCK_API_KEY = process.env.NEXT_PUBLIC_MOCK_API_KEY;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(MOCK_API_KEY ? { 'x-api-key': MOCK_API_KEY } : {}),
  },
});

// Request interceptor to add token
api.interceptors.request.use((config: any) => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: any) => {
    if (error?.response?.status === 401) {
      try {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-token');
          window.location.href = '/login';
        }
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export default api;