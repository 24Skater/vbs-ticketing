import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'STAFF' | 'CHECKER';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login(email, password);
          
          if (response.success) {
            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
            
            return true;
          } else {
            set({
              error: response.error || 'Login failed',
              isLoading: false,
            });
            return false;
          }
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({
            error: message,
            isLoading: false,
          });
          return false;
        }
      },
      
      logout: async () => {
        try {
          await authApi.logout();
        } catch {
          // Ignore errors during logout
        }
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          isAuthenticated: false,
        });
      },
      
      checkAuth: async () => {
        const token = localStorage.getItem('accessToken');
        
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        
        set({ isLoading: true });
        
        try {
          const response = await authApi.me();
          
          if (response.success) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('Auth check failed');
          }
        } catch {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Helper to check if user has required role
export function hasRole(user: User | null, ...roles: User['role'][]): boolean {
  if (!user) return false;
  
  const roleHierarchy: Record<User['role'], number> = {
    SUPER_ADMIN: 100,
    ADMIN: 80,
    STAFF: 60,
    CHECKER: 40,
  };
  
  const userLevel = roleHierarchy[user.role];
  return roles.some(role => userLevel >= roleHierarchy[role]);
}

