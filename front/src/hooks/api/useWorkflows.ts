'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { ApiResponse } from '@/types/common';

/**
 * Workflow 관리 Hook
 * mc-workflow-manager API 연동
 */

interface Workflow {
  workflowIdx: number;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft' | 'error';
  type: 'manual' | 'scheduled' | 'triggered';
  steps: Array<{
    stepIdx: number;
    name: string;
    type: string;
    order: number;
  }>;
  lastExecutedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface WorkflowExecution {
  executionIdx: number;
  workflowIdx: number;
  status: 'running' | 'success' | 'failed' | 'pending';
  startedAt: Date;
  completedAt?: Date;
  result?: string;
}

/**
 * Workflow 목록 조회 Hook
 */
export function useWorkflows(): {
  workflows: Workflow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const { data, isLoading, error, refetch } = useQuery<ApiResponse<Workflow[]>>({
    queryKey: ['workflows'],
    queryFn: async () => {
      const response = await apiPost<Workflow[]>(
        OPERATION_IDS.GET_WORKFLOW_LIST_USING_G_E_T_1,
        {
          request: {},
        }
      );

      return response;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    workflows: data?.responseData || [],
    isLoading,
    error: error as Error | null,
    refetch: refetch as () => void,
  };
}

/**
 * Workflow 상세 조회 Hook
 */
export function useWorkflowDetail(workflowIdx?: number) {
  const { data, isLoading, error } = useQuery<ApiResponse<Workflow>>({
    queryKey: ['workflow', workflowIdx],
    queryFn: async () => {
      if (!workflowIdx) {
        throw new Error('Workflow ID is required');
      }

      const response = await apiPost<Workflow>(
        OPERATION_IDS.GET_WORKFLOW_USING_G_E_T,
        {
          pathParams: {
            workflowIdx: String(workflowIdx),
          },
        }
      );

      return response;
    },
    enabled: !!workflowIdx,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    workflow: data?.responseData,
    isLoading,
    error,
  };
}

/**
 * Workflow 실행 Hook
 */
export function useRunWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowIdx: number) => {
      const response = await apiPost(
        OPERATION_IDS.RUN_WORKFLOW_GET_USING_G_E_T,
        {
          pathParams: {
            workflowIdx: String(workflowIdx),
          },
        }
      );

      return response.responseData;
    },
    onSuccess: () => {
      // Workflow 목록 갱신
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
    },
  });
}

/**
 * Workflow 실행 히스토리 조회 Hook
 */
export function useWorkflowExecutions(workflowIdx?: number): {
  executions: WorkflowExecution[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery<ApiResponse<WorkflowExecution[]>>({
    queryKey: ['workflow-executions', workflowIdx],
    queryFn: async () => {
      if (!workflowIdx) {
        return { status: { code: 0, message: 'No workflowIdx' }, responseData: [] };
      }

      const response = await apiPost<WorkflowExecution[]>(
        OPERATION_IDS.GET_WORKFLOW_HISTORY_LIST_USING_G_E_T,
        {
          pathParams: {
            workflowIdx: String(workflowIdx),
          },
        }
      );

      return response;
    },
    enabled: !!workflowIdx,
    staleTime: 1000 * 60 * 2, // 2분
  });

  return {
    executions: data?.responseData || [],
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Workflow 생성 Hook
 */
export function useCreateWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflow: Partial<Workflow>) => {
      const response = await apiPost(
        OPERATION_IDS.REGIST_WORKFLOW_USING_P_O_S_T,
        {
          request: workflow,
        }
      );

      return response.responseData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}

/**
 * Workflow 삭제 Hook
 */
export function useDeleteWorkflow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workflowIdx: number) => {
      await apiPost(
        OPERATION_IDS.DELETE_WORKFLOW_USING_D_E_L_E_T_E,
        {
          pathParams: {
            workflowIdx: String(workflowIdx),
          },
        }
      );

      return workflowIdx;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
  });
}
