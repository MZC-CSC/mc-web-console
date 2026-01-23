'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AccessControl, PermissionPolicy } from '@/types/workspace';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Access Control 목록 조회 Hook
 */
export function useAccessControls(workspaceId: string | null, framework: string = 'mciam') {
  const { data, isLoading, error, refetch } = useQuery<AccessControl[]>({
    queryKey: ['access-controls', workspaceId, framework],
    queryFn: async () => {
      if (!workspaceId) {
        return [];
      }

      const response = await apiPost<AccessControl[]>(
        OPERATION_IDS.GET_PERMISSIONS,
        {
          request: {
            workspaceId,
            framework,
          },
        }
      );

      return response.responseData || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    accessControls: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Access Control 단건 조회 Hook
 */
export function useAccessControl(operationId: string | null, framework: string = 'mciam') {
  const { data, isLoading, error } = useQuery<AccessControl>({
    queryKey: ['access-control', operationId, framework],
    queryFn: async () => {
      if (!operationId) {
        throw new Error('Operation ID is required');
      }

      const response = await apiPost<AccessControl>(
        OPERATION_IDS.GET_PERMISSION,
        {
          pathParams: {
            framework,
            operationId,
          },
          request: {},
        }
      );

      return response.responseData!;
    },
    enabled: !!operationId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    accessControl: data,
    isLoading,
    error,
  };
}

/**
 * Access Control Policy 추가 Hook
 */
export function useAppendAccessControlPolicy(workspaceId: string | null, framework: string = 'mciam') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ operationId, policy }: { operationId: string; policy: PermissionPolicy }) => {
      const response = await apiPost<AccessControl>(
        OPERATION_IDS.APPEND_PERMISSION,
        {
          pathParams: {
            framework,
            operationId,
          },
          request: {
            workspaceId,
            policy,
          },
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-controls'] });
      queryClient.invalidateQueries({ queryKey: ['access-control'] });
      toastSuccess('권한 정책이 추가되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '권한 정책 추가에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Access Control Policy 수정 Hook
 */
export function useUpdateAccessControlPolicy(framework: string = 'mciam') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ operationId, policy }: { operationId: string; policy: PermissionPolicy }) => {
      const response = await apiPost<AccessControl>(
        OPERATION_IDS.UPDATE_PERMISSION,
        {
          pathParams: {
            framework,
            operationId,
          },
          request: {
            policy,
          },
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-controls'] });
      queryClient.invalidateQueries({ queryKey: ['access-control'] });
      toastSuccess('권한 정책이 수정되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '권한 정책 수정에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Access Control Policy 삭제 Hook
 */
export function useDeleteAccessControlPolicy(framework: string = 'mciam') {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ operationId, policyId }: { operationId: string; policyId: string }) => {
      await apiPost(
        OPERATION_IDS.DELETE_PERMISSION,
        {
          pathParams: {
            framework,
            operationId,
          },
          request: {
            policyId,
          },
        }
      );

      return policyId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-controls'] });
      queryClient.invalidateQueries({ queryKey: ['access-control'] });
      toastSuccess('권한 정책이 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '권한 정책 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
