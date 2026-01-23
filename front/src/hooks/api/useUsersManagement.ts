'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User,
  UserDetail,
  UserCreateRequest,
  UserUpdateRequest,
  AddRoleMappingRequest,
  RemoveRoleMappingRequest,
} from '@/types/users';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Users 목록 조회 Hook
 */
export function useUsers() {
  const { data, isLoading, error, refetch } = useQuery<User[]>({
    queryKey: ['users-management'],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // const response = await apiPost<User[]>(
      //   OPERATION_IDS.GET_USERS_LIST,
      //   {
      //     request: {},
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
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
 * User 상세 조회 Hook
 */
export function useUser(userId: string | null) {
  const { data, isLoading, error } = useQuery<UserDetail>({
    queryKey: ['user-management', userId],
    queryFn: async () => {
      if (!userId) return null as unknown as UserDetail;

      // TODO: 실제 API 연동
      // const response = await apiPost<UserDetail>(
      //   OPERATION_IDS.GET_USER_DETAIL,
      //   {
      //     request: {
      //       id: userId,
      //     },
      //   }
      // );
      // return response.responseData!;

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    userDetail: data,
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
    mutationFn: async (request: UserCreateRequest) => {
      // TODO: 실제 API 연동
      // const response = await apiPost<User>(
      //   OPERATION_IDS.CREATE_USER,
      //   {
      //     request,
      //   }
      // );
      // return response.responseData!;

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
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
    mutationFn: async (request: UserUpdateRequest) => {
      // TODO: 실제 API 연동
      // const response = await apiPost<User>(
      //   OPERATION_IDS.UPDATE_USER,
      //   {
      //     request,
      //   }
      // );
      // return response.responseData!;

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      queryClient.invalidateQueries({ queryKey: ['user-management'] });
      toastSuccess('사용자 정보가 수정되었습니다.');
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
      // TODO: 실제 API 연동
      // await apiPost(
      //   OPERATION_IDS.DELETE_USER,
      //   {
      //     request: {
      //       id: userId,
      //     },
      //   }
      // );

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      toastSuccess('사용자가 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '사용자 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Role 매핑 추가 Hook
 */
export function useAddRoleMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddRoleMappingRequest) => {
      // TODO: 실제 API 연동
      // await apiPost(
      //   OPERATION_IDS.ADD_USER_ROLE_MAPPING,
      //   {
      //     request,
      //   }
      // );

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-management', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      toastSuccess('Role 매핑이 추가되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Role 매핑 추가에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Role 매핑 삭제 Hook
 */
export function useRemoveRoleMapping() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: RemoveRoleMappingRequest) => {
      // TODO: 실제 API 연동
      // await apiPost(
      //   OPERATION_IDS.REMOVE_USER_ROLE_MAPPING,
      //   {
      //     request,
      //   }
      // );

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user-management', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      toastSuccess('Role 매핑이 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Role 매핑 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
