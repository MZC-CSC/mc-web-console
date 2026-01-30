'use client';

import { useQuery } from '@tanstack/react-query';
import { Role } from '@/types/workspace';
import { apiPost } from '@/lib/api/client';
import { OPERATION_IDS } from '@/constants/api';

/**
 * Role 목록 조회 Hook
 */
export function useRoles(workspaceId?: string) {
  const { data, isLoading, error } = useQuery<Role[]>({
    queryKey: ['roles', workspaceId],
    queryFn: async () => {
      const response = await apiPost<Role[]>(
        OPERATION_IDS.GET_ROLE_LIST,
        {
          request: {
            workspaceId,
          },
        }
      );

      return response.responseData || [];
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    roles: data || [],
    isLoading,
    error,
  };
}
