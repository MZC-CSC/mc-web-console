'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserInfo } from '@/types/auth';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { toastSuccess, toastError } from '@/lib/utils/toast';

interface UseUsersParams {
  search?: string;
  workspaceId?: string;
}

/**
 * User 목록 조회 Hook
 */
export function useUsers(params?: UseUsersParams) {
  const { data, isLoading, error, refetch } = useQuery<UserInfo[]>({
    queryKey: ['users', params?.search, params?.workspaceId],
    queryFn: async () => {
      const response = await apiPost<UserInfo[]>(
        OPERATION_IDS.GET_USER_LIST,
        {
          request: {
            search: params?.search,
            workspaceId: params?.workspaceId,
          },
        }
      );

      return response.responseData || [];
    },
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    users: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * User 단건 조회 Hook
 */
export function useUser(userId: string | null) {
  const { data, isLoading, error } = useQuery<UserInfo>({
    queryKey: ['user', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await apiPost<UserInfo>(
        OPERATION_IDS.GET_USER,
        {
          request: {
            userId,
          },
        }
      );

      return response.responseData!;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    user: data,
    isLoading,
    error,
  };
}

/**
 * User 생성 Hook
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: Omit<UserInfo, 'id'>) => {
      const response = await apiPost<UserInfo>(
        OPERATION_IDS.CREATE_USER,
        {
          request: user,
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toastSuccess('사용자가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '사용자 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * User 수정 Hook
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...user }: UserInfo) => {
      const response = await apiPost<UserInfo>(
        OPERATION_IDS.UPDATE_USER,
        {
          request: {
            id,
            ...user,
          },
        }
      );

      return response.responseData!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toastSuccess('사용자가 수정되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '사용자 수정에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * User 삭제 Hook
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await apiPost(
        OPERATION_IDS.DELETE_USER,
        {
          request: {
            id: userId,
          },
        }
      );

      return userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toastSuccess('사용자가 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '사용자 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
