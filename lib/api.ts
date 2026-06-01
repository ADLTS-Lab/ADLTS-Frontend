import axios from 'axios';
import { clearAuthStorage } from '@/lib/auth-session';
import { isLocalFallbackEnabled } from '@/lib/runtime-flags';
import { useAuthStore } from '@/store/authStore';

const CONFIGURED_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? '';
const API_BASE_URL = CONFIGURED_API_BASE_URL || (isLocalFallbackEnabled() ? '/api/v1' : '');
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
  if (!API_BASE_URL) {
    throw new Error(
      'NEXT_PUBLIC_API_BASE_URL is not set. Configure a backend /api/v1 URL or enable NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK=true for local mocks.'
    );
  }

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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: any) => {
    const originalRequest = error.config;

    // Check if error status is 401 and it's not a retry
    if (error?.response?.status === 401 && !originalRequest._retry) {
      // Do not try to refresh if we are already on login/refresh endpoints
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/token/refresh')
      ) {
        return Promise.reject(error);
      }

      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refresh-token') : null;

      if (!refreshToken) {
        handleAuthFailure();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(`${API_BASE_URL}/auth/token/refresh`, {
          refresh_token: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json',
            ...(MOCK_API_KEY ? { 'x-api-key': MOCK_API_KEY } : {}),
          }
        });

        const newAccessToken = refreshResponse.data?.data?.access_token;
        const newRefreshToken = refreshResponse.data?.data?.refresh_token;

        if (newAccessToken) {
          localStorage.setItem('auth-token', newAccessToken);
          if (newRefreshToken) {
            localStorage.setItem('refresh-token', newRefreshToken);
          }
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);
          return api(originalRequest);
        } else {
          throw new Error('Refresh response missing token');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleAuthFailure();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

function handleAuthFailure() {
  clearAuthStorage();
  useAuthStore.getState().logout();
  if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
    window.location.href = '/login';
  }
}

export default api;
