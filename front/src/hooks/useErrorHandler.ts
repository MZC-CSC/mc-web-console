'use client';

import { useCallback } from 'react';
import { handleError, isAuthError, isNetworkError, isRetryableError } from '@/lib/utils/errorHandler';
import { AppError } from '@/types/error';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

/**
 * React Query에서 사용할 에러 처리 Hook
 */
export function useErrorHandler() {
  const router = useRouter();

  /**
   * 에러 처리 함수
   */
  const handleQueryError = useCallback(
    (
      error: unknown,
      options?: {
        operationId?: string;
        context?: Record<string, unknown>;
        showToast?: boolean;
        fallbackMessage?: string;
        silent?: boolean;
        onAuthError?: () => void;
        onNetworkError?: () => void;
      }
    ) => {
      const {
        operationId,
        context,
        showToast = true,
        fallbackMessage,
        silent = false,
        onAuthError,
        onNetworkError,
      } = options || {};

      const appError = handleError(error, {
        showToast,
        fallbackMessage,
        operationId,
        context,
        silent,
      });

      // 인증 에러 처리
      if (isAuthError(appError)) {
        if (onAuthError) {
          onAuthError();
        } else {
          // 기본 동작: 로그인 페이지로 리다이렉트
          router.push(ROUTES.LOGIN);
        }
        return appError;
      }

      // 네트워크 에러 처리
      if (isNetworkError(appError)) {
        if (onNetworkError) {
          onNetworkError();
        }
        return appError;
      }

      return appError;
    },
    [router]
  );

  /**
   * Mutation 에러 처리 (onError에서 사용)
   */
  const handleMutationError = useCallback(
    (
      error: unknown,
      options?: {
        operationId?: string;
        context?: Record<string, unknown>;
        fallbackMessage?: string;
      }
    ) => {
      return handleQueryError(error, {
        ...options,
        showToast: true,
      });
    },
    [handleQueryError]
  );

  /**
   * Query 에러 처리 (onError에서 사용, Toast는 표시하지 않음)
   */
  const handleQueryErrorSilent = useCallback(
    (
      error: unknown,
      options?: {
        operationId?: string;
        context?: Record<string, unknown>;
      }
    ) => {
      return handleQueryError(error, {
        ...options,
        showToast: false,
        silent: true,
      });
    },
    [handleQueryError]
  );

  /**
   * 재시도 가능한 에러인지 확인
   */
  const checkRetryable = useCallback((error: unknown): boolean => {
    return isRetryableError(error);
  }, []);

  return {
    handleQueryError,
    handleMutationError,
    handleQueryErrorSilent,
    checkRetryable,
    isAuthError,
    isNetworkError,
    isRetryableError,
  };
}
