'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SSHKey } from '@/types/resources';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * SSH Key 목록 조회 Hook
 */
export function useSSHKeys(nsId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<SSHKey[]>({
    queryKey: ['sshKeys', nsId],
    queryFn: async () => {
      if (!nsId) {
        throw new Error('Namespace ID is required');
      }

      const response = await apiPost<SSHKey[]>(
        OPERATION_IDS.GET_SSH_KEY_LIST,
        {
          pathParams: {
            nsId,
          },
          request: {},
        }
      );

      return response.responseData || [];
    },
    enabled: !!nsId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    sshKeys: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * SSH Key 단건 조회 Hook
 */
export function useSSHKey(nsId: string | null, sshKeyId: string | null) {
  const { data, isLoading, error } = useQuery<SSHKey>({
    queryKey: ['sshKey', nsId, sshKeyId],
    queryFn: async () => {
      if (!nsId || !sshKeyId) {
        throw new Error('Namespace ID and SSH Key ID are required');
      }

      const response = await apiPost<SSHKey>(
        OPERATION_IDS.GET_SSH_KEY,
        {
          pathParams: {
            nsId,
            sshKeyId,
          },
          request: {},
        }
      );

      return response.responseData!;
    },
    enabled: !!nsId && !!sshKeyId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    sshKey: data,
    isLoading,
    error,
  };
}

/**
 * SSH Key 생성 Hook
 */
export function useCreateSSHKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, sshKey }: { nsId: string; sshKey: Omit<SSHKey, 'id'> }) => {
      const response = await apiPost<SSHKey>(
        OPERATION_IDS.CREATE_SSH_KEY,
        {
          pathParams: {
            nsId,
          },
          request: sshKey,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sshKeys', variables.nsId] });
      toastSuccess('SSH Key가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'SSH Key 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * SSH Key 수정 Hook
 */
export function useUpdateSSHKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, sshKeyId, sshKey }: { nsId: string; sshKeyId: string; sshKey: Partial<SSHKey> }) => {
      const response = await apiPost<SSHKey>(
        OPERATION_IDS.UPDATE_SSH_KEY,
        {
          pathParams: {
            nsId,
            sshKeyId,
          },
          request: sshKey,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sshKeys', variables.nsId] });
      queryClient.invalidateQueries({ queryKey: ['sshKey', variables.nsId, variables.sshKeyId] });
      toastSuccess('SSH Key가 수정되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'SSH Key 수정에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * SSH Key 삭제 Hook
 */
export function useDeleteSSHKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, sshKeyId }: { nsId: string; sshKeyId: string }) => {
      await apiPost(
        OPERATION_IDS.DELETE_SSH_KEY,
        {
          pathParams: {
            nsId,
            sshKeyId,
          },
          request: {},
        }
      );

      return sshKeyId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sshKeys', variables.nsId] });
      toastSuccess('SSH Key가 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'SSH Key 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
