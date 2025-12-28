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
 * Events API
 */
export const eventsApi = {
  list: (params = {}) => api.get('/events', { params }),
  getById: (id) => api.get(`/events/${id}`),
  create: (data) => api.post('/events', data),
  update: (id, data) => api.patch(`/events/${id}`, data),
  delete: (id) => api.delete(`/events/${id}`),
  getTicketTypes: (eventId) => api.get(`/events/${eventId}/ticket-types`),
  createTicketType: (eventId, data) => api.post(`/events/${eventId}/ticket-types`, data),
  updateTicketType: (eventId, typeId, data) => api.patch(`/events/${eventId}/ticket-types/${typeId}`, data),
  deleteTicketType: (eventId, typeId) => api.delete(`/events/${eventId}/ticket-types/${typeId}`),
};

/**
 * Config API (public)
 */
export const configApi = {
  getPublicConfig: () => api.get('/config'),
  getThemeCss: () => api.get('/config/theme.css'),
  getPaymentProviders: () => api.get('/config/payment-providers'),
};

/**
 * Admin API
 */
export const adminApi = {
  // Config
  getConfig: () => api.get('/config/admin'),
  updateConfig: (data) => api.patch('/config/admin', data),
  clearCache: () => api.post('/config/admin/clear-cache'),
  
  // Payment providers
  getPaymentProviders: () => api.get('/config/admin/payment-providers'),
  getPaymentProvider: (provider) => api.get(`/config/admin/payment-providers/${provider}`),
  upsertPaymentProvider: (provider, data) => api.put(`/config/admin/payment-providers/${provider}`, data),
  deletePaymentProvider: (provider) => api.delete(`/config/admin/payment-providers/${provider}`),
  togglePaymentProvider: (provider, enabled) => api.post(`/config/admin/payment-providers/${provider}/toggle`, { enabled }),
  setDefaultPaymentProvider: (provider) => api.post(`/config/admin/payment-providers/${provider}/set-default`),
  
  // File uploads
  uploadFile: (category, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    return api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
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

