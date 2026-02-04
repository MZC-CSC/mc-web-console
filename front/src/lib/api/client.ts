import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { ApiRequest, ApiResponse } from '@/types/common';
import { handleApiError } from '@/lib/utils/errorHandler';
import { API_PATHS, OPERATION_IDS, OPERATION_ID_TO_SUBSYSTEM } from '@/constants/api';
import type { OperationId } from '@/constants/api';
import { LoginResponse } from '@/types/auth';
import { 
  setAccessTokenCookie,
  setRefreshTokenCookie,
  isTokenExpired,
  isTokenExpiringSoon,
} from '@/lib/utils/cookies';
import { parseApiError, AppError } from '@/types/error';

/**
 * API 클라이언트 인스턴스
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 인증 토큰 설정
 */
export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

/**
 * Refresh Token 갱신 중인지 추적하는 플래그
 * 여러 요청이 동시에 refresh를 호출하지 않도록 방지
 */
let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

/**
 * Access Token을 가져오는 헬퍼 함수
 */
function getAccessTokenFromStorage(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const authStorage = localStorage.getItem('auth-storage');
  if (!authStorage) {
    return null;
  }

  try {
    const authData = JSON.parse(authStorage);
    return authData?.state?.accessToken || null;
  } catch (error) {
    console.error('[Token] Failed to parse auth storage:', error);
    return null;
  }
}

/**
 * Refresh Token을 사용하여 Access Token 갱신
 */
async function refreshAccessToken(): Promise<void> {
  // 이미 refresh 중이면 기존 Promise 반환
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const { useAuthStore } = await import('@/hooks/useAuth');
      const store = useAuthStore.getState();
      
      if (!store.refreshTokenValue) {
        throw new Error('Refresh token이 없습니다.');
      }

      console.log('[Token Refresh] Refreshing access token...');
      
      await store.refreshToken();
      
      console.log('[Token Refresh] ✅ Access token refreshed successfully');
    } catch (error) {
      console.error('[Token Refresh] ❌ Failed to refresh token:', error);
      
      // 에러 메시지 추출
      const errorMessage = error instanceof Error 
        ? error.message 
        : '토큰 갱신에 실패했습니다. 다시 로그인해주세요.';
      
      console.error('[Token Refresh] Error details:', {
        message: errorMessage,
        error,
      });
      
      // Refresh 실패 시 로그아웃
      const { useAuthStore } = await import('@/hooks/useAuth');
      useAuthStore.getState().logout();
      
      // 로그인 페이지로 리다이렉트 (사용자에게 명확한 안내)
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        window.location.href = `/login?expired=true&reason=refresh_failed&message=${encodeURIComponent(errorMessage)}&redirect=${encodeURIComponent(currentPath)}`;
      }
      
      throw error;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * API 요청 인터셉터
 * Access token 만료 감지 및 자동 refresh 로직 포함
 */
