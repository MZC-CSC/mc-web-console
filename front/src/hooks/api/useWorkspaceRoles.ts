'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Role, TreeNode } from '@/types/workspace';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Workspace Role 목록 조회 Hook
 */
export function useWorkspaceRoles(workspaceId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<Role[]>({
    queryKey: ['workspace-roles', workspaceId],
    queryFn: async () => {
      if (!workspaceId) {
        return [];
      }

      const response = await apiPost<Role[]>(
        OPERATION_IDS.GET_ROLE_LIST,
        {
          request: {
            workspaceId,
            roleType: 'workspace',
          },
        }
      );

      return response.responseData || [];
    },
    enabled: !!workspaceId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    roles: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * API 응답 타입 (실제 API 응답 구조)
 */
interface RoleDetailApiResponse {
  id: string;
  name: string;
  description?: string;
  workspaceId?: string;
  roleType?: 'platform' | 'workspace' | 'csp';
  // API 응답에 포함될 수 있는 필드들
  platformAccess?: {
    permissions?: string[];
    treeData?: TreeNode[];
  };
  workspaceAccess?: boolean;
  cspRoleMappings?: Array<{
    id: string;
    provider: string;
    roleName: string;
    roleArn?: string;
  }>;
}

/**
 * API 응답을 Role 타입으로 변환
 */
function mapRoleDetailResponse(response: RoleDetailApiResponse): Role {
  return {
    id: response.id,
    name: response.name,
    description: response.description,
    workspaceId: response.workspaceId,
    roleType: response.roleType,
    platformAccess: response.platformAccess
      ? {
          permissions: response.platformAccess.permissions || [],
          treeData: response.platformAccess.treeData,
        }
      : undefined,
    workspaceAccess: response.workspaceAccess,
    cspRoleMappings: response.cspRoleMappings?.map((mapping) => ({
      id: mapping.id,
      provider: mapping.provider as 'aws' | 'gcp' | 'azure' | 'alibaba' | 'tencent',
      roleName: mapping.roleName,
      roleArn: mapping.roleArn,
    })),
  };
}

/**
 * Workspace Role 단건 조회 Hook
 * Phase 2: API 응답 매핑 로직 추가
 */
export function useWorkspaceRole(roleId: string | null) {
  const { data, isLoading, error } = useQuery<Role>({
    queryKey: ['workspace-role', roleId],
    queryFn: async () => {
      if (!roleId) {
        throw new Error('Role ID is required');
      }

      const response = await apiPost<RoleDetailApiResponse>(
        OPERATION_IDS.GET_ROLE,
        {
          request: {
            id: roleId,
          },
        }
      );

      // API 응답을 Role 타입으로 변환
      return mapRoleDetailResponse(response.responseData!);
    },
    enabled: !!roleId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    role: data,
    isLoading,
    error,
  };
}

/**
 * Workspace Role 생성 Hook
 * Phase 3: Platform Access, Workspace Access, CSP Role Mapping 포함
 */
export function useCreateWorkspaceRole(workspaceId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (role: Omit<Role, 'id'>) => {
      const requestData: Record<string, unknown> = {
        name: role.name,
        description: role.description,
        workspaceId,
        roleType: 'workspace',
      };

      // Platform Access 추가
      if (role.platformAccess?.permissions && role.platformAccess.permissions.length > 0) {
        requestData.platformAccess = role.platformAccess.permissions;
      }

      // Workspace Access 추가
      if (role.workspaceAccess !== undefined) {
        requestData.workspaceAccess = role.workspaceAccess;
      }

      // CSP Role Mappings 추가
      if (role.cspRoleMappings && role.cspRoleMappings.length > 0) {
        requestData.cspRoleMappings = role.cspRoleMappings.map((mapping) => ({
          provider: mapping.provider,
          roleName: mapping.roleName,
          roleArn: mapping.roleArn,
        }));
      }

      const response = await apiPost<Role>(
        OPERATION_IDS.CREATE_ROLE,
        {
          request: requestData,
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-roles'] });
      toastSuccess('Workspace Role이 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Workspace Role 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Workspace Role 수정 Hook
 * Phase 3: Platform Access, Workspace Access, CSP Role Mapping 포함
 * Note: Role Name은 수정 불가
 */
export function useUpdateWorkspaceRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...role }: Role) => {
      const requestData: Record<string, unknown> = {
        id,
        description: role.description,
        // Role Name은 수정 불가하므로 제외
      };

      // Platform Access 추가
      if (role.platformAccess?.permissions) {
        requestData.platformAccess = role.platformAccess.permissions;
      }

      // Workspace Access 추가
      if (role.workspaceAccess !== undefined) {
        requestData.workspaceAccess = role.workspaceAccess;
      }

      // CSP Role Mappings 추가
      if (role.cspRoleMappings) {
        requestData.cspRoleMappings = role.cspRoleMappings.map((mapping) => ({
          provider: mapping.provider,
          roleName: mapping.roleName,
          roleArn: mapping.roleArn,
        }));
      }

      const response = await apiPost<Role>(
        OPERATION_IDS.UPDATE_ROLE,
        {
          request: requestData,
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-roles'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-role'] });
      toastSuccess('Workspace Role이 수정되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Workspace Role 수정에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Workspace Role 삭제 Hook
 */
export function useDeleteWorkspaceRole() {
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
      queryClient.invalidateQueries({ queryKey: ['workspace-roles'] });
      toastSuccess('Workspace Role이 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Workspace Role 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
