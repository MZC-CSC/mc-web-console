/**
 * Auth Store
 * Manages authentication state using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, LoginRequest, LoginResponse } from '@/types';
import { authService } from '@/services/auth';

// Cookie utilities
const setCookie = (name: string, value: string, days: number = 1) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (tokens: LoginResponse) => void;
  clearAuth: () => void;
  checkAuth: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginRequest) => {
        set({ isLoading: true, error: null });

        try {
          const response = await authService.login(credentials);

          // Store tokens in cookies
          setCookie('Authorization', response.access_token, 1);
          setCookie('RefreshToken', response.refresh_token, 1);

          set({
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            isAuthenticated: true,
            isLoading: false,
          });

          // Try to get user info
          try {
            const userInfo = await authService.getUserInfo();
            set({ user: userInfo });
          } catch {
            // User info fetch failed, but login succeeded
            console.warn('Failed to fetch user info');
          }

          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({
            isLoading: false,
            error: message,
            isAuthenticated: false,
          });
          return false;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // Ignore logout API errors
        } finally {
          get().clearAuth();
        }
      },

      setUser: (user: User) => {
        set({ user });
      },

      setTokens: (tokens: LoginResponse) => {
        setCookie('Authorization', tokens.access_token, 1);
        setCookie('RefreshToken', tokens.refresh_token, 1);

        set({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
        });
      },

      clearAuth: () => {
        deleteCookie('Authorization');
        deleteCookie('RefreshToken');

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },

      checkAuth: () => {
        const { accessToken } = get();
        return !!accessToken;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
