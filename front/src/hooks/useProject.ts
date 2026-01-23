'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project } from '@/types/workspace';

interface ProjectStore {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),
    }),
    {
      name: 'project-storage',
    }
  )
);

/**
 * Project 관리 Hook
 */
export function useProject() {
  return useProjectStore();
}
