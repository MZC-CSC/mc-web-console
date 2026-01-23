'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Network } from '@/types/resources';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Network 목록 조회 Hook
 */
export function useNetworks(nsId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<Network[]>({
    queryKey: ['networks', nsId],
    queryFn: async () => {
      if (!nsId) {
        throw new Error('Namespace ID is required');
      }

      const response = await apiPost<Network[]>(
        OPERATION_IDS.GET_NETWORK_LIST,
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
    networks: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Network 단건 조회 Hook
 */
export function useNetwork(nsId: string | null, vNetId: string | null) {
  const { data, isLoading, error } = useQuery<Network>({
    queryKey: ['network', nsId, vNetId],
    queryFn: async () => {
      if (!nsId || !vNetId) {
        throw new Error('Namespace ID and VNet ID are required');
      }

      const response = await apiPost<Network>(
        OPERATION_IDS.GET_NETWORK,
        {
          pathParams: {
            nsId,
            vNetId,
          },
          request: {},
        }
      );

      return response.responseData!;
    },
    enabled: !!nsId && !!vNetId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    network: data,
    isLoading,
    error,
  };
}

/**
 * Network 생성 Hook
 */
export function useCreateNetwork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, network }: { nsId: string; network: Omit<Network, 'id'> }) => {
      const response = await apiPost<Network>(
        OPERATION_IDS.CREATE_NETWORK,
        {
          pathParams: {
            nsId,
          },
          request: network,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['networks', variables.nsId] });
      toastSuccess('Network가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Network 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Network 삭제 Hook
 */
export function useDeleteNetwork() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, vNetId }: { nsId: string; vNetId: string }) => {
      await apiPost(
        OPERATION_IDS.DELETE_NETWORK,
        {
          pathParams: {
            nsId,
            vNetId,
          },
          request: {},
        }
      );

      return vNetId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['networks', variables.nsId] });
      toastSuccess('Network가 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Network 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
