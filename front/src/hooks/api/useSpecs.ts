'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServerSpec } from '@/types/resources';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Server Spec 목록 조회 Hook
 */
export function useSpecs(nsId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<ServerSpec[]>({
    queryKey: ['specs', nsId],
    queryFn: async () => {
      if (!nsId) {
        throw new Error('Namespace ID is required');
      }

      const response = await apiPost<ServerSpec[]>(
        OPERATION_IDS.GET_SPEC_LIST,
        {
          pathParams: {
            nsId,
          },
          request: {},
        }
      );

      return response.responseData || [];
    },
    enabled: !!nsId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    specs: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Server Spec 단건 조회 Hook
 */
export function useSpec(nsId: string | null, specId: string | null) {
  const { data, isLoading, error } = useQuery<ServerSpec>({
    queryKey: ['spec', nsId, specId],
    queryFn: async () => {
      if (!nsId || !specId) {
        throw new Error('Namespace ID and Spec ID are required');
      }

      const response = await apiPost<ServerSpec>(
        OPERATION_IDS.GET_SPEC,
        {
          pathParams: {
            nsId,
            specId,
          },
          request: {},
        }
      );

      return response.responseData!;
    },
    enabled: !!nsId && !!specId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    spec: data,
    isLoading,
    error,
  };
}

/**
 * Server Spec 생성 Hook
 */
export function useCreateSpec() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, spec }: { nsId: string; spec: Omit<ServerSpec, 'id'> }) => {
      const response = await apiPost<ServerSpec>(
        OPERATION_IDS.CREATE_SPEC,
        {
          pathParams: {
            nsId,
          },
          request: spec,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specs', variables.nsId] });
      toastSuccess('Server Spec이 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Server Spec 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Server Spec 수정 Hook
 */
export function useUpdateSpec() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, specId, spec }: { nsId: string; specId: string; spec: Partial<ServerSpec> }) => {
      const response = await apiPost<ServerSpec>(
        OPERATION_IDS.UPDATE_SPEC,
        {
          pathParams: {
            nsId,
            specId,
          },
          request: spec,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specs', variables.nsId] });
      queryClient.invalidateQueries({ queryKey: ['spec', variables.nsId, variables.specId] });
      toastSuccess('Server Spec이 수정되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Server Spec 수정에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Server Spec 삭제 Hook
 */
export function useDeleteSpec() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, specId }: { nsId: string; specId: string }) => {
      await apiPost(
        OPERATION_IDS.DELETE_SPEC,
        {
          pathParams: {
            nsId,
            specId,
          },
          request: {},
        }
      );

      return specId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specs', variables.nsId] });
      toastSuccess('Server Spec이 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Server Spec 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
