/**
 * 에러 처리 사용 예시
 * 
 * 이 파일은 에러 처리 사용 방법을 보여주는 예시입니다.
 * 실제 코드에서는 이 파일을 사용하지 않습니다.
 */

import { handleError, isAuthError, isNetworkError, isRetryableError } from './errorHandler';
import { useErrorHandler } from '@/hooks/useErrorHandler';

// ============================================
// 1. 기본 에러 처리 (함수에서 직접 사용)
// ============================================

async function exampleBasicErrorHandling() {
  try {
    // API 호출
    const response = await fetch('/api/data');
    if (!response.ok) {
      throw new Error('API 호출 실패');
    }
  } catch (error) {
    // 에러 처리 (Toast 자동 표시)
    handleError(error, {
      operationId: 'GET_DATA',
      fallbackMessage: '데이터를 불러오는데 실패했습니다.',
    });
  }
}

// ============================================
// 2. React Query Hook에서 사용
// ============================================

function exampleReactQueryHook() {
  const { handleMutationError } = useErrorHandler();

  const mutation = useMutation({
    mutationFn: async (data) => {
      return await apiPost('CREATE_RESOURCE', { request: data });
    },
    onSuccess: () => {
      toastSuccess('생성되었습니다.');
    },
    onError: (error) => {
      // 에러 처리 (Toast 자동 표시)
      handleMutationError(error, {
        operationId: 'CREATE_RESOURCE',
        fallbackMessage: '리소스 생성에 실패했습니다.',
      });
    },
  });
}

// ============================================
// 3. 에러 타입별 처리
// ============================================

async function exampleErrorTypeHandling() {
  try {
    await apiPost('SOME_OPERATION', {});
  } catch (error) {
    const appError = handleError(error, { silent: true });

    // 인증 에러 처리
    if (isAuthError(appError)) {
      router.push('/login');
      return;
    }

    // 네트워크 에러 처리
    if (isNetworkError(appError)) {
      // 재시도 로직 등
      return;
    }

    // 재시도 가능한 에러인지 확인
    if (isRetryableError(appError)) {
      // 재시도 로직
      return;
    }

    // 기타 에러는 기본 처리
    handleError(error);
  }
}

// ============================================
// 4. Toast 없이 조용히 처리
// ============================================

async function exampleSilentErrorHandling() {
  try {
    await apiPost('BACKGROUND_OPERATION', {});
  } catch (error) {
    // Toast는 표시하지 않고 로깅만 수행
    handleError(error, {
      silent: true,
      operationId: 'BACKGROUND_OPERATION',
    });
  }
}

// ============================================
// 5. Query 에러 처리 (Toast 없이)
// ============================================

function exampleQueryErrorHandling() {
  const { handleQueryErrorSilent } = useErrorHandler();

  const query = useQuery({
    queryKey: ['data'],
    queryFn: async () => {
      return await apiPost('GET_DATA', {});
    },
    onError: (error) => {
      // Query 에러는 Toast 없이 조용히 처리
      handleQueryErrorSilent(error, {
        operationId: 'GET_DATA',
      });
    },
  });
}
