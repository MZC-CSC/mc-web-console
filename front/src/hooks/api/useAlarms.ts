'use client';

import { useQuery } from '@tanstack/react-query';
import { Alarm, AlarmDetail, EventAlarm } from '@/types/alarms';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';

/**
 * Alarms 목록 조회 Hook
 */
export function useAlarms() {
  const { data, isLoading, error, refetch } = useQuery<Alarm[]>({
    queryKey: ['alarms'],
    queryFn: async () => {
      // TODO: 실제 API 연동
      // const response = await apiPost<Alarm[]>(
      //   OPERATION_IDS.GET_ALARMS_LIST,
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
    alarms: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Alarm 상세 정보 조회 Hook
 */
export function useAlarmDetail(seq: number | null) {
  const { data, isLoading, error } = useQuery<AlarmDetail>({
    queryKey: ['alarm-detail', seq],
    queryFn: async () => {
      if (!seq) {
        throw new Error('Alarm seq is required');
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<AlarmDetail>(
      //   OPERATION_IDS.GET_ALARM_DETAIL,
      //   {
      //     request: {
      //       seq,
      //     },
      //   }
      // );
      // return response.responseData!;

      // 임시 더미 데이터
      throw new Error('Not implemented');
    },
    enabled: !!seq,
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    alarmDetail: data,
    isLoading,
    error,
  };
}

/**
 * Event & Alarms 목록 조회 Hook
 */
export function useEventAlarms(policySeq: number | null) {
  const { data, isLoading, error, refetch } = useQuery<EventAlarm[]>({
    queryKey: ['event-alarms', policySeq],
    queryFn: async () => {
      if (!policySeq) {
        throw new Error('Policy seq is required');
      }

      // TODO: 실제 API 연동
      // const response = await apiPost<EventAlarm[]>(
      //   OPERATION_IDS.GET_EVENT_ALARMS_LIST,
      //   {
      //     request: {
      //       policySeq,
      //     },
      //   }
      // );
      // return response.responseData || [];

      // 임시 더미 데이터
      return [];
    },
    enabled: !!policySeq,
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    eventAlarms: data || [],
    isLoading,
    error,
    refetch,
  };
}
