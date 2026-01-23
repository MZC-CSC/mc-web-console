'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  MCIWorkload,
  MCIStatus,
  ServerStatus,
  MCICreateRequest,
  SpecRecommendationRequest,
  Spec,
  ImageRecommendationRequest,
  Image,
} from '@/types/mci-workloads';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * MCI Workload 목록 조회 Hook
 * @param nsId - Project의 namespace ID (ns_id). 선택된 project가 있어야만 조회됨
 */
export function useMCIWorkloads(nsId?: string) {
  const { data, isLoading, error, refetch } = useQuery<MCIWorkload[]>({
    queryKey: ['mci-workloads', nsId],
    queryFn: async () => {
      if (!nsId) {
        return [];
      }

      // TODO: 실제 API 연동
      // GetAllMci operationId 사용 (mc-infra-manager)
      // const response = await apiPost<MCIWorkload[]>(
      //   OPERATION_IDS.GET_ALL_MCI,
      //   {
      //     pathParams: {
      //       nsId,
      //     },
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
    },
    enabled: !!nsId, // nsId가 있을 때만 조회
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    workloads: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * MCI Status 조회 Hook
 * @param nsId - Project의 namespace ID (ns_id). 선택된 project가 있어야만 조회됨
 */
export function useMCIStatus(nsId?: string) {
  const { data, isLoading, error, refetch } = useQuery<MCIStatus>({
    queryKey: ['mci-status', nsId],
    queryFn: async () => {
      if (!nsId) {
        return { total: 0, running: 0, stopped: 0, terminated: 0, failed: 0, etc: 0 };
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<MCIStatus>(
      //   OPERATION_IDS.GET_MCI_STATUS,
      //   {
      //     request: {
      //       nsId,
      //     },
      //   }
      // );
      // return response.responseData || { total: 0, running: 0, stopped: 0, terminated: 0, failed: 0, etc: 0 };

      // 임시 더미 데이터
      return { total: 0, running: 0, stopped: 0, terminated: 0, failed: 0, etc: 0 };
    },
    enabled: !!nsId, // nsId가 있을 때만 조회
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    mciStatus: data || { total: 0, running: 0, stopped: 0, terminated: 0, failed: 0, etc: 0 },
    isLoading,
    error,
    refetch,
  };
}

/**
 * Server Status 조회 Hook
 * @param nsId - Project의 namespace ID (ns_id). 선택된 project가 있어야만 조회됨
 */
export function useServerStatus(nsId?: string) {
  const { data, isLoading, error, refetch } = useQuery<ServerStatus>({
    queryKey: ['server-status', nsId],
    queryFn: async () => {
      if (!nsId) {
        return { total: 0, running: 0, stopped: 0, terminated: 0, failed: 0, etc: 0 };
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<ServerStatus>(
      //   OPERATION_IDS.GET_SERVER_STATUS,
      //   {
      //     request: {
      //       nsId,
      //     },
      //   }
      // );
      // return response.responseData || { total: 0, running: 0, stopped: 0, terminated: 0, failed: 0, etc: 0 };

      // 임시 더미 데이터
      return { total: 0, running: 0, stopped: 0, terminated: 0, failed: 0, etc: 0 };
    },
    enabled: !!nsId, // nsId가 있을 때만 조회
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    serverStatus: data || { total: 0, running: 0, stopped: 0, terminated: 0, failed: 0, etc: 0 },
    isLoading,
    error,
    refetch,
  };
}

/**
 * MCI Workload 생성 Hook
 */
export function useCreateMCIWorkload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: MCICreateRequest) => {
      // TODO: 실제 API 연동
      // const response = await apiPost<MCIWorkload>(
      //   OPERATION_IDS.CREATE_MCI_WORKLOAD,
      //   {
      //     request,
      //   }
      // );
      // return response.responseData!;

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mci-workloads'] });
      queryClient.invalidateQueries({ queryKey: ['mci-status'] });
      queryClient.invalidateQueries({ queryKey: ['server-status'] });
      toastSuccess('MCI Workload가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'MCI Workload 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * MCI Workload 삭제 Hook
 */
export function useDeleteMCIWorkload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workloadId: string) => {
      // TODO: 실제 API 연동
      // await apiPost(
      //   OPERATION_IDS.DELETE_MCI_WORKLOAD,
      //   {
      //     request: {
      //       id: workloadId,
      //     },
      //   }
      // );

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mci-workloads'] });
      queryClient.invalidateQueries({ queryKey: ['mci-status'] });
      queryClient.invalidateQueries({ queryKey: ['server-status'] });
      toastSuccess('MCI Workload가 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'MCI Workload 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Spec Recommendation 조회 Hook
 */
export function useSpecRecommendations(request: SpecRecommendationRequest) {
  const { data, isLoading, error, refetch } = useQuery<Spec[]>({
    queryKey: ['spec-recommendations', request],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // const response = await apiPost<Spec[]>(
      //   OPERATION_IDS.GET_SPEC_RECOMMENDATIONS,
      //   {
      //     request,
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
    },
    enabled: false, // 검색 버튼 클릭 시에만 조회
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    specs: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Image Recommendation 조회 Hook
 */
export function useImageRecommendations(request: ImageRecommendationRequest) {
  const { data, isLoading, error, refetch } = useQuery<Image[]>({
    queryKey: ['image-recommendations', request],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // const response = await apiPost<Image[]>(
      //   OPERATION_IDS.GET_IMAGE_RECOMMENDATIONS,
      //   {
      //     request,
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
    },
    enabled: false, // 검색 버튼 클릭 시에만 조회
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    images: data || [],
    isLoading,
    error,
    refetch,
  };
}
