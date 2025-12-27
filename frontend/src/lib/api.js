import axios from 'axios';

/**
 * API Client for VBS Ticketing
 */
const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    const code = error.response?.data?.code || 'ERROR';
    
    // Handle auth errors
    if (error.response?.status === 401) {
      // Clear tokens on auth failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/admin')) {
        // Don't redirect for public pages
      }
    }
    
    return Promise.reject({ message, code, status: error.response?.status });
  }
);

/**
 * Auth API
 */
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  validateKey: (key) => api.post('/auth/validate-key', { key }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

/**
 * Tickets API
 */
export const ticketsApi = {
  // Public
  getById: (ticketId) => api.get(`/tickets/${ticketId}`),
  lookup: (phone, accessCode) => api.post('/tickets/lookup', { phone, accessCode }),
  getByPhone: (phone) => api.get(`/tickets/phone/${phone}`),
  
  // Auth required
  list: (params = {}) => api.get('/tickets', { params }),
  create: (data) => api.post('/tickets', data),
  verify: (ticketId) => api.post(`/tickets/${ticketId}/verify`),
  updateStatus: (ticketId, status) => api.patch(`/tickets/${ticketId}/status`, { status }),
  delete: (ticketId) => api.delete(`/tickets/${ticketId}`),
  bulkCreate: (tickets) => api.post('/tickets/bulk', { tickets }),
  getStats: () => api.get('/tickets/stats'),
};

/**
 * Payments API
 */
export const paymentsApi = {
  initiate: (data) => api.post('/payments/initiate', data),
  checkStatus: (reference) => api.get(`/payments/status/${reference}`),
  verify: (data) => api.post('/payments/verify', data),
};

/**
 * Helper to set auth tokens
 */
export const setAuthTokens = (accessToken, refreshToken) => {
  localStorage.setItem('accessToken', accessToken);
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  }
};

/**
 * Helper to clear auth tokens
 */
export const clearAuthTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('accessToken');
};

export default api;

