import { MenuItem } from '@/types/menu';

/**
 * 기본 메뉴 구조 (정적 메뉴)
 * 동적 메뉴는 API에서 받아와서 병합
 */
export const STATIC_MENU_ITEMS: Omit<MenuItem, 'menuNumber'>[] = [
  {
    id: 'dashboard',
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'LayoutDashboard',
    parentId: '',
    priority: 1,
    isAction: false,
  },
  {
    id: 'operations',
    name: 'Operations',
    path: '/operations',
    icon: 'Settings',
    parentId: '',
    priority: 2,
    isAction: false,
  },
  {
    id: 'workspaces',
    name: 'Workspaces',
    path: '/operations/manage/workspaces',
    parentId: 'operations',
    priority: 1,
    isAction: false,
  },
  // ... 기타 메뉴
];
