/**
 * 에러 코드 정의
 */
export const ERROR_CODES = {
  // 인증 에러
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // API 에러
  API_ERROR: 'API_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  
  // 유효성 검사 에러
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // 비즈니스 로직 에러
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  OPERATION_FAILED: 'OPERATION_FAILED',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

/**
 * 에러 메시지 매핑 (사용자 친화적 메시지)
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.UNAUTHORIZED]: '로그인이 필요합니다. 다시 로그인해주세요.',
  [ERROR_CODES.FORBIDDEN]: '이 작업을 수행할 권한이 없습니다. 관리자에게 문의해주세요.',
  [ERROR_CODES.TOKEN_EXPIRED]: '세션이 만료되었습니다. 다시 로그인해주세요.',
  [ERROR_CODES.API_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ERROR_CODES.NETWORK_ERROR]: '네트워크 연결을 확인할 수 없습니다. 인터넷 연결을 확인해주세요.',
  [ERROR_CODES.TIMEOUT]: '요청 시간이 초과되었습니다. 네트워크 상태를 확인하고 다시 시도해주세요.',
  [ERROR_CODES.VALIDATION_ERROR]: '입력한 정보를 확인해주세요.',
  [ERROR_CODES.REQUIRED_FIELD]: '필수 항목을 입력해주세요.',
  [ERROR_CODES.INVALID_FORMAT]: '입력 형식이 올바르지 않습니다. 다시 확인해주세요.',
  [ERROR_CODES.RESOURCE_NOT_FOUND]: '요청한 정보를 찾을 수 없습니다.',
  [ERROR_CODES.RESOURCE_ALREADY_EXISTS]: '이미 존재하는 항목입니다.',
  [ERROR_CODES.OPERATION_FAILED]: '작업을 완료할 수 없습니다. 다시 시도해주세요.',
};
