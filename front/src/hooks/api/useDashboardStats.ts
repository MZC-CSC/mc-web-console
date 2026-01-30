'use client';

import { useQuery } from '@tanstack/react-query';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';

/**
 * Dashboard 통계 데이터 조회 Hook
 * 여러 API를 병렬로 호출하여 dashboard 통계 정보 수집
 */

interface DashboardStats {
  workspaces: number;
  projects: number;
  mci: number;
  users: number;
}

export function useDashboardStats() {
  const { data, isLoading, error, refetch } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        // 병렬로 모든 API 호출
        const [workspacesRes, projectsRes, usersRes] = await Promise.all([
          // Workspaces 목록 조회
          apiPost(OPERATION_IDS.LIST_WORKSPACES, { request: {} }).catch(() => ({ responseData: [] })),
          // Projects 목록 조회
          apiPost(OPERATION_IDS.LIST_PROJECTS, { request: {} }).catch(() => ({ responseData: [] })),
          // Users 목록 조회
          apiPost(OPERATION_IDS.GET_USER_LIST, { request: {} }).catch(() => ({ responseData: [] })),
        ]);

        // MCI 통계는 별도 API가 필요하거나, 다른 데이터에서 추출
        // 현재는 0으로 설정 (추후 실제 API 연동 필요)
        const mciCount = 0;

        return {
          workspaces: Array.isArray(workspacesRes.responseData)
            ? workspacesRes.responseData.length
            : 0,
          projects: Array.isArray(projectsRes.responseData)
            ? projectsRes.responseData.length
            : 0,
          mci: mciCount,
          users: Array.isArray(usersRes.responseData)
            ? usersRes.responseData.length
            : 0,
        };
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
        // 에러 발생 시 0으로 초기화
        return {
          workspaces: 0,
          projects: 0,
          mci: 0,
          users: 0,
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5분
    retry: 1,
  });

  return {
    stats: data || { workspaces: 0, projects: 0, mci: 0, users: 0 },
    isLoading,
    error,
    refetch,
  };
}
