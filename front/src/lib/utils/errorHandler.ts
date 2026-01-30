import { AppError, parseApiError } from '@/types/error';
import { ERROR_CODES, ERROR_MESSAGES, ErrorCode } from '@/constants/errors';
import { toast } from 'sonner';

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
  
  // 안전한 에러 데이터 추출
  const errorData: Record<string, unknown> = {
    code: error.code,
    message: error.message,
  };
  
  if (error.statusCode !== undefined) {
    errorData.statusCode = error.statusCode;
  }
  
  if (error.details !== undefined) {
    // details가 순환 참조를 포함할 수 있으므로 안전하게 처리
    try {
      errorData.details = JSON.parse(JSON.stringify(error.details));
    } catch {
      errorData.details = String(error.details);
    }
  }
  
  const logData: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    error: errorData,
  };
  
  if (operationId) {
    logData.operationId = operationId;
  }
  
  if (context) {
    // context도 안전하게 처리
    try {
      logData.context = JSON.parse(JSON.stringify(context));
    } catch {
      logData.context = String(context);
    }
  }

  if (process.env.NODE_ENV === 'development') {
    const logMethod = level === 'warn' ? console.warn : console.error;
    
    // 객체를 직접 전달하여 브라우저 콘솔에서 더 잘 보이도록 함
    logMethod('[ErrorHandler]', logData);
    
    // 원본 에러도 출력
    if (error.originalError) {
      if (error.originalError instanceof Error) {
        logMethod('[Original Error]', {
          name: error.originalError.name,
          message: error.originalError.message,
          stack: error.originalError.stack,
        });
      } else {
        // 순환 참조 방지를 위해 안전하게 처리
        try {
          const serialized = JSON.parse(JSON.stringify(error.originalError));
          logMethod('[Original Error]', serialized);
        } catch {
          logMethod('[Original Error]', String(error.originalError));
        }
      }
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
  // HTTP 상태 코드를 에러 코드로 매핑
  const errorCode: ErrorCode = mapHttpStatusToErrorCode(response.status);
  
  // 에러 메시지 추출
  const message: string = extractErrorMessage({
    status: response.status,
    data: response.data,
  });

  // originalError에 config 정보 포함
  const originalError: Record<string, unknown> = {
    url: response.config?.url,
    method: response.config?.method,
    status: response.status,
    data: response.data ?? null,
  };

  const error = new AppError(
    errorCode,
    message,
    response.status, // statusCode
    response.data ?? null, // details
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
      Boolean(error.statusCode && error.statusCode >= 500)
    );
  }
  
  const apiError = parseApiError(error);
  return (
    apiError.code === ERROR_CODES.NETWORK_ERROR ||
    apiError.code === ERROR_CODES.TIMEOUT ||
    (apiError.status >= 500 && apiError.status < 600)
  );
}
