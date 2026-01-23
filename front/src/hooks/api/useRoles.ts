'use client';

import { useQuery } from '@tanstack/react-query';
import { Role } from '@/types/workspace';
import { apiPostByPath } from '@/lib/api/client';

/**
 * Role 목록 조회 Hook
 */
export function useRoles(workspaceId?: string) {
  const { data, isLoading, error } = useQuery<Role[]>({
    queryKey: ['roles', workspaceId],
    queryFn: async () => {
      // TODO: 실제 API 경로 및 operationId 확인 필요
      const response = await apiPostByPath<Role[]>(
        '/api/role/list',
        'GetRoleList' as any,
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
