'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MyImage } from '@/types/resources';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * My Image 목록 조회 Hook
 */
export function useMyImages(nsId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<MyImage[]>({
    queryKey: ['myImages', nsId],
    queryFn: async () => {
      if (!nsId) {
        throw new Error('Namespace ID is required');
      }

      const response = await apiPost<MyImage[]>(
        OPERATION_IDS.GET_MY_IMAGE_LIST,
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
    myImages: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * My Image 단건 조회 Hook
 */
export function useMyImage(nsId: string | null, customImageId: string | null) {
  const { data, isLoading, error } = useQuery<MyImage>({
    queryKey: ['myImage', nsId, customImageId],
    queryFn: async () => {
      if (!nsId || !customImageId) {
        throw new Error('Namespace ID and Custom Image ID are required');
      }

      const response = await apiPost<MyImage>(
        OPERATION_IDS.GET_MY_IMAGE,
        {
          pathParams: {
            nsId,
            customImageId,
          },
          request: {},
        }
      );

      return response.responseData!;
    },
    enabled: !!nsId && !!customImageId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    myImage: data,
    isLoading,
    error,
  };
}

/**
 * My Image 생성 Hook
 */
export function useCreateMyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, myImage }: { nsId: string; myImage: Omit<MyImage, 'id'> }) => {
      const response = await apiPost<MyImage>(
        OPERATION_IDS.CREATE_MY_IMAGE,
        {
          pathParams: {
            nsId,
          },
          request: myImage,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myImages', variables.nsId] });
      toastSuccess('My Image가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'My Image 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * My Image 삭제 Hook
 */
export function useDeleteMyImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, customImageId }: { nsId: string; customImageId: string }) => {
      await apiPost(
        OPERATION_IDS.DELETE_MY_IMAGE,
        {
          pathParams: {
            nsId,
            customImageId,
          },
          request: {},
        }
      );

      return customImageId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['myImages', variables.nsId] });
      toastSuccess('My Image가 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'My Image 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
