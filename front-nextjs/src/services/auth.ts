/**
 * Auth Service
 * Handles authentication-related API calls
 */

import { apiClient } from '@/lib/api';
import { LoginRequest, LoginResponse, UserInfo, CommonResponse } from '@/types';

export const authService = {
  /**
   * Login with credentials
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.postDirect<LoginResponse>('/auth/login', {
      request: credentials,
    });
    return response.responseData;
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.postDirect<LoginResponse>('/auth/refresh', {
      request: { refresh_token: refreshToken },
    });
    return response.responseData;
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    await apiClient.postDirect('/auth/logout', {});
  },

  /**
   * Get current user info
   */
  async getUserInfo(): Promise<UserInfo> {
    const response = await apiClient.get<UserInfo>('/auth/userinfo');
    return response.responseData;
  },

  /**
   * Get available menus for current user
   */
  async getMenus(): Promise<CommonResponse<unknown>> {
    return await apiClient.post('mc-iam-manager', 'GetAllAvailableMenus', {});
  },
};
