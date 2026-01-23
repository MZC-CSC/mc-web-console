'use client';

import { useQuery } from '@tanstack/react-query';
import { MenuItem, BackendMenuItem, convertBackendMenusToMenuItems } from '@/types/menu';
import { OPERATION_IDS } from '@/constants/api';
import { apiPostByPath } from '@/lib/api/client';

const MENU_STORAGE_KEY = 'menuList';

/**
 * localStorage에서 메뉴 조회
 * Get menu from localStorage
 */
function getMenuFromStorage(): MenuItem[] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = localStorage.getItem(MENU_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('Failed to parse menu from localStorage:', error);
    // 손상된 데이터 삭제
    // Delete corrupted data
    localStorage.removeItem(MENU_STORAGE_KEY);
    return null;
  }
}

/**
 * 메뉴 조회 및 관리 Hook
 */
export function useMenu() {
  const { data, isLoading } = useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: async () => {
      // localStorage에서 먼저 조회
      // Check localStorage first
      const storedMenus = getMenuFromStorage();
      if (storedMenus && storedMenus.length > 0) {
        // localStorage에 데이터가 있으면 우선 반환하고 백그라운드에서 갱신
        // Return stored data first and refresh in background
        fetchMenuFromAPI().catch((error) => {
          console.error('Background menu refresh failed:', error);
        });
        return storedMenus;
      }

      // localStorage에 데이터가 없으면 API 호출
      // Call API if no data in localStorage
      return await fetchMenuFromAPI();
    },
    staleTime: 1000 * 60 * 5, // 5분
    cacheTime: 1000 * 60 * 30, // 30분
  });

  return {
    menuItems: data || [],
    isLoading,
  };
}

/**
 * API에서 메뉴 조회
 * Fetch menu from API
 */
async function fetchMenuFromAPI(): Promise<MenuItem[]> {
  try {
    // API에서 메뉴 조회
    // Call menu API
    const response = await apiPostByPath<BackendMenuItem[]>(
      '/api/getmenutree',
      OPERATION_IDS.GET_MENU_LIST,
      {
        request: {},
      }
    );

    const backendMenus = response.responseData || [];

    if (backendMenus.length === 0) {
      // API에서 메뉴가 없으면 빈 배열 반환 (API 응답만 사용)
      // Return empty array if API returns empty (use only API response)
      return [];
    }

    // 백엔드 메뉴를 프론트엔드 타입으로 변환
    // Convert backend menu to frontend type
    const convertedMenus = convertBackendMenusToMenuItems(backendMenus);

    // API 메뉴만 사용 (정적 메뉴 병합 제거)
    // Use only API menu (no static menu merge)
    const menuTree = buildMenuTree(convertedMenus);

    // localStorage에 저장
    // Store in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(menuTree));
    }

    return menuTree;
  } catch (error) {
    console.error('Menu fetch error:', error);
    
    // API 실패 시 localStorage에서 조회 시도
    // Try to get from localStorage on API failure
    const storedMenus = getMenuFromStorage();
    if (storedMenus && storedMenus.length > 0) {
      return storedMenus;
    }

    // localStorage에도 없으면 빈 배열 반환 (API 응답만 사용)
    // Return empty array if both API and localStorage fail (use only API response)
    return [];
  }
}


/**
 * 메뉴 트리 구조 생성
 * Build menu tree structure from flat array using parentId
 * 
 * 백엔드에서 받은 평면 배열을 parentId를 따라 트리 구조로 변환합니다.
 * Converts flat array from backend to tree structure following parentId.
 */
function buildMenuTree(items: MenuItem[]): MenuItem[] {
  const itemMap = new Map<string, MenuItem>();
  const rootItems: MenuItem[] = [];

  // 모든 아이템을 Map에 저장 (menus 배열 초기화)
  // Store all items in Map (initialize menus array)
  items.forEach((item) => {
    itemMap.set(item.id, { ...item, menus: [] });
  });

  // 부모-자식 관계 설정
  // Set parent-child relationships
  items.forEach((item) => {
    const menuItem = itemMap.get(item.id)!;
    
    // parentId가 있고 'home'이 아닌 경우 부모 찾기
    // Find parent if parentId exists and is not 'home'
    if (item.parentId && item.parentId !== 'home' && item.parentId !== '') {
      const parent = itemMap.get(item.parentId);
      if (parent) {
        // 부모를 찾았으면 자식으로 추가
        // Add as child if parent found
        if (!parent.menus) {
          parent.menus = [];
        }
        parent.menus.push(menuItem);
      } else {
        // 부모를 찾을 수 없으면 루트에 추가
        // Add to root if parent not found
        rootItems.push(menuItem);
      }
    } else {
      // parentId가 없거나 'home'이면 루트에 추가
      // Add to root if no parentId or parentId is 'home'
      rootItems.push(menuItem);
    }
  });

  // 재귀적으로 우선순위로 정렬
  // Recursively sort by priority
  const sortMenus = (menus: MenuItem[]) => {
    menus.sort((a, b) => {
      // priority로 먼저 정렬
      // Sort by priority first
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      // priority가 같으면 menuNumber로 정렬
      // Sort by menuNumber if priority is same
      return (a.menuNumber || 0) - (b.menuNumber || 0);
    });
    
    // 각 메뉴의 하위 메뉴도 정렬
    // Sort child menus recursively
    menus.forEach((menu) => {
      if (menu.menus && menu.menus.length > 0) {
        sortMenus(menu.menus);
      }
    });
  };

  sortMenus(rootItems);

  return rootItems;
}
