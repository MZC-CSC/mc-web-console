'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OPERATION_IDS, API_PATHS } from '@/constants/api';
import { apiPostByPath } from '@/lib/api/client';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Workspace Role에 사용자 할당 Hook
 */
export function useAssignWorkspaceRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ roleId, userIds }: { roleId: string; userIds: string[] }) => {
      // 각 사용자에 대해 할당 API 호출
      const promises = userIds.map((userId) =>
        apiPostByPath(
          API_PATHS.ROLE.ASSIGN_WORKSPACE_ROLE || '/api/roles/assign/workspace-role',
          OPERATION_IDS.ASSIGN_WORKSPACE_ROLE,
          {
            request: {
              roleId,
              userId,
            },
          }
        )
      );

      await Promise.all(promises);
      return { roleId, userIds };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-roles'] });
      queryClient.invalidateQueries({ queryKey: ['workspace-role'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toastSuccess('사용자가 Role에 할당되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '사용자 할당에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