apiClient.interceptors.request.use(
  async (config) => {
    // 요청 전 처리 (로깅 등)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
      });
    }

    // Refresh API 호출 시에는 토큰 갱신 로직을 건너뜀 (무한 루프 방지)
    const isRefreshRequest = config.url?.includes('/auth/refresh') || 
                            (config.data && typeof config.data === 'object' && 
                             (config.data.operationId === 'Webloginrefresh' || 
                              config.data.operationId === OPERATION_IDS.LOGIN_REFRESH));
    
    if (isRefreshRequest) {
      // Refresh API 호출 시에는 refresh token을 사용하므로 access token 검사를 건너뜀
      console.log('[Token] Refresh API request detected, skipping token refresh check');
      return config;
    }

    // 클라이언트 사이드에서 토큰 확인 및 만료 감지
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          const token = authData?.state?.accessToken;
          
          if (token) {
            // Access token 만료 확인
            if (isTokenExpired(token) || isTokenExpiringSoon(token, 60)) {
              console.log('[Token] Access token expired or expiring soon, refreshing...');
              
              try {
                // Refresh 호출 (동시 호출 방지 메커니즘 포함)
                await refreshAccessToken();
                
                // Refresh 후 새 토큰으로 헤더 업데이트
                const newAuthStorage = localStorage.getItem('auth-storage');
                if (newAuthStorage) {
                  const newAuthData = JSON.parse(newAuthStorage);
                  const newToken = newAuthData?.state?.accessToken;
                  if (newToken) {
                    config.headers['Authorization'] = `Bearer ${newToken}`;
                    console.log('[Token] ✅ Token refreshed, request will proceed with new token');
                  }
                }
              } catch (refreshError) {
                console.error('[Token] ❌ Failed to refresh token:', refreshError);
                // Refresh 실패 시 요청을 중단하지 않고 진행
                // (에러 응답 인터셉터에서 처리)
              }
            } else {
              // 토큰이 유효하면 헤더에 설정
              if (!config.headers['Authorization']) {
                config.headers['Authorization'] = `Bearer ${token}`;
              }
            }
          }
        } catch (error) {
          console.error('[Token] Failed to parse auth storage:', error);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * API 응답 인터셉터
 * Backend Middleware가 자동으로 token을 갱신하므로
 * Frontend는 401 에러 시 단순히 한 번 더 재시도만 합니다.
 */
apiClient.interceptors.response.use(
  (response) => {
    // 응답 성공 처리
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
    }

    // Backend Middleware가 token을 갱신한 경우 response header에 새 token이 포함됨
    const newAccessToken = response.headers['x-new-access-token'];
    const newRefreshToken = response.headers['x-new-refresh-token'];

    // 디버깅: 모든 응답에서 헤더 확인
    console.log('[Response Headers Debug]', {
      url: response.config.url,
      status: response.status,
      hasNewAccessToken: !!newAccessToken,
      allHeaders: response.headers,
    });

    if (newAccessToken && typeof window !== 'undefined') {
      console.log('[Token Update] Backend refreshed token, updating local storage and cookies...', {
        newAccessToken: newAccessToken.substring(0, 20) + '...',
        hasNewRefreshToken: !!newRefreshToken,
      });

      // localStorage 업데이트
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          authData.state.accessToken = newAccessToken;
          if (newRefreshToken) {
            authData.state.refreshTokenValue = newRefreshToken;
          }
          localStorage.setItem('auth-storage', JSON.stringify(authData));
          console.log('[Token Update] localStorage updated');
        } catch (error) {
          console.error('[Token Update] Failed to update localStorage:', error);
        }
      }

      // Cookie 업데이트
      import('@/lib/utils/cookies').then(({ setAccessTokenCookie, setRefreshTokenCookie }) => {
        // expires_in은 기본값 사용 (300초)
        setAccessTokenCookie(newAccessToken, 300);
        console.log('[Token Update] Access token cookie updated');
        
        // Refresh token도 업데이트 (있는 경우)
        if (newRefreshToken) {
          // refresh_expires_in은 기본값 사용 (1800초 = 30분)
          setRefreshTokenCookie(newRefreshToken, 1800);
          console.log('[Token Update] Refresh token cookie updated');
        }
      }).catch(error => {
        console.error('[Token Update] Failed to update cookie:', error);
      });

      // Axios 헤더 업데이트
      setAuthToken(newAccessToken);
      console.log('[Token Update] Axios header updated');
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;

    // 401 에러이고 아직 재시도하지 않았으면
    if (status === 401 && !originalRequest._retry) {
      console.log('[API Interceptor] 401 error detected', {
        url: originalRequest.url,
      });
      console.log('[API Interceptor] Retrying - Backend middleware will auto-refresh if refresh token is valid');

      // 재시도 플래그 설정 (무한 루프 방지)
      originalRequest._retry = true;

      // Backend Middleware가 자동으로 token을 갱신하므로
      // 동일한 요청을 그대로 재시도
      // Middleware가 만료된 token을 감지하고 자동으로 갱신 후 처리합니다
      try {
        const retryResponse = await apiClient(originalRequest);
        console.log('[API Interceptor] ✅ Retry successful - Backend handled token refresh');
        return retryResponse;
      } catch (retryError) {
        console.error('[API Interceptor] ❌ Retry failed - Refresh token likely expired');

        // 재시도도 실패하면 로그아웃 및 로그인 페이지로 리다이렉트
        if (typeof window !== 'undefined') {
          const { useAuthStore } = await import('@/hooks/useAuth');
          useAuthStore.getState().logout();

          const currentPath = window.location.pathname;
          // 사용자에게 명확한 안내를 위한 파라미터
          window.location.href = `/login?expired=true&reason=refresh_token_expired&redirect=${encodeURIComponent(currentPath)}`;
        }

        return Promise.reject(retryError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * operationId를 기반으로 subsystemName 결정
 * OPERATION_ID_TO_SUBSYSTEM 매핑을 사용하여 자동으로 결정
 */
function getSubsystemName(operationId: string): string {
  // OPERATION_ID_TO_SUBSYSTEM에서 찾기
  const subsystem = OPERATION_ID_TO_SUBSYSTEM[operationId];

  if (subsystem) {
    return subsystem;
  }

  // Legacy operations (mc-infra-manager) - OPERATION_ID_TO_SUBSYSTEM에 없는 경우
  const mcInfraManagerOperations: OperationId[] = [
    OPERATION_IDS.GET_SPEC_LIST,
    OPERATION_IDS.GET_SPEC,
    OPERATION_IDS.CREATE_SPEC,
    OPERATION_IDS.UPDATE_SPEC,
    OPERATION_IDS.DELETE_SPEC,
    OPERATION_IDS.GET_IMAGE_LIST,
    OPERATION_IDS.GET_IMAGE,
    OPERATION_IDS.CREATE_IMAGE,
    OPERATION_IDS.UPDATE_IMAGE,
    OPERATION_IDS.DELETE_IMAGE,
    OPERATION_IDS.GET_MY_IMAGE_LIST,
    OPERATION_IDS.GET_MY_IMAGE,
    OPERATION_IDS.CREATE_MY_IMAGE,
    OPERATION_IDS.DELETE_MY_IMAGE,
    OPERATION_IDS.GET_NETWORK_LIST,
    OPERATION_IDS.GET_NETWORK,
    OPERATION_IDS.CREATE_NETWORK,
    OPERATION_IDS.DELETE_NETWORK,
    OPERATION_IDS.GET_SECURITY_GROUP_LIST,
    OPERATION_IDS.GET_SECURITY_GROUP,
    OPERATION_IDS.CREATE_SECURITY_GROUP,
    OPERATION_IDS.DELETE_SECURITY_GROUP,
    OPERATION_IDS.GET_DISK_LIST,
    OPERATION_IDS.GET_DISK,
    OPERATION_IDS.CREATE_DISK,
    OPERATION_IDS.UPDATE_DISK,
    OPERATION_IDS.DELETE_DISK,
    OPERATION_IDS.GET_SSH_KEY_LIST,
    OPERATION_IDS.GET_SSH_KEY,
    OPERATION_IDS.CREATE_SSH_KEY,
    OPERATION_IDS.UPDATE_SSH_KEY,
    OPERATION_IDS.DELETE_SSH_KEY,
    OPERATION_IDS.GET_RESOURCES_OVERVIEW,
    OPERATION_IDS.GET_CREDENTIAL_LIST,
    OPERATION_IDS.GET_CREDENTIAL,
    OPERATION_IDS.REGISTER_CREDENTIAL,
  ];

  if (mcInfraManagerOperations.includes(operationId as OperationId)) {
    return 'mc-infra-manager';
  }

  // 기본값 (subsystem이 없는 경우)
  return '';
}

/**
 * 공통 API POST 요청 (operationId 사용)
 * operationId를 기반으로 /api/{subsystemName}/{operationId} 형태로 호출
 */
export async function apiPost<T = unknown, R = Record<string, unknown>>(
  operationId: string,
  data?: ApiRequest<R>,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const subsystemName = getSubsystemName(operationId);
  // subsystemName이 있으면 /api/{subsystemName}/{operationId}, 없으면 /api/{operationId}
  const path = subsystemName
    ? `/api/${subsystemName}/${operationId}`
    : `/api/${operationId}`;

  // FormData가 있으면 multipart/form-data로 전송
  if (data?.formData) {
    // FormData에 operationId와 기타 메타데이터 추가
    const formData = data.formData;
    formData.append('operationId', operationId);

    // pathParams를 FormData에 추가 (Buffalo 서버가 처리)
    if (data.pathParams) {
      Object.entries(data.pathParams).forEach(([key, value]) => {
        formData.append(`pathParams[${key}]`, value);
      });
    }

    // queryParams를 FormData에 추가
    if (data.queryParams) {
      Object.entries(data.queryParams).forEach(([key, value]) => {
        formData.append(`queryParams[${key}]`, String(value));
      });
    }

    try {
      const response = await apiClient.post<ApiResponse<T>>(
        path,
        formData,
        {
          ...config,
          headers: {
            ...config?.headers,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    } catch (error) {
      // 에러 처리 (기존과 동일)
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw handleApiError({
            status: error.response.status,
            data: error.response.data,
            config: {
              url: path,
              method: 'POST',
            },
          });
        } else {
          const apiError = parseApiError(error);
          throw new AppError(
            apiError.code,
            apiError.message,
            apiError.status,
            {
              operationId,
              path,
              subsystemName,
            },
            error
          );
        }
      }
      throw error;
    }
  }

  // 일반 JSON 요청
  const requestBody = {
    operationId,
    ...data,
  };

  try {
    const response = await apiClient.post<ApiResponse<T>>(
      path,
      requestBody,
      config
    );

    return response.data;
  } catch (error) {
    // Axios 에러인 경우 개선된 에러 처리
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // HTTP 응답 에러
        throw handleApiError({
          status: error.response.status,
          data: error.response.data,
          config: {
            url: path,
            method: 'POST',
          },
        });
      } else {
        // 네트워크 에러 또는 타임아웃
        const apiError = parseApiError(error);
        throw new AppError(
          apiError.code,
          apiError.message,
          apiError.status,
          {
            operationId,
            path,
            subsystemName,
          },
          error
        );
      }
    }
    
    // 기타 에러는 그대로 throw
    throw error;
  }
}

/**
 * 공통 API PUT 요청 (path 직접 사용)
 * path를 직접 지정하여 호출
 */
export async function apiPutByPath<T = unknown>(
  path: string,
  operationId: string,
  data?: ApiRequest,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const requestBody = {
    operationId,
    ...data,
  };
  
  try {
    const response = await apiClient.put<ApiResponse<T>>(
      path,
      requestBody,
      config
    );

    return response.data;
  } catch (error) {
    // Axios 에러인 경우 개선된 에러 처리
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // HTTP 응답 에러
        throw handleApiError({
          status: error.response.status,
          data: error.response.data,
          config: {
            url: path,
            method: 'PUT',
          },
        });
      } else {
        // 네트워크 에러 또는 타임아웃
        const apiError = parseApiError(error);
        throw new AppError(
          apiError.code,
          apiError.message,
          apiError.status,
          {
            operationId,
            path,
          },
          error
        );
      }
    }
    
    // 기타 에러는 그대로 throw
    throw error;
  }
}

/**
 * 공통 API DELETE 요청 (path 직접 사용)
 * path를 직접 지정하여 호출
 */
export async function apiDeleteByPath<T = unknown>(
  path: string,
  operationId: string,
  data?: ApiRequest,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const requestBody = {
    operationId,
    ...data,
  };
  
  try {
    const response = await apiClient.delete<ApiResponse<T>>(
      path,
      {
        data: requestBody,
        ...config,
      }
    );

    return response.data;
  } catch (error) {
    // Axios 에러인 경우 개선된 에러 처리
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // HTTP 응답 에러
        throw handleApiError({
          status: error.response.status,
          data: error.response.data,
          config: {
            url: path,
            method: 'DELETE',
          },
        });
      } else {
        // 네트워크 에러 또는 타임아웃
        const apiError = parseApiError(error);
        throw new AppError(
          apiError.code,
          apiError.message,
          apiError.status,
          {
            operationId,
            path,
          },
          error
        );
      }
    }
    
    // 기타 에러는 그대로 throw
    throw error;
  }
}

