'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Project } from '@/types/workspace';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';

/**
 * Workspace의 Project 목록 조회 Hook
 * GetWPmappingListByWorkspaceId API를 사용하여 workspace에 할당된 project 목록 조회
 */
export function useWorkspaceProjects(workspaceId?: string): {
  projects: Project[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useQuery<Project[]>({
    queryKey: ['workspace-projects', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        return [];
      }

      // GetWPmappingListByWorkspaceId API 호출
      const response = await apiPost<any>(
        OPERATION_IDS.GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID,
        {
          pathParams: {
            workspaceId: workspaceId,
          },
        }
      );

      // response.responseData.projects 배열 추출
      const projects = response.responseData?.projects;
      return Array.isArray(projects) ? projects : [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  // 안전하게 배열 반환 보장
  const projectsArray = Array.isArray(data) ? data : [];

  return {
    projects: projectsArray,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * @deprecated useWorkspaceProjects를 사용하세요
 * Project 목록 조회 Hook (하위 호환성을 위해 유지)
 */
export function useProjects(workspaceId?: string) {
  return useWorkspaceProjects(workspaceId);
}

/**
 * 전체 Project 목록 조회 Hook (워크스페이스 할당용)
 */
export function useAllProjects() {
  const { data, isLoading, error, refetch } = useQuery<Project[]>({
    queryKey: ['all-projects'],
    queryFn: async () => {
      const response = await apiPost<Project[]>(
        OPERATION_IDS.LIST_PROJECTS,
        {
          request: {},
        }
      );

      return response.responseData || [];
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    projects: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * 워크스페이스에 프로젝트 추가 Hook
 */
export function useAddProjectToWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      projectId,
    }: {
      workspaceId: string;
      projectId: string;
    }) => {
      const response = await apiPost(OPERATION_IDS.ADD_PROJECT_TO_WORKSPACE, {
        request: {
          workspaceId,
          projectId,
        },
      });

      return response;
    },
    onSuccess: (_, variables) => {
      // 해당 워크스페이스의 프로젝트 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ['workspace-projects', variables.workspaceId],
      });
    },
  });
}

/**
 * 워크스페이스에서 프로젝트 제거 Hook
 */
export function useRemoveProjectFromWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      workspaceId,
      projectId,
    }: {
      workspaceId: string;
      projectId: string;
    }) => {
      const response = await apiPost(
        OPERATION_IDS.REMOVE_PROJECT_FROM_WORKSPACE,
        {
          request: {
            workspaceId,
            projectId,
          },
        }
      );

      return response;
    },
    onSuccess: (_, variables) => {
      // 해당 워크스페이스의 프로젝트 목록 갱신
      queryClient.invalidateQueries({
        queryKey: ['workspace-projects', variables.workspaceId],
      });
    },
  });
}

/**
 * 프로젝트 생성 Hook
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (project: {
      name: string;
      description: string;
    }) => {
      const response = await apiPost<Project>(
        OPERATION_IDS.CREATE_PROJECT,
        {
          request: {
            name: project.name,
            description: project.description,
          },
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      // 전체 프로젝트 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['all-projects'] });
    },
  });
}
