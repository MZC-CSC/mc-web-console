/**
 * MCI TanStack Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mciService } from '@/services/mci';
import type { MCI, MciControlAction, CreateMciRequest } from '@/types/mci';

// Query keys
export const mciKeys = {
  all: ['mci'] as const,
  lists: () => [...mciKeys.all, 'list'] as const,
  list: (nsId: string) => [...mciKeys.lists(), nsId] as const,
  details: () => [...mciKeys.all, 'detail'] as const,
  detail: (nsId: string, mciId: string) => [...mciKeys.details(), nsId, mciId] as const,
};

/**
 * Hook to fetch MCI list
 */
export function useMciList(nsId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mciKeys.list(nsId),
    queryFn: () => mciService.getMciList(nsId),
    enabled: !!nsId && options?.enabled !== false,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

/**
 * Hook to fetch a single MCI
 */
export function useMci(nsId: string, mciId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: mciKeys.detail(nsId, mciId),
    queryFn: () => mciService.getMci(nsId, mciId),
    enabled: !!nsId && !!mciId && options?.enabled !== false,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}

/**
 * Hook to control MCI lifecycle
 */
export function useMciControl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      nsId,
      mciId,
      action,
    }: {
      nsId: string;
      mciId: string;
      action: MciControlAction;
    }) => mciService.controlMci(nsId, mciId, action),
    onSuccess: (_, { nsId, mciId }) => {
      // Invalidate the specific MCI and the list
      queryClient.invalidateQueries({ queryKey: mciKeys.detail(nsId, mciId) });
      queryClient.invalidateQueries({ queryKey: mciKeys.list(nsId) });
    },
  });
}

/**
 * Hook to delete MCI
 */
export function useMciDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nsId, mciId }: { nsId: string; mciId: string }) =>
      mciService.deleteMci(nsId, mciId),
    onSuccess: (_, { nsId }) => {
      // Invalidate the list
      queryClient.invalidateQueries({ queryKey: mciKeys.list(nsId) });
    },
  });
}

/**
 * Hook to create MCI
 */
export function useMciCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ nsId, request }: { nsId: string; request: CreateMciRequest }) =>
      mciService.createMciDynamic(nsId, request),
    onSuccess: (_, { nsId }) => {
      // Invalidate the list
      queryClient.invalidateQueries({ queryKey: mciKeys.list(nsId) });
    },
  });
}
