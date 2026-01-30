// lib/api/usersApi.ts

import { apiPost } from '@/lib/api/client';
import { OPERATION_IDS } from '@/constants/api';
import type {
  User,
  UserCreateData,
  UserUpdateData,
  ListUsersParams,
  ListUsersResponse,
} from '@/types/users';

/**
 * Users 목록 조회
 */
export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResponse> {
  const response = await apiPost<ListUsersResponse>(
    OPERATION_IDS.LIST_USERS,
    {
      request: params,
    }
  );
  return {
    users: response.responseData?.users || [],
    total: response.responseData?.total || 0,
  };
}

/**
 * User 상세 조회
 */
export async function getUserByID(userId: string): Promise<User> {
  const response = await apiPost<User>(
    OPERATION_IDS.GET_USER_BY_I_D,
    {
      request: { userId },
    }
  );
  return response.responseData!;
}

/**
 * User 생성
 */
export async function createUser(data: UserCreateData): Promise<User> {
  const response = await apiPost<User>(
    OPERATION_IDS.CREATE_USER,
    {
      request: data,
    }
  );
  return response.responseData!;
}

/**
 * User 수정
 */
export async function updateUser(userId: string, data: UserUpdateData): Promise<User> {
  const response = await apiPost<User>(
    OPERATION_IDS.UPDATE_USER,
    {
      request: {
        id: userId,
        ...data,
      },
    }
  );
  return response.responseData!;
}

/**
 * User 삭제
 */
export async function deleteUser(userId: string): Promise<void> {
  await apiPost(
    OPERATION_IDS.DELETE_USER,
    {
      request: { id: userId },
    }
  );
}

/**
 * User Enabled 상태 변경
 */
export async function updateUserStatus(userId: string, enabled: boolean): Promise<void> {
  await apiPost(
    OPERATION_IDS.UPDATE_USER_STATUS,
    {
      request: {
        userId,
        enabled,
      },
    }
  );
}
