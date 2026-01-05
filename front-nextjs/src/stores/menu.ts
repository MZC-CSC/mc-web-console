/**
 * Menu Store
 * Manages navigation menu state using Zustand
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MenuItem } from '@/types';

interface MenuState {
  menuItems: MenuItem[];
  expandedItems: string[];
  activeItem: string | null;
  sidebarOpen: boolean;

  // Actions
  setMenuItems: (items: MenuItem[]) => void;
  toggleExpanded: (itemId: string) => void;
  setActiveItem: (itemId: string | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  clearMenu: () => void;
}

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      menuItems: [],
      expandedItems: [],
      activeItem: null,
      sidebarOpen: true,

      setMenuItems: (items: MenuItem[]) => {
        set({ menuItems: items });
      },

      toggleExpanded: (itemId: string) => {
        const { expandedItems } = get();
        const isExpanded = expandedItems.includes(itemId);

        set({
          expandedItems: isExpanded
            ? expandedItems.filter((id) => id !== itemId)
            : [...expandedItems, itemId],
        });
      },

      setActiveItem: (itemId: string | null) => {
        set({ activeItem: itemId });
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open: boolean) => {
        set({ sidebarOpen: open });
      },

      clearMenu: () => {
        set({
          menuItems: [],
          expandedItems: [],
          activeItem: null,
        });
      },
    }),
    {
      name: 'menu-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        menuItems: state.menuItems,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
