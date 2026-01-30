'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUserWorkspaces } from '@/hooks/api/useWorkspaces';
import { useWorkspaceProjects } from '@/hooks/api/useProjects';
import { useWorkspace } from '@/hooks/useWorkspace';
import { useProject } from '@/hooks/useProject';

/**
 * Workspace/Project 선택 및 복원을 위한 공통 Hook
 * 
 * 모든 화면에서 Workspace와 Project 선택 시:
 * 1. 선택된 값을 localStorage에 저장
 * 2. 페이지 로드 시 저장된 값을 복원
 * 3. Workspace 변경 시 Project 자동 초기화
 * 
 * @returns Workspace/Project 선택 상태 및 핸들러
 */
export function useWorkspaceProjectSelection() {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isRestored, setIsRestored] = useState(false);

  // 렌더링 카운터 (디버깅용)
  const renderCount = useRef(0);
  renderCount.current += 1;

  // Workspace/Project 목록 조회 및 세션 저장 hooks
  const { workspaces } = useUserWorkspaces();
  const { currentWorkspace, setCurrentWorkspace } = useWorkspace();
  const { currentProject, setCurrentProject } = useProject();

  // 선택된 workspace의 project 목록 조회
  const { projects } = useWorkspaceProjects(selectedWorkspaceId);

  // 최신 값을 ref에 저장 (useCallback 안정화용)
  // 렌더 중에 ref 업데이트 (useEffect 불필요)
  const workspacesRef = useRef(workspaces);
  const projectsRef = useRef(projects);
  workspacesRef.current = workspaces;
  projectsRef.current = projects;

  // 복원 완료 플래그
  const hasRestoredRef = useRef(false);
  const isRestoringRef = useRef(false);

  // Workspace 복원 (1단계)
  useEffect(() => {
    if (hasRestoredRef.current || selectedWorkspaceId) {
      return;
    }

    const hasWorkspaces = workspaces.length > 0;
    const hasSavedWorkspace = !!currentWorkspace?.id;

    if (hasWorkspaces && hasSavedWorkspace) {
      const workspaceExists = workspaces.some((w) => w.id === currentWorkspace.id);
      if (workspaceExists) {
        isRestoringRef.current = true;
        setSelectedWorkspaceId(currentWorkspace.id);
      }
    }
  }, [workspaces.length, currentWorkspace?.id, selectedWorkspaceId]);

  // Project 복원 (2단계)
  useEffect(() => {
    if (hasRestoredRef.current || !selectedWorkspaceId || selectedProjectId) {
      return;
    }

    const hasProjects = projects.length > 0;
    const hasSavedProject = !!currentProject?.id;
    const workspaceMatches = selectedWorkspaceId === currentWorkspace?.id;

    if (hasProjects && hasSavedProject && workspaceMatches) {
      const projectExists = projects.some((p) => p.id === currentProject.id);
      if (projectExists) {
        setSelectedProjectId(currentProject.id);
        setIsRestored(true);
        hasRestoredRef.current = true;
        isRestoringRef.current = false;
      }
    }
  }, [projects.length, currentProject?.id, selectedWorkspaceId, currentWorkspace?.id, selectedProjectId]);

  // 수동 선택 시 복원 완료 마크
  useEffect(() => {
    if (selectedWorkspaceId && selectedProjectId && !isRestored && !isRestoringRef.current) {
      setIsRestored(true);
      hasRestoredRef.current = true;
    }
  }, [selectedWorkspaceId, selectedProjectId, isRestored]);

  // Workspace 수동 변경 시 Project 선택 초기화 (복원 중이 아닐 때만)
  const prevWorkspaceIdRef = useRef(selectedWorkspaceId);
  useEffect(() => {
    // 복원 중이거나 최초 마운트 시에는 초기화하지 않음
    if (isRestoringRef.current || !prevWorkspaceIdRef.current) {
      prevWorkspaceIdRef.current = selectedWorkspaceId;
      return;
    }

    // Workspace가 실제로 변경되었을 때만 Project 초기화
    if (selectedWorkspaceId && selectedWorkspaceId !== prevWorkspaceIdRef.current) {
      setSelectedProjectId('');
      setIsRestored(false);
      hasRestoredRef.current = false;
    }

    prevWorkspaceIdRef.current = selectedWorkspaceId;
  }, [selectedWorkspaceId]);

  // Workspace 변경 핸들러 (useCallback으로 최적화)
  const handleWorkspaceChange = useCallback((workspaceId: string) => {
    // 복원 플래그 리셋 (수동 변경이므로)
    isRestoringRef.current = false;
    hasRestoredRef.current = false;

    setSelectedWorkspaceId(workspaceId);

    // workspace 객체 찾기 및 세션에 저장 (ref에서 최신 값 가져오기)
    const workspace = workspacesRef.current.find((w) => w.id === workspaceId);
    if (workspace) {
      setCurrentWorkspace(workspace);
    }
  }, []); // 의존성 배열 비우기

  // Project 변경 핸들러 (useCallback으로 최적화)
  const handleProjectChange = useCallback((projectId: string) => {
    // 복원 플래그 리셋 (수동 변경이므로)
    isRestoringRef.current = false;

    setSelectedProjectId(projectId);

    // project 객체 찾기 및 세션에 저장 (ref에서 최신 값 가져오기)
    const project = projectsRef.current.find((p) => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  }, []); // 의존성 배열 비우기

  // 선택된 project 객체 (useMemo로 최적화)
  const selectedProject = useMemo(() => {
    return Array.isArray(projects)
      ? projects.find((p) => p.id === selectedProjectId)
      : undefined;
  }, [projects, selectedProjectId]);

  // Workspace/Project 선택 여부 확인 (useMemo로 최적화)
  const isWorkspaceProjectSelected = useMemo(() => {
    return !!selectedWorkspaceId && !!selectedProjectId;
  }, [selectedWorkspaceId, selectedProjectId]);

  // 디버깅: 개발 모드에서 렌더링 카운트 모니터링 (경고 제거)
  // Development 모드에서 10-20회 렌더링은 정상 범위 (Strict Mode, HMR, React Query 등)
  if (renderCount.current === 1) {
    console.log('[useWorkspaceProjectSelection] Hook initialized');
  }
  if (renderCount.current > 20) {
    console.warn('[useWorkspaceProjectSelection] High render count detected:', {
      count: renderCount.current,
      selectedWorkspaceId,
      selectedProjectId,
      isRestored,
      workspacesCount: workspaces.length,
      projectsCount: projects.length,
    });
  }

  return {
    // 상태
    selectedWorkspaceId,
    selectedProjectId,
    selectedProject,
    workspaces,
    projects,
    isWorkspaceProjectSelected,
    isRestored,
    // 핸들러
    handleWorkspaceChange,
    handleProjectChange,
    // 직접 setter (필요한 경우)
    setSelectedWorkspaceId,
    setSelectedProjectId,
  };
}
