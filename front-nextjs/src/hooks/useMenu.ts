/**
 * Menu TanStack Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuService } from '@/services/menu';
import type {
  MenuResource,
  MenuTreeNode,
  CreateMenuRequest,
  UpdateMenuRequest,
  GetRoleMenusRequest,
} from '@/types/menu';

// Query keys
export const menuKeys = {
  all: ['menu'] as const,
  lists: () => [...menuKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...menuKeys.lists(), filters] as const,
  tree: () => [...menuKeys.all, 'tree'] as const,
  available: () => [...menuKeys.all, 'available'] as const,
  roleMenus: () => [...menuKeys.all, 'roleMenus'] as const,
  roleMenu: (roleIds: string[]) => [...menuKeys.roleMenus(), roleIds] as const,
};

/**
 * Hook to fetch all menu resources
 */
export function useMenuList(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: menuKeys.list(),
    queryFn: () => menuService.getMenuList(),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch menu tree structure
 */
export function useMenuTree(options?: { enabled?: boolean }) {
  const { data: menuList, ...rest } = useMenuList(options);

  return {
    ...rest,
    data: menuList ? menuService.buildMenuTree(menuList) : undefined,
    menuList,
  };
}

/**
 * Hook to fetch menus available for current user
 */
export function useAvailableMenus(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: menuKeys.available(),
    queryFn: () => menuService.getAvailableMenus(),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch menus mapped to specific roles
 */
export function useRoleMenus(params: GetRoleMenusRequest, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: menuKeys.roleMenu(params.roleIds),
    queryFn: () => menuService.getMenusByRoles(params),
    enabled: params.roleIds.length > 0 && options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a new menu
 */
export function useMenuCreate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menu: CreateMenuRequest) => menuService.createMenu(menu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

/**
 * Hook to update a menu
 */
export function useMenuUpdate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menu: UpdateMenuRequest) => menuService.updateMenu(menu),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

/**
 * Hook to delete a menu
 */
export function useMenuDelete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (menuId: string) => menuService.deleteMenu(menuId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

/**
 * Hook to create menus from YAML
 */
export function useMenuCreateFromYaml() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ framework, yamlContent }: { framework: string; yamlContent: string }) =>
      menuService.createMenuFromYaml(framework, yamlContent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}

/**
 * Hook to reset all menus
 */
export function useMenuReset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => menuService.resetAllMenus(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
    },
  });
}
