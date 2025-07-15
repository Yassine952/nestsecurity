import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    // For 2FA verification, use temporary token
    if (config.url?.includes('/auth/verify-2fa')) {
      const tempToken = localStorage.getItem('temp_token');
      if (tempToken) {
        config.headers.Authorization = `Bearer ${tempToken}`;
      }
    } else {
      // For other requests, use regular token
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on login/register pages
      // and if it's not a login/register request
      const currentPath = window.location.pathname;
      const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/register') ||
                           error.config?.url?.includes('/auth/verify-email');
      
      if (currentPath !== '/login' && currentPath !== '/register' && !isAuthRequest) {
        localStorage.removeItem('token');
        localStorage.removeItem('temp_token');
        // Use setTimeout to avoid immediate redirect during login attempts
        setTimeout(() => {
          window.location.href = '/login';
        }, 100);
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  register: (data: { email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  verifyEmail: (token: string) =>
    api.post('/auth/verify-email', { token }),
  
  resendVerification: (email: string) =>
    api.post('/auth/resend-verification', { email }),
  
  verifyTwoFactor: (code: string) =>
    api.post('/auth/verify-2fa', { code }),
  
  enableTwoFactor: () =>
    api.post('/auth/enable-2fa'),
  
  disableTwoFactor: () =>
    api.post('/auth/disable-2fa'),
  
  getProfile: () =>
    api.get('/auth/profile'),
};

export const resourcesApi = {
  getPublic: () =>
    api.get('/resources/public'),
  
  getAll: () =>
    api.get('/resources'),
  
  getById: (id: number) =>
    api.get(`/resources/${id}`),
  
  create: (data: { title: string; content: string }) =>
    api.post('/resources', data),
  
  update: (id: number, data: { title?: string; content?: string; isActive?: boolean }) =>
    api.patch(`/resources/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/resources/${id}`),
  
  getAllForAdmin: () =>
    api.get('/resources/admin'),
};

export default api; 