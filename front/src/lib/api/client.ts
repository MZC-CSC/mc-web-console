import axios, { AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '@/constants/api';
import { ApiRequest, ApiResponse } from '@/types/common';
import { handleApiError } from '@/lib/utils/errorHandler';
import { API_PATHS, OPERATION_IDS } from '@/constants/api';
import type { OperationId } from '@/constants/api';
import { LoginResponse } from '@/types/auth';
import { setAccessTokenCookie } from '@/lib/utils/cookies';
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
 * 토큰 갱신 중 플래그 (중복 갱신 방지)
 */
let isRefreshing = false;

/**
 * 갱신 대기 중인 요청들
 */
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

/**
 * 대기 중인 요청 처리
 */
function processQueue(error: Error | null, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
}

/**
 * 응답 데이터에서 토큰 만료 에러인지 확인
 * Check if response data indicates token expiration error
 */
function isTokenExpiredResponse(data: any): boolean {
  if (!data) {
    return false;
  }

  // 문자열로 변환하여 검색
  const dataStr = typeof data === 'string' 
    ? data.toLowerCase() 
    : JSON.stringify(data).toLowerCase();

  // 토큰 만료 관련 키워드 확인
  const expiredKeywords = [
    'token expired',
    'token is expired',
    'expired',
    'unauthorized',
    'invalid token',
    'token invalid',
    'authentication failed',
    'authentication error',
  ];

  return expiredKeywords.some(keyword => dataStr.includes(keyword));
}

/**
 * 토큰 갱신 함수 (클라이언트 사이드에서만 동작)
 */
async function refreshAccessToken(): Promise<string | null> {
  // 클라이언트 사이드가 아니면 null 반환
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    console.log('[Token Refresh] Starting token refresh process...');
    
    // Zustand store 가져오기 (순환 참조 방지를 위해 동적 import)
    const { useAuthStore } = await import('@/hooks/useAuth');
    const storeState = useAuthStore.getState();
    let refreshToken = storeState.refreshTokenValue;

    console.log('[Token Refresh] Store state:', {
      hasRefreshToken: !!refreshToken,
      isAuthenticated: storeState.isAuthenticated,
      hasAccessToken: !!storeState.accessToken,
    });

    // store에 refresh token이 없으면 localStorage에서 확인 및 동기화
    if (!refreshToken) {
      console.warn('[Token Refresh] Refresh token not found in store, checking localStorage...');
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);

          // localStorage 구조 상세 로깅
          console.log('[Token Refresh] localStorage structure:', {
            raw: authStorage.substring(0, 200) + '...',
            parsed: authData,
            hasStateProperty: !!authData?.state,
            stateKeys: Object.keys(authData?.state || {}),
            refreshTokenFromState: authData?.state?.refreshTokenValue?.substring(0, 20) + '...',
            refreshTokenDirect: authData?.refreshTokenValue?.substring(0, 20) + '...',
          });

          // Zustand persist는 항상 { state: {...}, version: 0 } 구조를 사용
          // fallback 로직 제거하고 명시적으로 state에서만 추출
          const storedRefreshToken = authData?.state?.refreshTokenValue;

          if (storedRefreshToken && typeof storedRefreshToken === 'string') {
            // JWT 형식 사전 검증
            const parts = storedRefreshToken.split('.');
            if (parts.length === 3) {
              console.warn('[Token Refresh] Valid refresh token found in localStorage, syncing to store...');
              useAuthStore.setState({ refreshTokenValue: storedRefreshToken });
              refreshToken = storedRefreshToken;
            } else {
              console.error('[Token Refresh] Invalid refresh token format in localStorage:', {
                segments: parts.length,
                tokenPreview: storedRefreshToken.substring(0, 100),
                hasWhitespace: /\s/.test(storedRefreshToken),
                hasBearerPrefix: storedRefreshToken.startsWith('Bearer '),
              });
              // localStorage 손상 - 클리어
              localStorage.removeItem('auth-storage');
              throw new Error('localStorage에 저장된 refresh token 형식이 올바르지 않습니다. 다시 로그인해주세요.');
            }
          } else {
            console.error('[Token Refresh] No valid refresh token in localStorage state:', {
              hasState: !!authData?.state,
              stateKeys: Object.keys(authData?.state || {}),
              refreshTokenType: typeof storedRefreshToken,
              refreshTokenValue: storedRefreshToken,
            });
          }
        } catch (parseError) {
          console.error('[Token Refresh] Failed to parse auth storage:', parseError);
          // 손상된 localStorage 클리어
          localStorage.removeItem('auth-storage');
        }
      } else {
        console.error('[Token Refresh] No auth-storage found in localStorage');
      }

      if (!refreshToken) {
        console.error('[Token Refresh] Refresh token not found in both store and localStorage');
        throw new Error('Refresh token이 없습니다. 다시 로그인해주세요.');
      }
    }

    // Refresh token 유효성 검사
    if (!refreshToken || typeof refreshToken !== 'string' || refreshToken.trim() === '') {
      console.error('[Token Refresh] Invalid refresh token:', {
        type: typeof refreshToken,
        length: refreshToken?.length,
        value: refreshToken?.substring(0, 50) + '...',
      });
      throw new Error('Refresh token이 유효하지 않습니다.');
    }

    // JWT 형식 검사 (3개의 세그먼트로 구성되어야 함)
    const tokenParts = refreshToken.split('.');
    if (tokenParts.length !== 3) {
      console.error('[Token Refresh] Invalid JWT format:', {
        segments: tokenParts.length,
        tokenPreview: refreshToken.substring(0, 100),
      });
      throw new Error(`Refresh token 형식이 올바르지 않습니다. (세그먼트 수: ${tokenParts.length})`);
    }

    // 토큰 검증 상세 로깅
    console.log('[Token Refresh] Token validation details:', {
      tokenLength: refreshToken.length,
      segments: tokenParts.length,
      firstSegmentLength: tokenParts[0]?.length,
      secondSegmentLength: tokenParts[1]?.length,
      thirdSegmentLength: tokenParts[2]?.length,
      hasWhitespace: /\s/.test(refreshToken),
      hasBearerPrefix: refreshToken.startsWith('Bearer '),
      tokenStart: refreshToken.substring(0, 30) + '...',
      tokenEnd: '...' + refreshToken.substring(refreshToken.length - 30),
    });

    console.log('[Token Refresh] Refresh token validated, calling refresh API...', {
      tokenLength: refreshToken.length,
      tokenPreview: refreshToken.substring(0, 50) + '...',
      apiPath: API_PATHS.AUTH.REFRESH,
      operationId: OPERATION_IDS.LOGIN_REFRESH,
    });

    // 토큰 갱신 API 호출 (인터셉터를 우회하기 위해 새로운 axios 인스턴스 사용)
    const refreshClient = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const requestBody = {
      operationId: OPERATION_IDS.LOGIN_REFRESH,
      request: {
        refresh_token: refreshToken,
      },
    };

    // Request body 상세 로깅
    console.log('[Token Refresh] Request body to be sent:', {
      operationId: requestBody.operationId,
      refreshTokenLength: requestBody.request.refresh_token?.length,
      refreshTokenSegments: requestBody.request.refresh_token?.split('.').length,
      refreshTokenPreview: requestBody.request.refresh_token?.substring(0, 50) + '...',
    });

    console.log('[Token Refresh] Sending refresh request:', {
      url: API_PATHS.AUTH.REFRESH,
      hasRefreshToken: !!requestBody.request.refresh_token,
      refreshTokenLength: requestBody.request.refresh_token?.length,
    });

    const response = await refreshClient.post<ApiResponse<LoginResponse>>(
      API_PATHS.AUTH.REFRESH,
      requestBody
    );

    console.log('[Token Refresh] Refresh API response received:', {
      status: response.status,
      hasResponseData: !!response.data.responseData,
    });

    if (response.data.responseData) {
      const { access_token, refresh_token, expires_in } = response.data.responseData;

      console.log('[Token Refresh] Updating tokens:', {
        hasAccessToken: !!access_token,
        hasRefreshToken: !!refresh_token,
        expiresIn: expires_in,
      });

      // Zustand store 업데이트 (persist 미들웨어가 자동으로 localStorage에 저장)
      useAuthStore.setState({
        accessToken: access_token,
        refreshTokenValue: refresh_token,
      });

      // Axios 헤더 업데이트
      setAuthToken(access_token);

      // 쿠키 업데이트
      setAccessTokenCookie(access_token, expires_in);

      console.log('[Token Refresh] Token refresh completed successfully');
      return access_token;
    }

    console.error('[Token Refresh] Refresh response missing responseData:', response.data);
    throw new Error('토큰 갱신 응답에 토큰이 없습니다.');
  } catch (error) {
    console.error('[Token Refresh] Token refresh failed:', {
      error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      // 추가: 에러 응답 상세 정보
      response: axios.isAxiosError(error) ? {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      } : undefined,
    });

    // 토큰 갱신 실패 시 로그아웃 처리
    if (typeof window !== 'undefined') {
      try {
        console.log('[Token Refresh] Attempting logout via store...');
        // Zustand store의 logout 메서드 사용 (모든 정리 작업 수행)
        const { useAuthStore } = await import('@/hooks/useAuth');
        useAuthStore.getState().logout();
        console.log('[Token Refresh] Logout completed');

        // 로그인 페이지로 리디렉션 (세션 만료 메시지 포함)
        const currentPath = window.location.pathname;
        const reason = error instanceof Error && error.message.includes('형식')
          ? 'token_invalid'
          : 'token_refresh_failed';
        window.location.href = `/login?expired=true&reason=${reason}&redirect=${encodeURIComponent(currentPath)}`;
      } catch (logoutError) {
        // store 접근 실패 시 수동으로 정리
        console.error('[Token Refresh] Failed to logout via store, cleaning up manually:', logoutError);
        localStorage.removeItem('auth-storage');
        const { deleteAccessTokenCookie } = await import('@/lib/utils/cookies');
        deleteAccessTokenCookie();
        setAuthToken(null);

        // 로그인 페이지로 리디렉션
        window.location.href = '/login?expired=true&reason=token_refresh_failed';
      }
    }

    throw error;
  }
}

