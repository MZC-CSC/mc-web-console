'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Disk } from '@/types/resources';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Disk 목록 조회 Hook
 */
export function useDisks(nsId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<Disk[]>({
    queryKey: ['disks', nsId],
    queryFn: async () => {
      if (!nsId) {
        throw new Error('Namespace ID is required');
      }

      const response = await apiPost<Disk[]>(
        OPERATION_IDS.GET_DISK_LIST,
        {
          pathParams: {
            nsId,
          },
          request: {},
        }
      );

      return response.responseData || [];
    },
    enabled: !!nsId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    disks: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Disk 단건 조회 Hook
 */
export function useDisk(nsId: string | null, dataDiskId: string | null) {
  const { data, isLoading, error } = useQuery<Disk>({
    queryKey: ['disk', nsId, dataDiskId],
    queryFn: async () => {
      if (!nsId || !dataDiskId) {
        throw new Error('Namespace ID and Data Disk ID are required');
      }

      const response = await apiPost<Disk>(
        OPERATION_IDS.GET_DISK,
        {
          pathParams: {
            nsId,
            dataDiskId,
          },
          request: {},
        }
      );

      return response.responseData!;
    },
    enabled: !!nsId && !!dataDiskId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    disk: data,
    isLoading,
    error,
  };
}

/**
 * Disk 생성 Hook
 */
export function useCreateDisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, disk }: { nsId: string; disk: Omit<Disk, 'id'> }) => {
      const response = await apiPost<Disk>(
        OPERATION_IDS.CREATE_DISK,
        {
          pathParams: {
            nsId,
          },
          request: disk,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disks', variables.nsId] });
      toastSuccess('Disk가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Disk 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Disk 수정 Hook
 */
export function useUpdateDisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, dataDiskId, disk }: { nsId: string; dataDiskId: string; disk: Partial<Disk> }) => {
      const response = await apiPost<Disk>(
        OPERATION_IDS.UPDATE_DISK,
        {
          pathParams: {
            nsId,
            dataDiskId,
          },
          request: disk,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disks', variables.nsId] });
      queryClient.invalidateQueries({ queryKey: ['disk', variables.nsId, variables.dataDiskId] });
      toastSuccess('Disk가 수정되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Disk 수정에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Disk 삭제 Hook
 */
export function useDeleteDisk() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, dataDiskId }: { nsId: string; dataDiskId: string }) => {
      await apiPost(
        OPERATION_IDS.DELETE_DISK,
        {
          pathParams: {
            nsId,
            dataDiskId,
          },
          request: {},
        }
      );

      return dataDiskId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['disks', variables.nsId] });
      toastSuccess('Disk가 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Disk 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
