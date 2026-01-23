'use client';

import { useQuery } from '@tanstack/react-query';
import { CloudResourcesOverview } from '@/types/resources';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';

/**
 * Cloud Resources Overview 조회 Hook
 */
export function useCloudResourcesOverview() {
  const { data, isLoading, error, refetch } = useQuery<CloudResourcesOverview>({
    queryKey: ['cloudResourcesOverview'],
    queryFn: async () => {
      const response = await apiPost<CloudResourcesOverview>(
        OPERATION_IDS.GET_RESOURCES_OVERVIEW,
        {
          request: {},
        }
      );

      return response.responseData || {};
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    overview: data || {},
    isLoading,
    error,
    refetch,
  };
}