/**
 * API 요청 인터셉터
 */
apiClient.interceptors.request.use(
  (config) => {
    // 요청 전 처리 (로깅 등)
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        data: config.data,
      });
    }

    // 클라이언트 사이드에서 localStorage에서 토큰 가져와서 헤더에 설정
    if (typeof window !== 'undefined') {
      const authStorage = localStorage.getItem('auth-storage');
      if (authStorage) {
        try {
          const authData = JSON.parse(authStorage);
          const token = authData?.state?.accessToken;
          if (token && !config.headers['Authorization']) {
            config.headers['Authorization'] = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to parse auth storage:', error);
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
    return response;
  },
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러 또는 400 에러 중 토큰 만료 관련 에러인 경우 토큰 갱신 시도
    const status = error.response?.status;
    const isTokenExpiredError = status === 401 || 
      (status === 400 && isTokenExpiredResponse(error.response?.data));

    if (isTokenExpiredError && !originalRequest._retry) {
      console.log('[API Interceptor] Token expired error detected:', {
        status: status,
        url: originalRequest.url,
        isRefreshing,
        isRefreshRequest: originalRequest.url?.includes(API_PATHS.AUTH.REFRESH),
        responseData: error.response?.data,
      });

      // 토큰 갱신 요청 자체가 토큰 만료 에러면 갱신하지 않음 (무한 루프 방지)
      if (originalRequest.url?.includes(API_PATHS.AUTH.REFRESH)) {
        console.error('[API Interceptor] Refresh token request returned token expired error, rejecting...');
        return Promise.reject(error);
      }

      // 이미 갱신 중이면 대기
      if (isRefreshing) {
        console.log('[API Interceptor] Token refresh already in progress, queuing request...');
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            console.log('[API Interceptor] Queued request retrying with new token...');
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            console.error('[API Interceptor] Queued request failed:', err);
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log('[API Interceptor] Starting token refresh...');

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          console.log('[API Interceptor] Token refresh successful, retrying original request...');
          // 대기 중인 요청들 처리
          processQueue(null, newToken);

          // 원래 요청 재시도
          if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          }
          return apiClient(originalRequest);
        } else {
          console.error('[API Interceptor] Token refresh returned null');
          throw new Error('토큰 갱신에 실패했습니다.');
        }
      } catch (refreshError) {
        console.error('[API Interceptor] Token refresh failed:', refreshError);
        // 토큰 갱신 실패 시 대기 중인 요청들 모두 실패 처리
        processQueue(refreshError as Error);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
        console.log('[API Interceptor] Token refresh process completed');
      }
    }

    return Promise.reject(error);
  }
);

