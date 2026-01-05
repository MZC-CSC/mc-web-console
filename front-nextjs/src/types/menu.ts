/**
 * Menu Resource Type Definitions
 * Based on webconsole_menu_resources.yaml structure
 */

// Menu Resource (API response from mc-iam-manager)
export interface MenuResource {
  id: string;
  parentid: string;
  displayname: string;
  restype: 'menu' | 'action';
  isaction: boolean;
  priority: number;
  menunumber: number;
  path?: string;
  icon?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Tree structure for rendering
export interface MenuTreeNode extends MenuResource {
  children: MenuTreeNode[];
  level: number;
  isExpanded?: boolean;
}

// Create menu request
export interface CreateMenuRequest {
  id: string;
  parentid: string;
  displayname: string;
  restype?: 'menu' | 'action';
  isaction?: boolean;
  priority?: number;
  menunumber?: number;
  path?: string;
  icon?: string;
  description?: string;
}

// Update menu request
export interface UpdateMenuRequest {
  id: string;
  displayname?: string;
  priority?: number;
  menunumber?: number;
  path?: string;
  icon?: string;
  description?: string;
  isaction?: boolean;
}

// Role-menu mapping
export interface RoleMenuMapping {
  roleId: string;
  roleName: string;
  menuIds: string[];
  menus?: MenuResource[];
}

// API request types
export interface GetMenuListRequest {
  framework?: string;
  parentId?: string;
}

export interface GetRoleMenusRequest {
  roleIds: string[];
  framework?: string;
}

export interface AssignMenuToRoleRequest {
  roleId: string;
  menuIds: string[];
}

// API response types
export interface MenuListResponse {
  menus: MenuResource[];
}

export interface RoleMenuListResponse {
  mappings: RoleMenuMapping[];
}

// Form state types
export type MenuFormMode = 'create' | 'edit';

export interface MenuFormData {
  id: string;
  parentid: string;
  displayname: string;
  restype: 'menu' | 'action';
  isaction: boolean;
  priority: number;
  menunumber: number;
  path: string;
  icon: string;
  description: string;
}
