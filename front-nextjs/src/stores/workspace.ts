/**
 * Workspace Store
 * Manages workspace and project state using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Workspace, Project } from '@/types';

interface WorkspaceState {
  currentWorkspace: Workspace | null;
  currentProject: Project | null;
  workspaces: Workspace[];
  projects: Project[];
  isLoading: boolean;

  // Actions
  setCurrentWorkspace: (workspace: Workspace | null) => void;
  setCurrentProject: (project: Project | null) => void;
  setWorkspaces: (workspaces: Workspace[]) => void;
  setProjects: (projects: Project[]) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspace: null,
      currentProject: null,
      workspaces: [],
      projects: [],
      isLoading: false,

      setCurrentWorkspace: (workspace: Workspace | null) => {
        set({ currentWorkspace: workspace, currentProject: null });
      },

      setCurrentProject: (project: Project | null) => {
        set({ currentProject: project });
      },

      setWorkspaces: (workspaces: Workspace[]) => {
        set({ workspaces });
      },

      setProjects: (projects: Project[]) => {
        set({ projects });
      },

      clearWorkspace: () => {
        set({
          currentWorkspace: null,
          currentProject: null,
          workspaces: [],
          projects: [],
        });
      },
    }),
    {
      name: 'workspace-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
