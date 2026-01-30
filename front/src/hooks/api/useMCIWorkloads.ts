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
  MciStatusResponse,
  MciDynamicReq,
  MciInfo,
  CreateSubGroupReq,
  RecommendVmRequest,
  RecommendVmResponse,
  StatusCounts,
  ServerCounts,
} from '@/types/mci-workloads';
import { MciPolicyInfo, MciPolicyReq } from '@/types/mci-policy';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { toastSuccess, toastError } from '@/lib/utils/toast';
import { AppError } from '@/types/error';
import { ApiResponse } from '@/types/common';

/**
 * MCI Workload 목록 조회 Hook
 * @param nsId - Project의 namespace ID (ns_id). 선택된 project가 있어야만 조회됨
 */
export function useMCIWorkloads(nsId?: string) {
  const { data, isLoading, error, refetch } = useQuery<ApiResponse<{ mci: MCIWorkload[] }>>({
    queryKey: ['mci-workloads', nsId],
    queryFn: async () => {
      if (!nsId) {
        return { status: { code: 0, message: 'No nsId provided' }, responseData: { mci: [] } };
      }

      try {
        // GetAllMci operationId 사용 (mc-infra-manager)
        const response = await apiPost<any>(
          OPERATION_IDS.GET_ALL_MCI,
          {
            pathParams: {
              nsId,
            },
          }
        );

        console.log('[useMCIWorkloads] Fetched', response.responseData?.mci?.length || 0, 'MCI workloads for nsId:', nsId);
        return response;
      } catch (error) {
        console.error('[useMCIWorkloads] API error:', error);
        throw error;
      }
    },
    enabled: !!nsId, // nsId가 있을 때만 조회
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    workloads: data?.responseData?.mci || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * MCI와 Server의 Status 정보를 통합 조회하는 내부 Hook
 * 중복 API 호출을 방지하기 위해 하나의 query로 통합
 * @param nsId - Project의 namespace ID (ns_id)
 */
function useMCIStatusData(nsId?: string) {
  return useQuery<ApiResponse<MciStatusResponse>>({
    queryKey: ['mci-status-data', nsId],
    queryFn: async () => {
      if (!nsId) {
        return {
          status: { code: 0, message: 'No nsId provided' },
          responseData: {
            mci: [],
            statusCounts: { total: 0, running: 0, stopped: 0, suspended: 0, terminated: 0, failed: 0, etc: 0 },
            serverCounts: { total: 0, running: 0, stopped: 0, suspended: 0, terminated: 0, failed: 0, etc: 0 },
          },
        };
      }

      try {
        // GetAllMci with option='status' to get both statusCounts and serverCounts
        const response = await apiPost<MciStatusResponse>(
          OPERATION_IDS.GET_ALL_MCI,
          {
            pathParams: {
              nsId,
            },
            queryParams: {
              option: 'status',
            },
          }
        );

        console.log('[useMCIStatusData] Fetched status data for nsId:', nsId);
        return response;
      } catch (error) {
        console.error('[useMCIStatusData] API error:', error);
        throw error;
      }
    },
    enabled: !!nsId, // nsId가 있을 때만 조회
    staleTime: 1000 * 60 * 1, // 1분
  });
}

/**
 * MCI Status 조회 Hook
 * @param nsId - Project의 namespace ID (ns_id). 선택된 project가 있어야만 조회됨
 */
export function useMCIStatus(nsId?: string) {
  const { data, isLoading, error, refetch } = useMCIStatusData(nsId);

  const mciStatus: MCIStatus = {
    total: data?.responseData?.statusCounts?.total || 0,
    running: data?.responseData?.statusCounts?.running || 0,
    stopped: data?.responseData?.statusCounts?.stopped || 0,
    terminated: data?.responseData?.statusCounts?.terminated || 0,
    failed: data?.responseData?.statusCounts?.failed || 0,
    etc: data?.responseData?.statusCounts?.etc || 0,
  };

  return {
    mciStatus,
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
  const { data, isLoading, error, refetch } = useMCIStatusData(nsId);

  const serverStatus: ServerStatus = {
    total: data?.responseData?.serverCounts?.total || 0,
    running: data?.responseData?.serverCounts?.running || 0,
    stopped: data?.responseData?.serverCounts?.stopped || 0,
    terminated: data?.responseData?.serverCounts?.terminated || 0,
    failed: data?.responseData?.serverCounts?.failed || 0,
    etc: data?.responseData?.serverCounts?.etc || 0,
  };

  return {
    serverStatus,
    isLoading,
    error,
    refetch,
  };
}

/**
 * MCI Workload 생성 Hook (Dynamic Mode)
 */
export function useCreateMCIWorkload() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<MciInfo>, Error, { nsId: string; data: MciDynamicReq }>({
    mutationFn: async ({ nsId, data }: { nsId: string; data: MciDynamicReq }) => {
      try {
        const response = await apiPost<MciInfo, MciDynamicReq>(
          OPERATION_IDS.POST_MCI_DYNAMIC,
          {
            pathParams: {
              nsId,
            },
            request: data,
          }
        );

        console.log('[useCreateMCIWorkload] MCI created successfully:', response.responseData?.id);
        return response;
      } catch (error) {
        console.error('[useCreateMCIWorkload] API error:', error);
        throw error;
      }
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
 * MCI VM SubGroup 추가 Hook (Expert Mode)
 * 기존 MCI에 VM SubGroup을 추가합니다.
 */
export function useAddMCIVMSubGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nsId,
      mciId,
      data
    }: {
      nsId: string;
      mciId: string;
      data: CreateSubGroupReq
    }) => {
      try {
        const response = await apiPost<MciInfo, CreateSubGroupReq>(
          OPERATION_IDS.POST_MCI_VM,
          {
            pathParams: {
              nsId,
              mciId,
            },
            request: data,
          }
        );

        console.log('[useAddMCIVMSubGroup] VM SubGroup added successfully:', response.responseData?.id);
        return response;
      } catch (error) {
        console.error('[useAddMCIVMSubGroup] API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mci-workloads'] });
      queryClient.invalidateQueries({ queryKey: ['mci-status'] });
      queryClient.invalidateQueries({ queryKey: ['server-status'] });
      toastSuccess('VM SubGroup이 추가되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'VM SubGroup 추가에 실패했습니다.';
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
    mutationFn: async ({ nsId, mciId }: { nsId: string; mciId: string }) => {
      try {
        await apiPost(
          OPERATION_IDS.DEL_MCI,
          {
            pathParams: {
              nsId,
              mciId,
            },
          }
        );

        console.log('[useDeleteMCIWorkload] MCI deleted successfully:', mciId);
      } catch (error) {
        console.error('[useDeleteMCIWorkload] API error:', error);
        throw error;
      }
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
  const { data, isLoading, error, refetch } = useQuery<ApiResponse<Spec[]>>({
    queryKey: ['spec-recommendations', request],
    queryFn: async () => {
      try {
        const response = await apiPost<Spec[]>(
          OPERATION_IDS.RECOMMEND_SPEC,
          {
            request: {
              filter: {
                connectionName: request.connectionName ? [request.connectionName] : undefined,
              },
              priority: request.priority
                ? { policy: [request.priority as 'cost' | 'performance' | 'latency' | 'location'] }
                : undefined,
              limit: request.limit ? parseInt(request.limit) : 20,
            },
          }
        );

        console.log('[useSpecRecommendations] Fetched', response.responseData?.length || 0, 'specs');
        return response;
      } catch (error) {
        console.error('[useSpecRecommendations] API error:', error);
        throw error;
      }
    },
    enabled: false, // 검색 버튼 클릭 시에만 조회
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    specs: data?.responseData || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Image Recommendation 조회 Hook
 */
export function useImageRecommendations(request: ImageRecommendationRequest) {
  const { data, isLoading, error, refetch } = useQuery<ApiResponse<{ image: Image[] }>>({
    queryKey: ['image-recommendations', request],
    queryFn: async () => {
      try {
        // Image는 system namespace 사용 (또는 request에서 nsId 전달)
        const nsId = 'system';

        const response = await apiPost<{ image: Image[] }>(
          OPERATION_IDS.GET_ALL_IMAGE,
          {
            pathParams: {
              nsId,
            },
            queryParams: {
              ...(request.osType && {
                filterKey: 'guestOS',
                filterVal: request.osType,
              }),
            },
          }
        );

        console.log('[useImageRecommendations] Fetched', response.responseData?.image?.length || 0, 'images');
        return response;
      } catch (error) {
        console.error('[useImageRecommendations] API error:', error);
        throw error;
      }
    },
    enabled: false, // 검색 버튼 클릭 시에만 조회
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    images: data?.responseData?.image || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * MCI 생성 유효성 검증 Hook (Dynamic Mode)
 */
export function useValidateMCICreation() {
  return useMutation({
    mutationFn: async ({ nsId, data }: { nsId: string; data: MciDynamicReq }) => {
      try {
        const response = await apiPost<unknown, MciDynamicReq>(
          OPERATION_IDS.POST_MCI_DYNAMIC_CHECK_REQUEST,
          {
            pathParams: {
              nsId,
            },
            request: data,
          }
        );

        console.log('[useValidateMCICreation] Validation successful');
        return response;
      } catch (error) {
        console.error('[useValidateMCICreation] Validation failed:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toastSuccess('유효성 검증이 완료되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '유효성 검증에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * MCI 생성 비용 예상 Hook (Dynamic Mode)
 */
export function useMCICostEstimation() {
  return useMutation({
    mutationFn: async ({ nsId, data }: { nsId: string; data: MciDynamicReq }) => {
      try {
        const response = await apiPost<unknown, MciDynamicReq>(
          OPERATION_IDS.POST_MCI_DYNAMIC_REVIEW,
          {
            pathParams: {
              nsId,
            },
            request: data,
          }
        );

        console.log('[useMCICostEstimation] Cost estimation retrieved');
        return response;
      } catch (error) {
        console.error('[useMCICostEstimation] API error:', error);
        throw error;
      }
    },
  });
}

/**
 * MCI에 SubGroup 추가 Hook (Dynamic Mode)
 */
export function useAddMCISubGroupDynamic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nsId,
      mciId,
      data
    }: {
      nsId: string;
      mciId: string;
      data: MciDynamicReq
    }) => {
      try {
        const response = await apiPost<MciInfo, MciDynamicReq>(
          OPERATION_IDS.POST_MCI_SUBGROUP_DYNAMIC,
          {
            pathParams: {
              nsId,
              mciId,
            },
            request: data,
          }
        );

        console.log('[useAddMCISubGroupDynamic] SubGroup added successfully');
        return response;
      } catch (error) {
        console.error('[useAddMCISubGroupDynamic] API error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mci-workloads'] });
      queryClient.invalidateQueries({ queryKey: ['mci-detail'] });
      queryClient.invalidateQueries({ queryKey: ['server-status'] });
      toastSuccess('SubGroup이 추가되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'SubGroup 추가에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Server Recommendation Hook
 * RecommendSpec API 호출 (02_mc-infra-manager)
 */
export function useServerRecommendation() {
  return useMutation<ApiResponse<Spec[]>, Error, RecommendVmRequest>({
    mutationFn: async (request: RecommendVmRequest) => {
      try {
        console.log('[useServerRecommendation] Requesting with:', request);

        // RecommendSpec API (02_mc-infra-manager)
        const response = await apiPost<Spec[]>(
          OPERATION_IDS.RECOMMEND_SPEC,
          {
            request: request.request,
          }
        );

        console.log('[useServerRecommendation] Received', response.responseData?.length || 0, 'specs');
        return response;
      } catch (error) {
        console.error('[useServerRecommendation] API error:', error);
        throw error;
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : '서버 추천 조회에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * MCI 상세 정보 조회 Hook
 * @param nsId - Project의 namespace ID (ns_id)
 * @param mciId - MCI ID
 */
export function useMCIDetail(nsId?: string, mciId?: string) {
  const { data, isLoading, error, refetch } = useQuery<ApiResponse<MciInfo>>({
    queryKey: ['mci-detail', nsId, mciId],
    queryFn: async () => {
      if (!nsId || !mciId) {
        throw new Error('nsId and mciId are required');
      }

      try {
        // GetMci operationId 사용 (mc-infra-manager)
        const response = await apiPost<MciInfo>(
          OPERATION_IDS.GET_MCI,
          {
            pathParams: {
              nsId,
              mciId,
            },
          }
        );

        console.log('[useMCIDetail] Fetched MCI detail for:', mciId);
        return response;
      } catch (error) {
        console.error('[useMCIDetail] API error:', error);
        throw error;
      }
    },
    enabled: !!nsId && !!mciId, // nsId와 mciId가 모두 있을 때만 조회
    staleTime: 1000 * 60 * 1, // 1분
  });

  return {
    mciDetail: data?.responseData,
    isLoading,
    error,
    refetch,
  };
}

/**
 * MCI Policy 조회 Hook
 * @param nsId - Project의 namespace ID (ns_id)
 * @param mciId - MCI ID
 */
export function useMCIPolicy(nsId?: string, mciId?: string) {
  const { data, isLoading, error, refetch } = useQuery<ApiResponse<MciPolicyInfo> | null>({
    queryKey: ['mci-policy', nsId, mciId],
    queryFn: async () => {
      if (!nsId || !mciId) {
        return null;
      }

      try {
        const response = await apiPost<MciPolicyInfo>(
          OPERATION_IDS.GET_MCI_POLICY,
          {
            pathParams: {
              nsId,
              mciId,
            },
          }
        );

        console.log('[useMCIPolicy] Fetched MCI policy for:', mciId);
        return response;
      } catch (error: any) {
        // 에러 객체 자체를 먼저 로깅 (디버깅용)
        console.error('[useMCIPolicy] Raw error object:', error);
        console.error('[useMCIPolicy] Error type:', typeof error);
        console.error('[useMCIPolicy] Error constructor:', error?.constructor?.name);
        console.error('[useMCIPolicy] Is AppError:', error instanceof AppError);
        console.error('[useMCIPolicy] Is Error:', error instanceof Error);
        
        // AppError인 경우 명시적으로 속성 추출
        let errorStatus: number | undefined;
        let errorMessage: string;
        let errorCode: string | undefined;
        let errorDetails: unknown;
        
        if (error instanceof AppError) {
          errorStatus = error.statusCode;
          errorMessage = error.message || 'Policy 정보를 불러오는 중 오류가 발생했습니다.';
          errorCode = error.code;
          errorDetails = error.details;
          console.error('[useMCIPolicy] AppError properties:', {
            statusCode: error.statusCode,
            message: error.message,
            code: error.code,
            details: error.details,
            originalError: error.originalError,
          });
        } else if (error instanceof Error) {
          errorMessage = error.message || 'Policy 정보를 불러오는 중 오류가 발생했습니다.';
          errorStatus = (error as any).statusCode ?? (error as any).status;
          errorCode = (error as any).code;
          errorDetails = (error as any).details;
          console.error('[useMCIPolicy] Error properties:', {
            name: error.name,
            message: error.message,
            statusCode: (error as any).statusCode,
            status: (error as any).status,
            code: (error as any).code,
            details: (error as any).details,
          });
        } else if (typeof error === 'object' && error !== null) {
          errorStatus = (error as any).statusCode ?? (error as any).status;
          errorMessage = (error as any).message || 'Policy 정보를 불러오는 중 오류가 발생했습니다.';
          errorCode = (error as any).code;
          errorDetails = (error as any).details;
          console.error('[useMCIPolicy] Object error properties:', {
            statusCode: (error as any).statusCode,
            status: (error as any).status,
            message: (error as any).message,
            code: (error as any).code,
            details: (error as any).details,
            keys: Object.keys(error),
          });
        } else {
          errorMessage = 'Policy 정보를 불러오는 중 오류가 발생했습니다.';
          console.error('[useMCIPolicy] Non-object error:', error);
        }
        
        // 404 에러는 Policy가 없는 것으로 처리 (에러로 throw하지 않음)
        if (errorStatus === 404) {
          console.log('[useMCIPolicy] Policy not found for:', mciId);
          return null;
        }
        
        // 400, 500 등 다른 에러는 그대로 throw (Toast는 컴포넌트에서 처리)
        console.error('[useMCIPolicy] Final extracted values:', {
          statusCode: errorStatus,
          message: errorMessage,
          code: errorCode,
          details: errorDetails,
        });
        throw error;
      }
    },
    enabled: !!nsId && !!mciId, // nsId와 mciId가 모두 있을 때만 조회
    staleTime: 1000 * 60 * 1, // 1분
    retry: false, // 에러 발생 시 재시도하지 않음
    refetchOnWindowFocus: false, // 윈도우 포커스 시 자동 재조회 비활성화
  });

  return {
    policyInfo: data?.responseData,
    isLoading,
    error,
    refetch,
  };
}

/**
 * MCI Policy 생성 Hook
 * @param nsId - Project의 namespace ID (ns_id)
 * @param mciId - MCI ID
 */
export function useCreateMCIPolicy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      nsId,
      mciId,
      data,
    }: {
      nsId: string;
      mciId: string;
      data: MciPolicyReq;
    }) => {
      try {
        const response = await apiPost<MciPolicyInfo, MciPolicyReq>(
          OPERATION_IDS.POST_MCI_POLICY,
          {
            pathParams: {
              nsId,
              mciId,
            },
            request: data,
          }
        );

        console.log('[useCreateMCIPolicy] Policy created successfully:', response.responseData);
        return response;
      } catch (error) {
        console.error('[useCreateMCIPolicy] API error:', error);
        throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mci-policy', variables.nsId, variables.mciId] });
      toastSuccess('Policy가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Policy 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
