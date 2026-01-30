'use client';

import { useQuery } from '@tanstack/react-query';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';

/**
 * Cloud Dashboard 데이터 조회 Hook
 * CSP Credentials API를 사용하여 연결된 CSP별 정보 조회
 *
 * NOTE: 현재는 CSP 연결 정보만 표시하며, 리소스 통계는 Mock 데이터 사용
 * TODO: Backend에 CSP별 리소스 통계 API 추가 필요 (VMs, Storage, Networks 등)
 */

export interface CloudStats {
  provider: string;
  count: number;
  region: string;
  status: 'connected' | 'disconnected' | 'error' | 'connecting';
  resources: {
    vms: number;
    storage: number;
    networks: number;
  };
}

interface Credential {
  id: string;
  name: string;
  provider: string;
  region: string;
  verified: boolean;
}

export function useCloudDashboard() {
  const { data, isLoading, error, refetch } = useQuery<CloudStats[]>({
    queryKey: ['cloud-dashboard'],
    queryFn: async () => {
      try {
        // CSP Credentials 목록 조회
        const response = await apiPost(OPERATION_IDS.MCIAM_LIST_CREDENTIALS, {});

        const credentials = (response.responseData || []) as Credential[];

        // CSP별로 그룹화하여 CloudStats 생성
        const providerMap = new Map<string, CloudStats>();

        credentials.forEach((cred) => {
          const provider = cred.provider.toUpperCase();

          if (!providerMap.has(provider)) {
            providerMap.set(provider, {
              provider,
              count: 0,
              region: cred.region || 'N/A',
              status: cred.verified ? 'connected' : 'error',
              resources: {
                // TODO: Backend API 추가 후 실제 리소스 통계로 교체
                vms: 0,
                storage: 0,
                networks: 0,
              },
            });
          }

          const stats = providerMap.get(provider)!;
          stats.count += 1;
        });

        return Array.from(providerMap.values());
      } catch (error) {
        console.error('Failed to fetch cloud dashboard data:', error);
        return [];
      }
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    cloudStats: data || [],
    isLoading,
    error,
    refetch,
  };
}
