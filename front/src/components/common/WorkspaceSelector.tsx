'use client';

import { useEffect } from 'react';
import { FormSelect } from './FormSelect';
import { useWorkspaces } from '@/hooks/api/useWorkspaces';
import { useWorkspace } from '@/hooks/useWorkspace';

interface WorkspaceSelectorProps {
  className?: string;
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function WorkspaceSelector({ className, onWorkspaceChange }: WorkspaceSelectorProps) {
  const { workspaces, isLoading, error } = useWorkspaces();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();

  // 오류 발생 시 로깅 (이미 useWorkspaces와 apiPost에서 상세 로깅됨)
  useEffect(() => {
    if (error) {
      console.error('[WorkspaceSelector] Workspace 목록 조회 실패:', error);
    }
  }, [error]);

  const handleChange = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
      onWorkspaceChange?.(workspaceId);
    }
  };

  const options = workspaces.map((workspace) => ({
    value: workspace.id,
    label: workspace.name,
  }));

  // helperText 결정: error가 있으면 표시되지 않음 (FormSelect 로직)
  const helperText = 
    isLoading ? "조회 중..." :
    error ? undefined :
    options.length === 0 ? "워크스페이스가 없습니다." :
    undefined;

  return (
    <FormSelect
      label="Workspace"
      value={currentWorkspace?.id || ''}
      onChange={handleChange}
      options={options}
      placeholder="Workspace 선택"
      disabled={isLoading}
      helperText={helperText}
      error={error ? "워크스페이스 목록을 불러올 수 없습니다." : undefined}
      className={className}
    />
  );
}
