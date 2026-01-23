'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Credential, ConnectionConfig } from '@/types/resources';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Credential 목록 조회 Hook
 */
export function useCredentials() {
  const { data, isLoading, error, refetch } = useQuery<Credential[]>({
    queryKey: ['credentials'],
    queryFn: async () => {
      const response = await apiPost<Credential[]>(
        OPERATION_IDS.GET_CREDENTIAL_LIST,
        {
          request: {},
        }
      );

      return response.responseData || [];
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    credentials: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Credential 단건 조회 Hook
 */
export function useCredential(connConfigName: string | null) {
  const { data, isLoading, error } = useQuery<ConnectionConfig>({
    queryKey: ['credential', connConfigName],
    queryFn: async () => {
      if (!connConfigName) {
        throw new Error('Connection Config Name is required');
      }

      const response = await apiPost<ConnectionConfig>(
        OPERATION_IDS.GET_CREDENTIAL,
        {
          pathParams: {
            connConfigName,
          },
          request: {},
        }
      );

      return response.responseData!;
    },
    enabled: !!connConfigName,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    credential: data,
    isLoading,
    error,
  };
}

/**
 * Credential 등록 Hook
 */
export function useRegisterCredential() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credential: Record<string, unknown>) => {
      const response = await apiPost<Credential>(
        OPERATION_IDS.REGISTER_CREDENTIAL,
        {
          request: credential,
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] });
      toastSuccess('Credential이 등록되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Credential 등록에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
