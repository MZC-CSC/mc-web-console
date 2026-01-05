/**
 * Common API Types
 * Based on existing mc-web-console API patterns
 */

// Common Request structure matching Buffalo API
export interface CommonRequest<T = unknown> {
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string>;
  request?: T;
}

// Common Response structure matching Buffalo API
export interface CommonResponse<T = unknown> {
  responseData: T;
  status: WebStatus;
}

export interface WebStatus {
  statusCode?: number;
  code?: number;
  message: string;
}

// Auth types
export interface LoginRequest {
  id: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  // Keycloak additional fields
  id_token?: string;
  token_type?: string;
  scope?: string;
  session_state?: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// Error types
export interface ApiError {
  statusCode: number;
  message: string;
  details?: string;
}

// API Client options
export interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
}
