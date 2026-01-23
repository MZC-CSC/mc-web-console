'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SecurityGroup } from '@/types/resources';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Security Group 목록 조회 Hook
 */
export function useSecurityGroups(nsId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<SecurityGroup[]>({
    queryKey: ['securityGroups', nsId],
    queryFn: async () => {
      if (!nsId) {
        throw new Error('Namespace ID is required');
      }

      const response = await apiPost<SecurityGroup[]>(
        OPERATION_IDS.GET_SECURITY_GROUP_LIST,
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
    securityGroups: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Security Group 단건 조회 Hook
 */
export function useSecurityGroup(nsId: string | null, securityGroupId: string | null) {
  const { data, isLoading, error } = useQuery<SecurityGroup>({
    queryKey: ['securityGroup', nsId, securityGroupId],
    queryFn: async () => {
      if (!nsId || !securityGroupId) {
        throw new Error('Namespace ID and Security Group ID are required');
      }

      const response = await apiPost<SecurityGroup>(
        OPERATION_IDS.GET_SECURITY_GROUP,
        {
          pathParams: {
            nsId,
            securityGroupId,
          },
          request: {},
        }
      );

      return response.responseData!;
    },
    enabled: !!nsId && !!securityGroupId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    securityGroup: data,
    isLoading,
    error,
  };
}

/**
 * Security Group 생성 Hook
 */
export function useCreateSecurityGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, securityGroup }: { nsId: string; securityGroup: Omit<SecurityGroup, 'id'> }) => {
      const response = await apiPost<SecurityGroup>(
        OPERATION_IDS.CREATE_SECURITY_GROUP,
        {
          pathParams: {
            nsId,
          },
          request: securityGroup,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['securityGroups', variables.nsId] });
      toastSuccess('Security Group이 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Security Group 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Security Group 삭제 Hook
 */
export function useDeleteSecurityGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, securityGroupId }: { nsId: string; securityGroupId: string }) => {
      await apiPost(
        OPERATION_IDS.DELETE_SECURITY_GROUP,
        {
          pathParams: {
            nsId,
            securityGroupId,
          },
          request: {},
        }
      );

      return securityGroupId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['securityGroups', variables.nsId] });
      toastSuccess('Security Group이 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Security Group 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
