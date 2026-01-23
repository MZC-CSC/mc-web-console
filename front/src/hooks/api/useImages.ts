'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Image } from '@/types/resources';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';
import { toastSuccess, toastError } from '@/lib/utils/toast';

/**
 * Image 목록 조회 Hook
 */
export function useImages(nsId: string | null) {
  const { data, isLoading, error, refetch } = useQuery<Image[]>({
    queryKey: ['images', nsId],
    queryFn: async () => {
      if (!nsId) {
        throw new Error('Namespace ID is required');
      }

      const response = await apiPost<Image[]>(
        OPERATION_IDS.GET_IMAGE_LIST,
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
    images: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Image 단건 조회 Hook
 */
export function useImage(nsId: string | null, imageId: string | null) {
  const { data, isLoading, error } = useQuery<Image>({
    queryKey: ['image', nsId, imageId],
    queryFn: async () => {
      if (!nsId || !imageId) {
        throw new Error('Namespace ID and Image ID are required');
      }

      const response = await apiPost<Image>(
        OPERATION_IDS.GET_IMAGE,
        {
          pathParams: {
            nsId,
            imageId,
          },
          request: {},
        }
      );

      return response.responseData!;
    },
    enabled: !!nsId && !!imageId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    image: data,
    isLoading,
    error,
  };
}

/**
 * Image 생성 Hook
 */
export function useCreateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, image }: { nsId: string; image: Omit<Image, 'id'> }) => {
      const response = await apiPost<Image>(
        OPERATION_IDS.CREATE_IMAGE,
        {
          pathParams: {
            nsId,
          },
          request: image,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['images', variables.nsId] });
      toastSuccess('Image가 생성되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Image 생성에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Image 수정 Hook
 */
export function useUpdateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, imageId, image }: { nsId: string; imageId: string; image: Partial<Image> }) => {
      const response = await apiPost<Image>(
        OPERATION_IDS.UPDATE_IMAGE,
        {
          pathParams: {
            nsId,
            imageId,
          },
          request: image,
        }
      );

      return response.responseData!;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['images', variables.nsId] });
      queryClient.invalidateQueries({ queryKey: ['image', variables.nsId, variables.imageId] });
      toastSuccess('Image가 수정되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Image 수정에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}

/**
 * Image 삭제 Hook
 */
export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ nsId, imageId }: { nsId: string; imageId: string }) => {
      await apiPost(
        OPERATION_IDS.DELETE_IMAGE,
        {
          pathParams: {
            nsId,
            imageId,
          },
          request: {},
        }
      );

      return imageId;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['images', variables.nsId] });
      toastSuccess('Image가 삭제되었습니다.');
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'Image 삭제에 실패했습니다.';
      toastError(errorMessage);
    },
  });
}
