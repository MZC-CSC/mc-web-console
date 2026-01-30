'use client';

import { useQuery } from '@tanstack/react-query';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';

/**
 * Workspace Dashboard 데이터 조회 Hook
 */

interface WorkspaceStats {
  projects: number;
  mci: number;
  users: number;
}

/**
 * 특정 워크스페이스의 통계 조회
 */
export function useWorkspaceStats(workspaceId?: string) {
  const { data, isLoading, error, refetch } = useQuery<WorkspaceStats>({
    queryKey: ['workspace-stats', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        return { projects: 0, mci: 0, users: 0 };
      }

      try {
        // 병렬로 데이터 조회
        const [projectsRes, usersRes] = await Promise.all([
          // Workspace의 Projects 조회
          apiPost<{ projects: any[] }>(OPERATION_IDS.GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID, {
            pathParams: { workspaceId },
          }).catch(() => ({ status: { code: 0, message: 'Error' }, responseData: { projects: [] } })),
          // Workspace의 Users 조회
          apiPost<any[]>(OPERATION_IDS.LIST_USERS_AND_ROLES_BY_WORKSPACE, {
            pathParams: { workspaceId },
          }).catch(() => ({ status: { code: 0, message: 'Error' }, responseData: [] })),
        ]);

        const projects = projectsRes.responseData?.projects || [];
        const users = Array.isArray(usersRes.responseData)
          ? usersRes.responseData
          : [];

        // MCI는 별도 API 필요 (현재는 0으로 설정)
        return {
          projects: projects.length,
          mci: 0,
          users: users.length,
        };
      } catch (error) {
        console.error('Failed to fetch workspace stats:', error);
        return { projects: 0, mci: 0, users: 0 };
      }
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    stats: data || { projects: 0, mci: 0, users: 0 },
    isLoading,
    error,
    refetch,
  };
}
