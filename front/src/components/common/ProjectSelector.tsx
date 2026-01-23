'use client';

import { FormSelect } from './FormSelect';
import { useWorkspaceProjects } from '@/hooks/api/useProjects';
import { useProject } from '@/hooks/useProject';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useWorkspaces } from '@/hooks/api/useWorkspaces';
import { useEffect } from 'react';

interface ProjectSelectorProps {
  className?: string;
  onProjectChange?: (projectId: string) => void;
}

export function ProjectSelector({ className, onProjectChange }: ProjectSelectorProps) {
  const { currentWorkspace } = useWorkspace();
  const { isLoading: isWorkspacesLoading } = useWorkspaces();
  const { projects, isLoading, refetch } = useWorkspaceProjects(currentWorkspace?.id);
  const { currentProject, setCurrentProject } = useProject();

  // WorkspaceSelector 조회가 끝나고 Workspace가 선택되면 Project 목록 조회
  useEffect(() => {
    // WorkspaceSelector가 로딩 중이 아니고, Workspace가 선택된 경우에만 조회
    if (!isWorkspacesLoading && currentWorkspace?.id) {
      refetch();
    }
  }, [isWorkspacesLoading, currentWorkspace?.id, refetch]);

  const handleChange = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setCurrentProject(project);
      onProjectChange?.(projectId);
    }
  };

  const options = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }));

  const isDisabled = isWorkspacesLoading || !currentWorkspace || isLoading;
  
  const helperText = 
    isWorkspacesLoading ? "Workspace 목록 조회 중..." :
    !currentWorkspace ? "Workspace를 먼저 선택하세요" :
    isLoading ? "Project 목록 조회 중..." :
    options.length === 0 ? "Project가 없습니다." :
    undefined;

  return (
    <FormSelect
      label="Project"
      value={currentProject?.id || ''}
      onChange={handleChange}
      options={options}
      placeholder="Project 선택"
      disabled={isDisabled}
      helperText={helperText}
      className={className}
    />
  );
}
