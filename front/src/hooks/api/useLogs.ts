'use client';

import { useQuery } from '@tanstack/react-query';
import { Log, LogDetail, Workload, Server } from '@/types/logs';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';

/**
 * Workload 목록 조회 Hook
 */
export function useWorkloads() {
  const { data, isLoading, error, refetch } = useQuery<Workload[]>({
    queryKey: ['workloads'],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // const response = await apiPost<Workload[]>(
      //   OPERATION_IDS.GET_WORKLOADS_LIST,
      //   {
      //     request: {},
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    workloads: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Server 목록 조회 Hook (Workload별)
 */
export function useServers(workloadId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<Server[]>({
    queryKey: ['servers', workloadId],
    queryFn: async () => {
      if (!workloadId) {
        return [];
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<Server[]>(
      //   OPERATION_IDS.GET_SERVERS_LIST,
      //   {
      //     request: {
      //       workloadId,
      //     },
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
    },
    enabled: !!workloadId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    servers: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Log 목록 조회 Hook
 */
export function useLogs(params: {
  workloadId?: string | null;
  serverId?: string | null;
  keyword?: string;
}) {
  const { data, isLoading, error, refetch } = useQuery<Log[]>({
    queryKey: ['logs', params.workloadId, params.serverId, params.keyword],
    queryFn: async () => {
      if (!params.workloadId || !params.serverId) {
        return [];
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<Log[]>(
      //   OPERATION_IDS.GET_LOGS_LIST,
      //   {
      //     request: {
      //       workloadId: params.workloadId,
      //       serverId: params.serverId,
      //       keyword: params.keyword,
      //     },
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
    },
    enabled: !!params.workloadId && !!params.serverId,
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    logs: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Log 상세 정보 조회 Hook
 */
export function useLogDetail(logId: string | null) {
  const { data, isLoading, error } = useQuery<LogDetail>({
    queryKey: ['log-detail', logId],
    queryFn: async () => {
      if (!logId) {
        throw new Error('Log ID is required');
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<LogDetail>(
      //   OPERATION_IDS.GET_LOG_DETAIL,
      //   {
      //     request: {
      //       logId,
      //     },
      //   }
      // );
      // return response.responseData!;

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    enabled: !!logId,
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    logDetail: data,
    isLoading,
    error,
  };
}
