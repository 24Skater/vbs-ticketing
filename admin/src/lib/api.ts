import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });
        
        localStorage.setItem('accessToken', data.accessToken);
        
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API functions
export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },
  
  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  
  me: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export const configApi = {
  getPublic: async () => {
    const { data } = await api.get('/config');
    return data;
  },
  
  getFull: async () => {
    const { data } = await api.get('/config/admin');
    return data;
  },
  
  update: async (updates: Record<string, unknown>) => {
    const { data } = await api.patch('/config/admin', updates);
    return data;
  },
};

export const eventsApi = {
  list: async (params?: { page?: number; limit?: number; active?: boolean }) => {
    const { data } = await api.get('/events', { params });
    return data;
  },
  
  get: async (id: string) => {
    const { data } = await api.get(`/events/${id}`);
    return data;
  },
  
  create: async (event: Record<string, unknown>) => {
    const { data } = await api.post('/events', event);
    return data;
  },
  
  update: async (id: string, updates: Record<string, unknown>) => {
    const { data } = await api.patch(`/events/${id}`, updates);
    return data;
  },
  
  delete: async (id: string) => {
    const { data } = await api.delete(`/events/${id}`);
    return data;
  },
};

export const ticketsApi = {
  list: async (params?: Record<string, unknown>) => {
    const { data } = await api.get('/tickets', { params });
    return data;
  },
  
  get: async (ticketId: string) => {
    const { data } = await api.get(`/tickets/${ticketId}`);
    return data;
  },
  
  create: async (ticket: Record<string, unknown>) => {
    const { data } = await api.post('/tickets', ticket);
    return data;
  },
  
  verify: async (ticketId: string) => {
    const { data } = await api.post(`/tickets/${ticketId}/verify`);
    return data;
  },
  
  cancel: async (ticketId: string) => {
    const { data } = await api.post(`/tickets/${ticketId}/cancel`);
    return data;
  },
};

export const analyticsApi = {
  dashboard: async () => {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  },
  
  sales: async (params?: { startDate?: string; endDate?: string; groupBy?: string }) => {
    const { data } = await api.get('/analytics/sales', { params });
    return data;
  },
};

export const usersApi = {
  list: async () => {
    const { data } = await api.get('/auth/users');
    return data;
  },
  
  create: async (user: Record<string, unknown>) => {
    const { data } = await api.post('/auth/register', user);
    return data;
  },
  
  delete: async (id: string) => {
    const { data } = await api.delete(`/auth/users/${id}`);
    return data;
  },
};

