/**
 * 로그인 요청
 */
export interface LoginRequest {
  id: string;
  password: string;
}

/**
 * 로그인 응답
 */
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
}

/**
 * 사용자 정보
 */
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
}

/**
 * 인증 상태
 */
export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: UserInfo | null;
}
