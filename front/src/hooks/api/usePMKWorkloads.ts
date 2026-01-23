'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  PMKCluster,
  ClusterDetail,
  PMKClusterCreateRequest,
} from '@/types/pmk-workloads';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * PMK Cluster 목록 조회 Hook
 */
export function usePMKClusters() {
  const { data, isLoading, error, refetch } = useQuery<PMKCluster[]>({
    queryKey: ['pmk-clusters'],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // const response = await apiPost<PMKCluster[]>(
      //   OPERATION_IDS.GET_PMK_CLUSTERS_LIST,
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
    clusters: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * PMK Cluster 상세 조회 Hook
 */
export function usePMKCluster(clusterId: string | null) {
  const { data, isLoading, error } = useQuery<ClusterDetail>({
    queryKey: ['pmk-cluster', clusterId],
    queryFn: async () => {
      if (!clusterId) return null as unknown as ClusterDetail;

      // TODO: 실제 API 연동
      // const response = await apiPost<ClusterDetail>(
      //   OPERATION_IDS.GET_PMK_CLUSTER_DETAIL,
      //   {
      //     request: {
      //       id: clusterId,
      //     },
      //   }
      // );
      // return response.responseData!;

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    enabled: !!clusterId,
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    clusterDetail: data,
    isLoading,
    error,
  };
}

/**
 * PMK Cluster 생성 Hook
 */
export function useCreatePMKCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: PMKClusterCreateRequest) => {
      // TODO: 실제 API 연동
      // const response = await apiPost<PMKCluster>(
      //   OPERATION_IDS.CREATE_PMK_CLUSTER,
      //   {
      //     request,
      //   }
      // );
      // return response.responseData!;

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmk-clusters'] });
      toastSuccess('PMK Cluster가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'PMK Cluster 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * PMK Cluster 삭제 Hook
 */
export function useDeletePMKCluster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clusterId: string) => {
      // TODO: 실제 API 연동
      // await apiPost(
      //   OPERATION_IDS.DELETE_PMK_CLUSTER,
      //   {
      //     request: {
      //       id: clusterId,
      //     },
      //   }
      // );

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmk-clusters'] });
      toastSuccess('PMK Cluster가 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'PMK Cluster 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
