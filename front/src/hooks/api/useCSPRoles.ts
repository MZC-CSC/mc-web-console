'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CSPRole } from '@/types/workspace';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * CSP Role 목록 조회 Hook
 */
export function useCSPRoles(workspaceId: string | null, provider?: string) {
  const { data, isLoading, error, refetch } = useQuery<CSPRole[]>({
    queryKey: ['csp-roles', workspaceId, provider],
    queryFn: async () => {
      if (!workspaceId) {
        return [];
      }

      const response = await apiPost<CSPRole[]>(
        OPERATION_IDS.GET_ROLE_LIST,
        {
          request: {
            workspaceId,
            roleType: 'csp',
            provider,
          },
        }
      );

      return response.responseData || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    cspRoles: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * CSP Role 단건 조회 Hook
 */
export function useCSPRole(roleId: string | null) {
  const { data, isLoading, error } = useQuery<CSPRole>({
    queryKey: ['csp-role', roleId],
    queryFn: async () => {
      if (!roleId) {
        throw new Error('CSP Role ID is required');
      }

      const response = await apiPost<CSPRole>(
        OPERATION_IDS.GET_ROLE,
        {
          request: {
            id: roleId,
          },
        }
      );

      return response.responseData!;
    },
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    cspRole: data,
    isLoading,
    error,
  };
}

/**
 * CSP Role 생성 Hook
 */
export function useCreateCSPRole(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: Omit<CSPRole, 'id'>) => {
      const response = await apiPost<CSPRole>(
        OPERATION_IDS.CREATE_ROLE,
        {
          request: {
            ...role,
            workspaceId,
          },
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csp-roles'] });
      toastSuccess('CSP Role이 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'CSP Role 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * CSP Role 수정 Hook
 */
export function useUpdateCSPRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...role }: CSPRole) => {
      const response = await apiPost<CSPRole>(
        OPERATION_IDS.UPDATE_ROLE,
        {
          request: {
            id,
            ...role,
          },
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csp-roles'] });
      queryClient.invalidateQueries({ queryKey: ['csp-role'] });
      toastSuccess('CSP Role이 수정되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'CSP Role 수정에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * CSP Role 삭제 Hook
 */
export function useDeleteCSPRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (roleId: string) => {
      await apiPost(
        OPERATION_IDS.DELETE_ROLE,
        {
          request: {
            id: roleId,
          },
        }
      );

      return roleId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['csp-roles'] });
      toastSuccess('CSP Role이 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'CSP Role 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
