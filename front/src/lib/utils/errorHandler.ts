import { AppError, parseApiError } from '@/types/error';
import { ERROR_CODES, ERROR_MESSAGES, ErrorCode } from '@/constants/errors';
import { toast } from 'sonner';

/**
 * 에러 로깅 옵션
 */
interface ErrorLogOptions {
  operationId?: string;
  context?: Record<string, unknown>;
  level?: 'error' | 'warn' | 'info';
}

/**
 * 구조화된 에러 로깅
 */
function logError(
  error: AppError,
  options?: ErrorLogOptions
): void {
  const { operationId, context, level = 'error' } = options || {};
  
  const logData = {
    timestamp: new Date().toISOString(),
    error: {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    },
    ...(operationId && { operationId }),
    ...(context && { context }),
  };

  if (process.env.NODE_ENV === 'development') {
    const logMethod = level === 'warn' ? console.warn : console.error;
    logMethod('[ErrorHandler]', logData);
    
    // 원본 에러도 출력
    if (error.originalError) {
      logMethod('[Original Error]', error.originalError);
    }
  }

  // 프로덕션 환경에서는 에러 추적 서비스로 전송 가능
  // 예: Sentry, LogRocket 등
  if (process.env.NODE_ENV === 'production') {
    // TODO: 에러 추적 서비스 연동
    // trackError(error, logData);
  }
}

/**
 * 전역 에러 핸들러 (개선된 버전)
 */
export function handleError(
  error: unknown,
  options?: {
    showToast?: boolean;
    fallbackMessage?: string;
    operationId?: string;
    context?: Record<string, unknown>;
    silent?: boolean; // 에러를 조용히 처리 (로깅만 하고 사용자에게 표시하지 않음)
  }
): AppError {
  const {
    showToast = true,
    fallbackMessage,
    operationId,
    context,
    silent = false,
  } = options || {};

  const apiError = parseApiError(error);
  
  // 사용자 친화적인 메시지 생성
  let userMessage = apiError.message;
  
  // fallbackMessage가 있으면 우선 사용
  if (fallbackMessage) {
    userMessage = fallbackMessage;
  } else {
    // API 응답 메시지가 있으면 사용, 없으면 에러 코드에 맞는 기본 메시지 사용
    if (!apiError.message || 
        apiError.message === '알 수 없는 오류가 발생했습니다.' ||
        apiError.message.includes('API Error:') ||
        apiError.message.includes('요청이 실패했습니다.')) {
      // 기본 메시지가 없거나 일반적인 메시지면 에러 코드에 맞는 메시지 사용
      userMessage = ERROR_MESSAGES[apiError.code] || '오류가 발생했습니다.';
    } else {
      // API에서 받은 구체적인 메시지가 있으면 사용
      userMessage = apiError.message;
    }
  }

  const appError = new AppError(
    apiError.code,
    userMessage,
    apiError.status,
    apiError.details,
    apiError.originalError
  );

  // 에러 로깅
  if (!silent) {
    logError(appError, { operationId, context });
  }

  // Toast 표시
  if (showToast && !silent) {
    toast.error(appError.message, {
      duration: apiError.code === ERROR_CODES.NETWORK_ERROR ? 5000 : 3000,
    });
  }

  return appError;
}

/**
 * API 에러 처리 유틸리티 (개선된 버전)
 */
export function handleApiError(response: {
  status: number;
  data?: unknown;
  config?: {
    url?: string;
    method?: string;
  };
}): never {
  const apiError = parseApiError({
    response: {
      status: response.status,
      data: response.data,
    },
  });

  // originalError에 config 정보 포함
  const originalError = apiError.originalError || {
    url: response.config?.url,
    method: response.config?.method,
  };

  const error = new AppError(
    apiError.code,
    apiError.message,
    apiError.status, // statusCode
    apiError.details,
    originalError
  );

  throw error;
}

/**
 * 네트워크 에러 확인
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === ERROR_CODES.NETWORK_ERROR || error.code === ERROR_CODES.TIMEOUT;
  }
  
  const apiError = parseApiError(error);
  return apiError.code === ERROR_CODES.NETWORK_ERROR || apiError.code === ERROR_CODES.TIMEOUT;
}

/**
 * 인증 에러 확인
 */
export function isAuthError(error: unknown): boolean {
  if (error instanceof AppError) {
    return (
      error.code === ERROR_CODES.UNAUTHORIZED ||
      error.code === ERROR_CODES.FORBIDDEN ||
      error.code === ERROR_CODES.TOKEN_EXPIRED
    );
  }
  
  const apiError = parseApiError(error);
  return (
    apiError.code === ERROR_CODES.UNAUTHORIZED ||
    apiError.code === ERROR_CODES.FORBIDDEN ||
    apiError.code === ERROR_CODES.TOKEN_EXPIRED
  );
}

/**
 * 재시도 가능한 에러인지 확인
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) {
    return (
      error.code === ERROR_CODES.NETWORK_ERROR ||
      error.code === ERROR_CODES.TIMEOUT ||
      (error.statusCode && error.statusCode >= 500)
    );
  }
  
  const apiError = parseApiError(error);
  return (
    apiError.code === ERROR_CODES.NETWORK_ERROR ||
    apiError.code === ERROR_CODES.TIMEOUT ||
    (apiError.status >= 500 && apiError.status < 600)
  );
}
