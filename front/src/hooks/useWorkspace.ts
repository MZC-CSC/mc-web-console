'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Workspace } from '@/types/workspace';

interface WorkspaceStore {
  currentWorkspace: Workspace | null;
  setCurrentWorkspace: (workspace: Workspace | null) => void;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set) => ({
      currentWorkspace: null,
      setCurrentWorkspace: (workspace) => set({ currentWorkspace: workspace }),
    }),
    {
      name: 'workspace-storage',
    }
  )
);

/**
 * Workspace 관리 Hook
 */
export function useWorkspace() {
  return useWorkspaceStore();
}
