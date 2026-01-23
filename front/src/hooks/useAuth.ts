'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, LoginRequest, LoginResponse, UserInfo } from '@/types/auth';
import { API_PATHS, OPERATION_IDS } from '@/constants/api';
import { apiPostByPath } from '@/lib/api/client';
import { setAuthToken } from '@/lib/api/client';
import { ROUTES } from '@/constants/routes';
import { useRouter } from 'next/navigation';
import { setAccessTokenCookie, deleteAccessTokenCookie } from '@/lib/utils/cookies';
import { useEffect } from 'react';

interface AuthStore extends Omit<AuthState, 'refreshToken'> {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  setUser: (user: UserInfo) => void;
  refreshTokenValue: string | null;
}

// localStorage 구조 검증 및 마이그레이션 함수
function validateAndMigrateAuthStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) {
    return;
  }

  try {
    const data = JSON.parse(authStorage);

    // Zustand persist 구조 검증
    if (!data.state || typeof data.version !== 'number') {
      console.warn('[Auth Migration] Invalid localStorage structure, migrating...', {
        hasState: !!data.state,
        hasVersion: typeof data.version === 'number',
        keys: Object.keys(data),
      });

      // 구조 수정
      const migratedData = {
        state: {
          isAuthenticated: data.isAuthenticated || false,
          accessToken: data.accessToken || null,
          refreshTokenValue: data.refreshTokenValue || null,
          user: data.user || null,
        },
        version: 0,
      };

      localStorage.setItem('auth-storage', JSON.stringify(migratedData));
      console.log('[Auth Migration] Migration completed successfully');
    }

    // refresh token 형식 검증
    const refreshToken = data?.state?.refreshTokenValue;
    if (refreshToken && typeof refreshToken === 'string') {
      const parts = refreshToken.split('.');
      if (parts.length !== 3) {
        console.error('[Auth Migration] Invalid refresh token format, clearing auth...', {
          segments: parts.length,
          tokenPreview: refreshToken.substring(0, 100),
        });
        localStorage.removeItem('auth-storage');
      }
    }
  } catch (e) {
    console.error('[Auth Migration] Failed to validate localStorage:', e);
    localStorage.removeItem('auth-storage');
  }
}

// 앱 로드 시 마이그레이션 실행
validateAndMigrateAuthStorage();

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      accessToken: null,
      refreshTokenValue: null,
      user: null,

      login: async (credentials: LoginRequest) => {
        try {
          const response = await apiPostByPath<LoginResponse>(
            API_PATHS.AUTH.LOGIN,
            OPERATION_IDS.LOGIN,
            {
              request: credentials as unknown as Record<string, unknown>,
            }
          );

          if (response.responseData) {
            const { access_token, refresh_token, expires_in } = response.responseData;
            
            // Refresh token 유효성 검사
            if (!refresh_token || typeof refresh_token !== 'string' || refresh_token.trim() === '') {
              console.error('[Login] Invalid refresh token received:', {
                type: typeof refresh_token,
                value: refresh_token,
              });
              throw new Error('로그인 응답에 유효한 refresh token이 없습니다.');
            }

            // JWT 형식 검사
            const tokenParts = refresh_token.split('.');
            if (tokenParts.length !== 3) {
              console.error('[Login] Invalid refresh token format:', {
                segments: tokenParts.length,
                tokenPreview: refresh_token.substring(0, 100),
              });
              throw new Error(`Refresh token 형식이 올바르지 않습니다. (세그먼트 수: ${tokenParts.length})`);
            }

            console.log('[Login] Storing tokens:', {
              hasAccessToken: !!access_token,
              hasRefreshToken: !!refresh_token,
              refreshTokenLength: refresh_token.length,
              refreshTokenPreview: refresh_token.substring(0, 50) + '...',
            });
            
            set({
              isAuthenticated: true,
              accessToken: access_token,
              refreshTokenValue: refresh_token,
            });

            setAuthToken(access_token);
            // 쿠키에 토큰 저장 (미들웨어에서 사용)
            setAccessTokenCookie(access_token, expires_in);
            
            console.log('[Login] Tokens stored successfully');
          } else {
            console.error('[Login] No responseData in login response:', response);
            throw new Error('로그인 응답에 토큰이 없습니다.');
          }
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },

      logout: () => {
        set({
          isAuthenticated: false,
          accessToken: null,
          refreshTokenValue: null,
          user: null,
        });
        setAuthToken(null);
        // 쿠키에서 토큰 삭제
        deleteAccessTokenCookie();
      },

      refreshToken: async () => {
        const { refreshTokenValue: currentRefreshToken } = get();
        if (!currentRefreshToken) {
          throw new Error('Refresh token이 없습니다.');
        }

        try {
          const response = await apiPostByPath<LoginResponse>(
            API_PATHS.AUTH.REFRESH,
            OPERATION_IDS.LOGIN_REFRESH,
            {
              request: {
                refresh_token: currentRefreshToken,
              },
            }
          );

          if (response.responseData) {
            const { access_token, refresh_token, expires_in } = response.responseData;
            
            set({
              accessToken: access_token,
              refreshTokenValue: refresh_token,
            });

            setAuthToken(access_token);
            // 쿠키에 토큰 업데이트
            setAccessTokenCookie(access_token, expires_in);
          }
        } catch (error) {
          console.error('Token refresh error:', error);
          get().logout();
          throw error;
        }
      },

      setUser: (user: UserInfo) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshTokenValue: state.refreshTokenValue,
        user: state.user,
      }),
    }
  )
);

/**
 * 인증 Hook
 */
export function useAuth() {
  const router = useRouter();
  const store = useAuthStore();
  
  // store에서 필요한 값들만 개별적으로 추출
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const storeLogout = useAuthStore((state) => state.logout);

  // 쿠키와 localStorage 동기화 체크
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hasCookie = document.cookie.includes('access_token=');
      if (!hasCookie && isAuthenticated) {
        // 쿠키가 없는데 localStorage에는 인증 상태가 있으면 로그아웃 처리
        console.log('Cookie expired or missing, clearing auth state...');
        storeLogout();
      }
    }
  }, [isAuthenticated, storeLogout]); // 의존성 배열에 필요한 값만 추가

  const logout = () => {
    // 로그아웃 페이지로 이동 (로그아웃 페이지에서 실제 로그아웃 처리)
    router.push(ROUTES.LOGOUT);
  };

  return {
    ...store,
    logout,
  };
}
