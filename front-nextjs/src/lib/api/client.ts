/**
 * API Client
 * Handles all HTTP requests to the backend API
 * Based on existing mc-web-console/front/assets/js/common/api/http.js
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { CommonRequest, CommonResponse, ApiError } from '@/types/api';

// Cookie utilities for client-side
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 1) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

const deleteCookie = (name: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
};

// API Base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class ApiClient {
  private client: AxiosInstance;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor(baseURL: string = API_BASE_URL) {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = getCookie('Authorization');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        // Handle 401 - attempt token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // Wait for refresh to complete
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            if (newToken) {
              // Notify all subscribers
              this.refreshSubscribers.forEach((cb) => cb(newToken));
              this.refreshSubscribers = [];

              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed - redirect to login
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle other errors
        return Promise.reject(this.formatError(error));
      }
    );
  }

  private async refreshToken(): Promise<string | null> {
    const refreshToken = getCookie('RefreshToken');
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
        request: { refresh_token: refreshToken },
      });

      const { access_token, refresh_token } = response.data.responseData;

      // Update cookies
      setCookie('Authorization', access_token, 1);
      setCookie('RefreshToken', refresh_token, 1);

      return access_token;
    } catch (error) {
      return null;
    }
  }

  private handleAuthFailure() {
    deleteCookie('Authorization');
    deleteCookie('RefreshToken');

    if (typeof window !== 'undefined') {
      window.location.href = '/auth/login';
    }
  }

  private formatError(error: AxiosError): ApiError {
    if (error.response) {
      const data = error.response.data as CommonResponse<unknown>;
      return {
        statusCode: error.response.status,
        message: data?.status?.message || error.message,
        details: JSON.stringify(data),
      };
    }

    return {
      statusCode: 500,
      message: error.message || 'Network error',
    };
  }

  /**
   * Make a POST request to the dynamic API proxy
   * @param subsystem - The subsystem name (e.g., 'mc-infra-manager', 'mc-iam-manager')
   * @param operation - The operation ID (e.g., 'GetAllMci', 'GetRoleList')
   * @param request - The request payload
   */
  async post<T>(
    subsystem: string,
    operation: string,
    request?: CommonRequest
  ): Promise<CommonResponse<T>> {
    const response = await this.client.post<CommonResponse<T>>(
      `/${subsystem}/${operation}`,
      request || {}
    );
    return response.data;
  }

  /**
   * Make a direct POST request to a specific endpoint
   */
  async postDirect<T>(
    endpoint: string,
    data?: unknown
  ): Promise<CommonResponse<T>> {
    const response = await this.client.post<CommonResponse<T>>(endpoint, data);
    return response.data;
  }

  /**
   * Make a GET request
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<CommonResponse<T>> {
    const response = await this.client.get<CommonResponse<T>>(endpoint, { params });
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export { ApiClient };