/**
 * operationId를 기반으로 subsystemName 결정
 */
function getSubsystemName(operationId: string): string {
  // mc-iam-manager: WORKSPACE, USER, ROLE, PROJECT
  const mcIamManagerOperations: OperationId[] = [
    OPERATION_IDS.GET_WORKSPACE_LIST,
    OPERATION_IDS.LIST_WORKSPACES, // 관리 화면용: 전체 워크스페이스 목록 조회
    OPERATION_IDS.GET_WORKSPACE_LIST_BY_USER_ID,
    OPERATION_IDS.GET_WORKSPACE,
    OPERATION_IDS.CREATE_WORKSPACE,
    OPERATION_IDS.UPDATE_WORKSPACE,
    OPERATION_IDS.DELETE_WORKSPACE,
    OPERATION_IDS.GET_USER_LIST,
    OPERATION_IDS.GET_USER,
    OPERATION_IDS.CREATE_USER,
    OPERATION_IDS.UPDATE_USER,
    OPERATION_IDS.DELETE_USER,
    OPERATION_IDS.GET_ROLE_LIST,
    OPERATION_IDS.GET_ROLE,
    OPERATION_IDS.CREATE_ROLE,
    OPERATION_IDS.UPDATE_ROLE,
    OPERATION_IDS.DELETE_ROLE,
    OPERATION_IDS.GET_WORKSPACE_PROJECTS,
    OPERATION_IDS.GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID,
    OPERATION_IDS.GET_MENU_LIST,
    OPERATION_IDS.CREATE_MENU,
    OPERATION_IDS.GET_MENU_BY_ID,
    OPERATION_IDS.UPDATE_MENU,
    OPERATION_IDS.DELETE_MENU,
  ];
  
  // mc-infra-manager: Resources
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
  
  if (mcIamManagerOperations.includes(operationId as OperationId)) {
    return 'mc-iam-manager';
  }
  
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
export async function apiPost<T = unknown>(
  operationId: string,
  data?: ApiRequest,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
  const subsystemName = getSubsystemName(operationId);
  // subsystemName이 있으면 /api/{subsystemName}/{operationId}, 없으면 /api/{operationId}
  const path = subsystemName 
    ? `/api/${subsystemName}/${operationId}`
    : `/api/${operationId}`;
  
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
