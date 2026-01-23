'use client';

import { useMemo } from 'react';
import { TreeNode } from '@/types/workspace';
import { useAccessControls } from './useAccessControls';

/**
 * Platform Access 트리 데이터 조회 Hook
 * AccessControl 목록을 TreeNode 구조로 변환
 */
export function usePlatformAccessTree(workspaceId: string | null) {
  const { accessControls, isLoading, error } = useAccessControls(workspaceId, 'mciam');

    const treeData: TreeNode[] = useMemo(() => {
    if (!accessControls || accessControls.length === 0) {
      return [];
    }

    // AccessControl을 TreeNode로 변환
    // TODO: 실제 API 응답 구조에 맞춰 변환 로직 수정 필요
    return accessControls.map((control) => ({
      id: control.operationId || control.id,
      text: control.operationId || control.resource || 'Unknown',
      children: control.policies
        ? control.policies.map((policy) => ({
            id: `${control.id}-${policy.id || 'policy'}`,
            text: policy.name || policy.effect || 'Policy',
            state: {
              selected: false,
              opened: false,
            },
          }))
        : undefined,
      state: {
        selected: false,
        opened: false,
      },
    }));
  }, [accessControls]);

  return {
    treeData,
    isLoading,
    error,
  };
}
