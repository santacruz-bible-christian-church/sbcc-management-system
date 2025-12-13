import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/auth.api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      // Login
      login: async (username, password) => {
        set({ loading: true, error: null });
        try {
          const data = await authApi.login(username, password);

          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          localStorage.setItem('user', JSON.stringify(data.user));

          set({
            user: data.user,
            accessToken: data.access,
            refreshToken: data.refresh,
            isAuthenticated: true,
            loading: false,
          });

          return { success: true };
        } catch (error) {
          let errorMessage = 'Login failed. Please try again.';

          // Handle different error responses
          if (error.response) {
            const status = error.response.status;
            const detail = error.response.data?.detail;

            if (status === 401) {
              errorMessage = 'Invalid username or password. Please check your credentials and try again.';
            } else if (status === 400) {
              errorMessage = detail || 'Please provide both username and password.';
            } else if (status === 403) {
              errorMessage = 'Your account has been deactivated. Please contact an administrator.';
            } else if (status === 429) {
              errorMessage = 'Too many login attempts. Please wait a few minutes and try again.';
            } else if (detail) {
              // Use API-provided message if available
              errorMessage = detail;
            }
          } else if (error.request) {
            // Network error - no response received
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
          }

          set({ loading: false, error: errorMessage });
          return { success: false, error: errorMessage };
        }
      },

      // Logout
      logout: async () => {
        try {
          const { refreshToken } = get();
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');

          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
          });
        }
      },

      // Update user
      updateUser: async () => {
        try {
          const user = await authApi.getCurrentUser();
          localStorage.setItem('user', JSON.stringify(user));
          set({ user });
          return { success: true, user };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // Initialize from localStorage
      initialize: () => {
        const token = localStorage.getItem('access_token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          set({
            user: JSON.parse(userStr),
            accessToken: token,
            refreshToken: localStorage.getItem('refresh_token'),
            isAuthenticated: true,
          });
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
