'use client';

import { useQuery } from '@tanstack/react-query';
import {
  MonitoringServer,
  MonitoringConfigDetail,
  MonitorMetric,
  MetricPlugin,
  MonitoringWorkload,
} from '@/types/monitoring';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';

/**
 * Monitoring Workload 목록 조회 Hook
 */
export function useMonitoringWorkloads() {
  const { data, isLoading, error, refetch } = useQuery<MonitoringWorkload[]>({
    queryKey: ['monitoring-workloads'],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // const response = await apiPost<MonitoringWorkload[]>(
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
 * Monitoring Servers 목록 조회 Hook (Workload별)
 */
export function useMonitoringServers(workloadId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<MonitoringServer[]>({
    queryKey: ['monitoring-servers', workloadId],
    queryFn: async () => {
      if (!workloadId) {
        return [];
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<MonitoringServer[]>(
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
 * Monitoring Config 상세 정보 조회 Hook
 */
export function useMonitoringConfigDetail(serverId: string | null) {
  const { data, isLoading, error } = useQuery<MonitoringConfigDetail>({
    queryKey: ['monitoring-config-detail', serverId],
    queryFn: async () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<MonitoringConfigDetail>(
      //   OPERATION_IDS.GET_MONITORING_CONFIG_DETAIL,
      //   {
      //     request: {
      //       serverId,
      //     },
      //   }
      // );
      // return response.responseData!;

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    enabled: !!serverId,
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    configDetail: data,
    isLoading,
    error,
  };
}

/**
 * Monitor Metrics 목록 조회 Hook
 */
export function useMonitorMetrics(serverId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<MonitorMetric[]>({
    queryKey: ['monitor-metrics', serverId],
    queryFn: async () => {
      if (!serverId) {
        return [];
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<MonitorMetric[]>(
      //   OPERATION_IDS.GET_MONITOR_METRICS_LIST,
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
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    monitorMetrics: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Metric Plugins 목록 조회 Hook
 */
export function useMetricPlugins(serverId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<MetricPlugin[]>({
    queryKey: ['metric-plugins', serverId],
    queryFn: async () => {
      if (!serverId) {
        return [];
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<MetricPlugin[]>(
      //   OPERATION_IDS.GET_METRIC_PLUGINS_LIST,
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
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    metricPlugins: data || [],
    isLoading,
    error,
    refetch,
  };
}
