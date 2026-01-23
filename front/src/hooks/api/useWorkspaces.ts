'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Workspace } from '@/types/workspace';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';
import { toastSuccess } from '@/lib/utils/toast';
import { handleError } from '@/lib/utils/errorHandler';

/**
 * Workspace 목록 조회 Hook
 * 화면 최초 로드 시 자동 호출됨 (React Query의 useQuery)
 * 새로고침 버튼 클릭 시 refetch() 호출
 * 관리 화면에서는 listWorkspaces operationId 사용
 */
export function useWorkspaces() {
  const { data, isLoading, error, refetch } = useQuery<Workspace[]>({
    queryKey: ['workspaces'],
    queryFn: async () => {
      const requestData = {
        request: {},
      };
      
      // listWorkspaces operationId 사용 (관리 화면용)
      const response = await apiPost<Workspace[]>(
        OPERATION_IDS.LIST_WORKSPACES,
        requestData
      );

      return response.responseData || [];
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    workspaces: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * 사용자에게 할당된 Workspace 목록 조회 Hook
 * MCI Workloads 등 사용자별 워크스페이스 목록이 필요한 화면에서 사용
 */
export function useUserWorkspaces() {
  const { data, isLoading, error, refetch } = useQuery<Workspace[]>({
    queryKey: ['user-workspaces'],
    queryFn: async () => {
      const requestData = {
        request: {},
      };
      
      // ListUserWorkspaces operationId 사용 (사용자에게 할당된 워크스페이스 목록)
      const response = await apiPost<Workspace[]>(
        OPERATION_IDS.GET_WORKSPACE_LIST_BY_USER_ID,
        requestData
      );

      return response.responseData || [];
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    workspaces: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Workspaces Summary 조회 Hook
 */
export function useWorkspacesSummary() {
  const { data, isLoading, error, refetch } = useQuery<{
    workspacesCount: number;
    projectsCount: number;
    groupMembersCount: number;
  }>({
    queryKey: ['workspaces-summary'],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // const response = await apiPost<{
      //   workspacesCount: number;
      //   projectsCount: number;
      //   groupMembersCount: number;
      // }>(
      //   OPERATION_IDS.GET_WORKSPACES_SUMMARY,
      //   {
      //     request: {},
      //   }
      // );
      // return response.responseData || { workspacesCount: 0, projectsCount: 0, groupMembersCount: 0 };

      // 임시 더미 데이터
      return { workspacesCount: 0, projectsCount: 0, groupMembersCount: 0 };
    },
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    summary: data || { workspacesCount: 0, projectsCount: 0, groupMembersCount: 0 },
    isLoading,
    error,
    refetch,
  };
}

/**
 * Workspace 단건 조회 Hook
 */
export function useWorkspace(workspaceId: string | null) {
  const { data, isLoading, error } = useQuery<Workspace>({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        throw new Error('Workspace ID is required');
      }

      const response = await apiPost<Workspace>(
        OPERATION_IDS.GET_WORKSPACE,
        {
          request: {
            id: workspaceId,
          },
        }
      );

      return response.responseData!;
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    workspace: data,
    isLoading,
    error,
  };
}

/**
 * Workspace 생성 Hook
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspace: Omit<Workspace, 'id'>) => {
      const response = await apiPost<Workspace>(
        OPERATION_IDS.CREATE_WORKSPACE,
        {
          request: workspace,
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toastSuccess('워크스페이스가 생성되었습니다.');
    },
    onError: (error) => {
      // handleError가 이미 Toast를 표시하므로 여기서는 추가 처리만 수행
      // 필요시 특정 에러에 대한 추가 처리 가능
    },
  });
}

/**
 * Workspace 수정 Hook
 */
export function useUpdateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...workspace }: Workspace) => {
      const response = await apiPost<Workspace>(
        OPERATION_IDS.UPDATE_WORKSPACE,
        {
          request: {
            id,
            ...workspace,
          },
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      queryClient.invalidateQueries({ queryKey: ['workspace'] });
      toastSuccess('워크스페이스가 수정되었습니다.');
    },
    onError: (error) => {
      handleError(error, {
        operationId: OPERATION_IDS.UPDATE_WORKSPACE,
        fallbackMessage: '워크스페이스 수정에 실패했습니다.',
      });
    },
  });
}

/**
 * Workspace 삭제 Hook
 */
export function useDeleteWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workspaceId: string) => {
      await apiPost(
        OPERATION_IDS.DELETE_WORKSPACE,
        {
          request: {
            id: workspaceId,
          },
        }
      );

      return workspaceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toastSuccess('워크스페이스가 삭제되었습니다.');
    },
    onError: (error) => {
      handleError(error, {
        operationId: OPERATION_IDS.DELETE_WORKSPACE,
        fallbackMessage: '워크스페이스 삭제에 실패했습니다.',
      });
    },
  });
}
