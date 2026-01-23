/**
 * 공통 응답 타입
 * 백엔드 CommonResponse 구조와 일치
 */
export interface ApiResponse<T = unknown> {
  responseData?: T;
  status: {
    code: number;
    message: string;
  };
}

/**
 * API 요청 기본 구조
 */
export interface ApiRequest {
  pathParams?: Record<string, string>;
  queryParams?: Record<string, string | number | boolean>;
  request?: Record<string, unknown>;
}

/**
 * 페이지네이션 타입
 */
export interface PaginationParams {
  page: number;
  size: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}
