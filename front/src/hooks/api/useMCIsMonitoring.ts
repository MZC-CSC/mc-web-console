'use client';

import { useQuery } from '@tanstack/react-query';
import {
  MCIsWorkload,
  MCIsServer,
  Measurement,
  Metric,
  MonitoringData,
} from '@/types/mcis-monitoring';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';

/**
 * MCIs Workload 목록 조회 Hook
 */
export function useMCIsWorkloads() {
  const { data, isLoading, error, refetch } = useQuery<MCIsWorkload[]>({
    queryKey: ['mcis-workloads'],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // const response = await apiPost<MCIsWorkload[]>(
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
 * MCIs Server 목록 조회 Hook (Workload별)
 */
export function useMCIsServers(workloadId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<MCIsServer[]>({
    queryKey: ['mcis-servers', workloadId],
    queryFn: async () => {
      if (!workloadId) {
        return [];
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<MCIsServer[]>(
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
 * Measurement 목록 조회 Hook (Server별)
 */
export function useMeasurements(serverId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<Measurement[]>({
    queryKey: ['measurements', serverId],
    queryFn: async () => {
      if (!serverId) {
        return [];
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<Measurement[]>(
      //   OPERATION_IDS.GET_MEASUREMENTS_LIST,
      //   {
      //     request: {
      //       serverId,
      //     },
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
    },
    enabled: !!serverId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    measurements: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Metric 목록 조회 Hook (Measurement별)
 */
export function useMetrics(measurementId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<Metric[]>({
    queryKey: ['metrics', measurementId],
    queryFn: async () => {
      if (!measurementId) {
        return [];
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<Metric[]>(
      //   OPERATION_IDS.GET_METRICS_LIST,
      //   {
      //     request: {
      //       measurementId,
      //     },
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
    },
    enabled: !!measurementId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    metrics: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Monitoring 데이터 조회 Hook
 */
export function useMonitoringData(config: {
  workload: string | null;
  server: string | null;
  measurement: string | null;
  metric: string | null;
  range: string | null;
  period: string | null;
}) {
  const { data, isLoading, error, refetch } = useQuery<MonitoringData>({
    queryKey: ['monitoring-data', config],
    queryFn: async () => {
      if (!config.workload || !config.server || !config.measurement || !config.metric) {
        return { trend: [] };
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<MonitoringData>(
      //   OPERATION_IDS.GET_MONITORING_DATA,
      //   {
      //     request: {
      //       ...config,
      //     },
      //   }
      // );
      // return response.responseData || { trend: [] };

      // 임시 더미 데이터
      return { trend: [] };
    },
    enabled:
      !!config.workload &&
      !!config.server &&
      !!config.measurement &&
      !!config.metric &&
      !!config.range &&
      !!config.period,
    refetchInterval: config.period ? parseInt(config.period) * 1000 * 60 : false, // Period에 따라 자동 갱신
    staleTime: 1000 * 30, // 30초
  });

  return {
    monitoringData: data || { trend: [] },
    isLoading,
    error,
    refetch,
  };
}
