/**
 * Menu API Service
 * Handles menu resource management API calls to mc-iam-manager
 */

import { apiClient } from '@/lib/api/client';
import type {
  MenuResource,
  MenuTreeNode,
  CreateMenuRequest,
  UpdateMenuRequest,
  GetRoleMenusRequest,
  RoleMenuMapping,
} from '@/types/menu';

const SUBSYSTEM = 'mc-iam-manager';

/**
 * Get all menu resources
 * API: ListMenus
 */
export async function getMenuList(): Promise<MenuResource[]> {
  try {
    const response = await apiClient.post<MenuResource[]>(SUBSYSTEM, 'ListMenus', {
      request: {},
    });
    return response.responseData || [];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Get menus available for current user
 * API: POST /api/users/menus/list (Getallavailablemenus)
 */
export async function getAvailableMenus(): Promise<MenuResource[]> {
  try {
    const response = await apiClient.post<MenuResource[]>(SUBSYSTEM, 'Getallavailablemenus', {});
    return response.responseData || [];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Get menus mapped to specific roles
 * API: POST /api/menus/platform-roles/list (Getmappedmenusbyrolelist)
 */
export async function getMenusByRoles(params: GetRoleMenusRequest): Promise<RoleMenuMapping[]> {
  try {
    const response = await apiClient.post<RoleMenuMapping[]>(SUBSYSTEM, 'Getmappedmenusbyrolelist', {
      request: params,
    });
    return response.responseData || [];
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error && (error as { statusCode: number }).statusCode === 404) {
      return [];
    }
    throw error;
  }
}

/**
 * Create menu resources from YAML
 * API: POST /api/resource/file/framework/{framework}/menu (Createmenuresourcesbymenuyaml)
 */
export async function createMenuFromYaml(framework: string, yamlContent: string): Promise<unknown> {
  const response = await apiClient.post(SUBSYSTEM, 'Createmenuresourcesbymenuyaml', {
    pathParams: { framework },
    request: { content: yamlContent },
  });
  return response.responseData;
}

/**
 * Create a single menu resource
 * API: POST /api/createmenuresources (Createmenuresources)
 */
export async function createMenu(menu: CreateMenuRequest): Promise<MenuResource> {
  const response = await apiClient.post<MenuResource>(SUBSYSTEM, 'Createmenuresources', {
    request: menu,
  });
  return response.responseData;
}

/**
 * Update a menu resource
 * API: PUT /api/resource/id/{id} (Updateresource)
 */
export async function updateMenu(menu: UpdateMenuRequest): Promise<MenuResource> {
  const response = await apiClient.post<MenuResource>(SUBSYSTEM, 'Updateresource', {
    pathParams: { id: menu.id },
    request: menu,
  });
  return response.responseData;
}

/**
 * Delete a menu resource
 * API: DELETE /api/resource/id/{id} (Deleteresource)
 */
export async function deleteMenu(menuId: string): Promise<void> {
  await apiClient.post(SUBSYSTEM, 'Deleteresource', {
    pathParams: { id: menuId },
  });
}

/**
 * Reset all menu resources
 * API: DELETE /api/resource/reset/menu (Resetmenuresource)
 */
export async function resetAllMenus(): Promise<void> {
  await apiClient.post(SUBSYSTEM, 'Resetmenuresource', {});
}

// ============ Utility Functions ============

/**
 * Convert flat menu list to tree structure
 */
export function buildMenuTree(menus: MenuResource[], rootParentId: string = 'home'): MenuTreeNode[] {
  const menuMap = new Map<string, MenuTreeNode>();
  const rootNodes: MenuTreeNode[] = [];

  // Initialize all nodes
  menus.forEach((menu) => {
    menuMap.set(menu.id, {
      ...menu,
      children: [],
      level: 0,
    });
  });

  // Build tree structure
  menus.forEach((menu) => {
    const node = menuMap.get(menu.id)!;
    if (menu.parentid === rootParentId || !menuMap.has(menu.parentid)) {
      rootNodes.push(node);
    } else {
      const parent = menuMap.get(menu.parentid);
      if (parent) {
        node.level = parent.level + 1;
        parent.children.push(node);
      }
    }
  });

  // Sort by menunumber and priority
  const sortNodes = (nodes: MenuTreeNode[]): MenuTreeNode[] => {
    return nodes
      .sort((a, b) => a.menunumber - b.menunumber || a.priority - b.priority)
      .map((node) => ({
        ...node,
        children: sortNodes(node.children),
      }));
  };

  return sortNodes(rootNodes);
}

/**
 * Flatten tree back to list
 */
export function flattenMenuTree(tree: MenuTreeNode[]): MenuResource[] {
  const result: MenuResource[] = [];

  const traverse = (nodes: MenuTreeNode[]) => {
    nodes.forEach((node) => {
      const { children, level, isExpanded, ...menu } = node;
      result.push(menu);
      if (children.length > 0) {
        traverse(children);
      }
    });
  };

  traverse(tree);
  return result;
}

/**
 * Find menu by ID in tree
 */
export function findMenuInTree(tree: MenuTreeNode[], menuId: string): MenuTreeNode | null {
  for (const node of tree) {
    if (node.id === menuId) return node;
    if (node.children.length > 0) {
      const found = findMenuInTree(node.children, menuId);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get all parent IDs for a menu
 */
export function getMenuAncestors(menus: MenuResource[], menuId: string): string[] {
  const ancestors: string[] = [];
  const menuMap = new Map(menus.map((m) => [m.id, m]));

  let current = menuMap.get(menuId);
  while (current && current.parentid && menuMap.has(current.parentid)) {
    ancestors.unshift(current.parentid);
    current = menuMap.get(current.parentid);
  }

  return ancestors;
}

// Export as service object
export const menuService = {
  getMenuList,
  getAvailableMenus,
  getMenusByRoles,
  createMenuFromYaml,
  createMenu,
  updateMenu,
  deleteMenu,
  resetAllMenus,
  buildMenuTree,
  flattenMenuTree,
  findMenuInTree,
  getMenuAncestors,
};