/**
 * 공통 API POST 요청 (path 직접 사용)
 * path를 직접 지정하여 호출 (auth 관련 API 등 제한적 사용)
 */
export async function apiPostByPath<T = unknown>(
  path: string,
  operationId: string,
  data?: ApiRequest,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const requestBody = {
    operationId,
    ...data,
  };
  
  try {
    const response = await apiClient.post<ApiResponse<T>>(
      path,
      requestBody,
      config
    );

    return response.data;
  } catch (error) {
    // Axios 에러인 경우 개선된 에러 처리
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // HTTP 응답 에러
        throw handleApiError({
          status: error.response.status,
          data: error.response.data,
          config: {
            url: path,
            method: 'POST',
          },
        });
      } else {
        // 네트워크 에러 또는 타임아웃
        const apiError = parseApiError(error);
        throw new AppError(
          apiError.code,
          apiError.message,
          apiError.status,
          {
            operationId,
            path,
          },
          error
        );
      }
    }
    
    // 기타 에러는 그대로 throw
    throw error;
  }
}

/**
 * 공통 API GET 요청
 * operationId를 기반으로 /api/{subsystemName}/{operationId} 형태로 호출
 */
export async function apiGet<T = unknown>(
  operationId: string,
  params?: ApiRequest['queryParams'],
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const subsystemName = getSubsystemName(operationId);
  // subsystemName이 있으면 /api/{subsystemName}/{operationId}, 없으면 /api/{operationId}
  const path = subsystemName 
    ? `/api/${subsystemName}/${operationId}`
    : `/api/${operationId}`;
  
  try {
    const response = await apiClient.get<ApiResponse<T>>(path, {
      params: {
        operationId,
        ...params,
      },
      ...config,
    });

    return response.data;
  } catch (error) {
    // Axios 에러인 경우 개선된 에러 처리
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // HTTP 응답 에러
        throw handleApiError({
          status: error.response.status,
          data: error.response.data,
          config: {
            url: path,
            method: 'GET',
          },
        });
      } else {
        // 네트워크 에러 또는 타임아웃
        const apiError = parseApiError(error);
        throw new AppError(
          apiError.code,
          apiError.message,
          apiError.status,
          {
            operationId,
            path,
          },
          error
        );
      }
    }
    
    // 기타 에러는 그대로 throw
    throw error;
  }
}
