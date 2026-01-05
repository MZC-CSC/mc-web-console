export * from './api';
export * from './mci';
export * from './menu';

// Domain types

export interface Workspace {
  id: string;
  name: string;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  workspaceId: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  path: string;
  icon?: string;
  children?: MenuItem[];
  parentId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

// MCI types (for future use)
export interface Mci {
  id: string;
  name: string;
  status: string;
  vmCount: number;
  description?: string;
}

// Dashboard types
export interface DashboardStats {
  totalVms: number;
  totalClusters: number;
  activeWorkspaces: number;
  cloudConnections: number;
  vmsByProvider: Record<string, number>;
  vmsByStatus: Record<string, number>;
}
