import { ERROR_CODES, ErrorCode } from '@/constants/errors';
import { ApiResponse } from '@/types/common';
import axios from 'axios';

/**
 * 애플리케이션 에러 타입
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public statusCode?: number,
    public details?: unknown,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // Error의 stack trace 유지
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * API 에러 타입
 */
export interface ApiError {
  status: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
  originalError?: unknown;
}

/**
 * HTTP 상태 코드를 에러 코드로 매핑
 */
function mapHttpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.RESOURCE_NOT_FOUND;
    case 400:
      return ERROR_CODES.VALIDATION_ERROR;
    case 409:
      return ERROR_CODES.RESOURCE_ALREADY_EXISTS;
    case 408:
    case 504:
      return ERROR_CODES.TIMEOUT;
    case 500:
    case 502:
    case 503:
      return ERROR_CODES.API_ERROR;
    default:
      return ERROR_CODES.API_ERROR;
  }
}

/**
 * API 응답에서 에러 메시지 추출
 */
function extractErrorMessage(response: {
  data?: unknown;
  status: number;
}): string {
  // CommonResponse 구조 확인
  if (response.data && typeof response.data === 'object') {
    const data = response.data as Record<string, unknown>;
    
    // status.message가 있는 경우 (CommonResponse 구조)
    if (data.status && typeof data.status === 'object') {
      const status = data.status as Record<string, unknown>;
      if (status.message && typeof status.message === 'string') {
        return status.message;
      }
    }
    
    // 직접 message 필드가 있는 경우
    if (data.message && typeof data.message === 'string') {
      return data.message;
    }
    
    // error 필드가 있는 경우
    if (data.error && typeof data.error === 'string') {
      return data.error;
    }
  }
  
  // 기본 HTTP 상태 메시지
  return `요청이 실패했습니다. (${response.status})`;
}

/**
 * 에러 응답 파싱 (개선된 버전)
 */
export function parseApiError(error: unknown): ApiError {
  // AppError인 경우 그대로 반환
  if (error instanceof AppError) {
    return {
      status: error.statusCode || 500,
      code: error.code,
      message: error.message,
      details: error.details,
      originalError: error.originalError,
    };
  }

  // Axios 에러인 경우
  if (axios.isAxiosError(error)) {
    // 네트워크 에러 (요청이 전송되지 않음)
    if (!error.response) {
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return {
          status: 0,
          code: ERROR_CODES.TIMEOUT,
          message: '요청 시간이 초과되었습니다. 네트워크 연결을 확인해주세요.',
          originalError: error,
        };
      }
      
      return {
        status: 0,
        code: ERROR_CODES.NETWORK_ERROR,
        message: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
        originalError: error,
      };
    }

    // HTTP 응답 에러
    const status = error.response.status;
    const errorCode = mapHttpStatusToErrorCode(status);
    const message = extractErrorMessage(error.response);

    return {
      status,
      code: errorCode,
      message,
      details: error.response.data,
      originalError: error,
    };
  }

  // 일반 Error 객체인 경우
  if (error instanceof Error) {
    return {
      status: 500,
      code: ERROR_CODES.API_ERROR,
      message: error.message || '알 수 없는 오류가 발생했습니다.',
      originalError: error,
    };
  }

  // 알 수 없는 에러
  return {
    status: 500,
    code: ERROR_CODES.API_ERROR,
    message: '알 수 없는 오류가 발생했습니다.',
    originalError: error,
  };
}
