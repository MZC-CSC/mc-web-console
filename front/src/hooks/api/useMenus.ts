'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MenuItem, BackendMenuItem, convertBackendMenusToMenuItems } from '@/types/menu';
import { OPERATION_IDS } from '@/constants/api';
import { apiPost } from '@/lib/api/client';
import { toastSuccess } from '@/lib/utils/toast';
import { handleError } from '@/lib/utils/errorHandler';

/**
 * Menu 목록 조회 Hook
 * 관리 화면에서 사용하는 전체 메뉴 목록 조회
 */
export function useMenus() {
  const { data, isLoading, error, refetch } = useQuery<MenuItem[]>({
    queryKey: ['menus'],
    queryFn: async () => {
      const requestData = {
        request: {},
      };
      
      // ListMenus operationId 사용 (관리 화면용)
      const response = await apiPost<BackendMenuItem[]>(
        OPERATION_IDS.GET_MENU_LIST,
        requestData
      );

      const backendMenus = response.responseData || [];
      
      // 백엔드 메뉴를 프론트엔드 타입으로 변환 (평면 배열)
      const convertedMenus = convertBackendMenusToMenuItems(backendMenus);
      
      return convertedMenus;
    },
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    menus: data || [],
    isLoading,
    error,
    refetch,
  };
}

/**
 * Menu 단건 조회 Hook
 */
export function useMenu(menuId: string | null) {
  const { data, isLoading, error } = useQuery<MenuItem>({
    queryKey: ['menu', menuId],
    queryFn: async () => {
      if (!menuId) {
        throw new Error('Menu ID is required');
      }

      // GetMenuByID operationId 사용, PathParams에 menuId 설정
      const response = await apiPost<BackendMenuItem>(
        OPERATION_IDS.GET_MENU_BY_ID,
        {
          pathParams: {
            menuId: menuId,
          },
          request: {},
        }
      );

      const backendMenu = response.responseData!;
      
      // 백엔드 메뉴를 프론트엔드 타입으로 변환
      const { convertBackendMenuToMenuItem } = await import('@/types/menu');
      return convertBackendMenuToMenuItem(backendMenu);
    },
    enabled: !!menuId,
    staleTime: 1000 * 60 * 5, // 5분
  });

  return {
    menu: data,
    isLoading,
    error,
  };
}

/**
 * Menu 생성 Hook
 */
export function useCreateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menu: {
      displayName: string;
      parentMenuId?: string;
      priority: number;
      menunumber?: number;
      isAction: boolean;
      path?: string;
    }) => {
      const response = await apiPost<BackendMenuItem>(
        OPERATION_IDS.CREATE_MENU,
        {
          request: menu,
        }
      );

      const backendMenu = response.responseData!;
      
      // 백엔드 메뉴를 프론트엔드 타입으로 변환
      const { convertBackendMenuToMenuItem } = await import('@/types/menu');
      return convertBackendMenuToMenuItem(backendMenu);
    },
    onSuccess: () => {
      // 메뉴 관리 화면과 Sidebar 모두 갱신
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toastSuccess('메뉴가 생성되었습니다.');
    },
    onError: (error) => {
      handleError(error, {
        operationId: OPERATION_IDS.CREATE_MENU,
        fallbackMessage: '메뉴 생성에 실패했습니다.',
      });
    },
  });
}

/**
 * Menu 수정 Hook
 */
export function useUpdateMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...menu }: {
      id: string;
      displayName?: string;
      parentMenuId?: string;
      priority?: number;
      menunumber?: number;
      isAction?: boolean;
      path?: string;
    }) => {
      // UpdateMenu operationId 사용, PathParams에 menuId 설정
      // priority는 백엔드에서 string으로 받으므로 string으로 변환
      const requestData: Record<string, unknown> = {};
      
      if (menu.displayName !== undefined) {
        requestData.displayName = menu.displayName;
      }
      if (menu.parentMenuId !== undefined) {
        requestData.parentMenuId = menu.parentMenuId;
      }
      if (menu.priority !== undefined) {
        // priority는 string으로 전송
        requestData.priority = String(menu.priority);
      }
      if (menu.menunumber !== undefined) {
        requestData.menunumber = menu.menunumber;
      }
      if (menu.isAction !== undefined) {
        requestData.isAction = menu.isAction;
      }
      if (menu.path !== undefined) {
        requestData.path = menu.path;
      }

      const response = await apiPost<BackendMenuItem>(
        OPERATION_IDS.UPDATE_MENU,
        {
          pathParams: {
            menuId: id,
          },
          request: requestData,
        }
      );

      const backendMenu = response.responseData!;
      
      // 백엔드 메뉴를 프론트엔드 타입으로 변환
      const { convertBackendMenuToMenuItem } = await import('@/types/menu');
      return convertBackendMenuToMenuItem(backendMenu);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toastSuccess('메뉴가 수정되었습니다.');
    },
    onError: (error) => {
      handleError(error, {
        operationId: OPERATION_IDS.UPDATE_MENU,
        fallbackMessage: '메뉴 수정에 실패했습니다.',
      });
    },
  });
}

/**
 * Menu 삭제 Hook
 */
export function useDeleteMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuId: string) => {
      // DeleteMenu operationId 사용, PathParams에 menuId 설정
      await apiPost(
        OPERATION_IDS.DELETE_MENU,
        {
          pathParams: {
            menuId: menuId,
          },
          request: {},
        }
      );

      return menuId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menus'] });
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      toastSuccess('메뉴가 삭제되었습니다.');
    },
    onError: (error) => {
      handleError(error, {
        operationId: OPERATION_IDS.DELETE_MENU,
        fallbackMessage: '메뉴 삭제에 실패했습니다.',
      });
    },
  });
}
