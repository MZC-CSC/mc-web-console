'use client';

import { FormSelect } from '@/components/common/FormSelect';
import { useUserWorkspaces } from '@/hooks/api/useWorkspaces';
import { useWorkspaceProjects } from '@/hooks/api/useProjects';
import { Workspace } from '@/types/workspace';
import { Project } from '@/types/workspace';

interface WorkspaceProjectSelectorProps {
  selectedWorkspaceId?: string;
  selectedProjectId?: string;
  onWorkspaceChange: (workspaceId: string) => void;
  onProjectChange: (projectId: string) => void;
  className?: string;
}

/**
 * MCI Workloads 화면용 Workspace/Project 선택 컴포넌트
 * 사용자에게 할당된 워크스페이스 목록을 조회하고,
 * 워크스페이스 선택 시 해당 워크스페이스의 프로젝트 목록을 조회합니다.
 */
export function WorkspaceProjectSelector({
  selectedWorkspaceId,
  selectedProjectId,
  onWorkspaceChange,
  onProjectChange,
  className,
}: WorkspaceProjectSelectorProps) {
  const { workspaces, isLoading: isWorkspacesLoading } = useUserWorkspaces();
  const { projects, isLoading: isProjectsLoading } = useWorkspaceProjects(selectedWorkspaceId);

  const workspaceOptions = workspaces.map((workspace: Workspace) => ({
    value: workspace.id,
    label: workspace.name,
  }));

  const projectOptions = projects.map((project: Project) => ({
    value: project.id,
    label: project.name,
  }));

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className || ''}`}>
      <FormSelect
        label="Workspace"
        value={selectedWorkspaceId || ''}
        onChange={onWorkspaceChange}
        options={workspaceOptions}
        placeholder="Workspace 선택"
        disabled={isWorkspacesLoading}
        helperText={
          isWorkspacesLoading
            ? 'Workspace 목록 조회 중...'
            : workspaceOptions.length === 0
              ? '할당된 Workspace가 없습니다.'
              : undefined
        }
        required
      />

      <FormSelect
        label="Project"
        value={selectedProjectId || ''}
        onChange={onProjectChange}
        options={projectOptions}
        placeholder={selectedWorkspaceId ? 'Project 선택' : 'Workspace를 먼저 선택하세요'}
        disabled={!selectedWorkspaceId || isProjectsLoading}
        helperText={
          !selectedWorkspaceId
            ? 'Workspace를 먼저 선택하세요'
            : isProjectsLoading
              ? 'Project 목록 조회 중...'
              : projectOptions.length === 0
                ? 'Project가 없습니다.'
                : undefined
        }
        required
      />
    </div>
  );
}
