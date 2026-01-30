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
      const response = await apiPost<any>(
        OPERATION_IDS.GET_ALARMS_LIST,
        {
          request: {},
        }
      );

      // Threshold 파싱
      const alarms = response.responseData?.data || [];
      const parsedAlarms = alarms.map((alarm: any) => {
        // threshold는 JSON 문자열이므로 파싱 필요
        const threshold = JSON.parse(alarm.threshold || '{}');
        return {
          seq: alarm.seq,
          name: alarm.name,
          measurement: alarm.measurement,
          field: alarm.field,
          status: alarm.status,
          create_at: alarm.create_at,
          crit: threshold.crit || 0,
          warn: threshold.warn || 0,
          info: threshold.info || 0,
          description: alarm.description,
          statistics: alarm.statistics,
        };
      });

      return parsedAlarms;
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

      const response = await apiPost<any>(
        OPERATION_IDS.GET_ALARM_DETAIL,
        {
          queryParams: {
            policySeq: seq,
          },
          request: {},
        }
      );

      // 첫 번째 alarm 데이터를 AlarmDetail로 변환
      const alarms = response.responseData?.data || [];
      if (alarms.length === 0) {
        throw new Error('Alarm detail not found');
      }

      const alarm = alarms[0];

      // Threshold 파싱하여 Value 생성
      const threshold = JSON.parse(alarm.threshold || '{}');
      const valueParts = [];
      if (threshold.crit) valueParts.push(`Critical: ${threshold.crit}`);
      if (threshold.warn) valueParts.push(`Warning: ${threshold.warn}`);
      if (threshold.info) valueParts.push(`Info: ${threshold.info}`);
      const value = valueParts.join(' ');

      return {
        seq: alarm.seq,
        name: alarm.name,
        description: alarm.description || '',
        status: alarm.status,
        measurement: alarm.measurement,
        metric: alarm.field, // field → metric
        statistics: alarm.statistics || '',
        value, // threshold 파싱 결과
      };
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

      const response = await apiPost<any>(
        OPERATION_IDS.GET_ALARM_DETAIL,
        {
          queryParams: {
            policySeq,
          },
          request: {},
        }
      );

      // 데이터 포맷팅 (Buffalo 코드 참조)
      const events = response.responseData?.data || [];
      const formattedEvents = events.map((event: any) => ({
        policySeq: event.policy_seq,
        occurTime: event.occur_time,
        metric: event.measurement, // measurement → metric
        hostname: event.target_id, // target_id → hostname
        level: event.level,
        createdAt: event.create_at, // create_at → createdAt
        data: event.data,
      }));

      return formattedEvents;
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
