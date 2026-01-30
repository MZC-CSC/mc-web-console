// hooks/api/useUsersManagement.ts

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listUsers,
  getUserByID,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from '@/lib/api/usersApi';
import type {
  User,
  UserCreateData,
  UserUpdateData,
  ListUsersParams,
} from '@/types/users';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Users 목록 조회 Hook (Phase 1)
 */
export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: ['users-management', params],
    queryFn: () => listUsers(params),
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * User 상세 조회 Hook (Phase 1)
 */
export function useUser(userId: string | null) {
  return useQuery({
    queryKey: ['user-management', userId],
    queryFn: () => getUserByID(userId!),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5분
  });
}

/**
 * User 생성 Mutation Hook (Phase 1)
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UserCreateData) => createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      toastSuccess('사용자가 생성되었습니다.');
    },
    onError: (error: Error) => {
      toastError(`사용자 생성 실패: ${error.message}`);
    },
  });
}

/**
 * User 수정 Mutation Hook (Phase 1)
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UserUpdateData }) =>
      updateUser(userId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      queryClient.invalidateQueries({ queryKey: ['user-management', variables.userId] });
      toastSuccess('사용자 정보가 수정되었습니다.');
    },
    onError: (error: Error) => {
      toastError(`사용자 수정 실패: ${error.message}`);
    },
  });
}

/**
 * User 삭제 Mutation Hook (Phase 1)
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      toastSuccess('사용자가 삭제되었습니다.');
    },
    onError: (error: Error) => {
      toastError(`사용자 삭제 실패: ${error.message}`);
    },
  });
}

/**
 * User 상태 변경 Mutation Hook (Phase 1)
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, enabled }: { userId: string; enabled: boolean }) =>
      updateUserStatus(userId, enabled),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users-management'] });
      queryClient.invalidateQueries({ queryKey: ['user-management', variables.userId] });
      toastSuccess('사용자 상태가 변경되었습니다.');
    },
    onError: (error: Error) => {
      toastError(`상태 변경 실패: ${error.message}`);
    },
  });
}
