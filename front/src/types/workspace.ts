/**
 * Workspace 타입
 */
export interface Workspace {
  id: string;
  name: string;
  description?: string;
}

/**
 * Project 타입
 */
export interface Project {
  id: string;
  name: string;
  ns_id?: string;
  description?: string;
}

/**
 * Role 타입
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  workspaceId?: string;
  roleType?: 'platform' | 'workspace' | 'csp';
  // Phase 2: View 모드 추가 필드
  platformAccess?: PlatformAccess;
  workspaceAccess?: boolean;
  cspRoleMappings?: CspRoleMapping[];
}

/**
 * Platform Access 타입
 */
export interface PlatformAccess {
  permissions: string[];
  treeData?: TreeNode[];
}

/**
 * TreeNode 타입 (트리 구조)
 */
export interface TreeNode {
  id: string;
  text: string;
  children?: TreeNode[];
  state?: {
    selected?: boolean;
    opened?: boolean;
  };
}

/**
 * CSP Role Mapping 타입
 */
export interface CspRoleMapping {
  id: string;
  provider: 'aws' | 'gcp' | 'azure' | 'alibaba' | 'tencent';
  roleName: string;
  roleArn?: string;
}

/**
 * CSP Role 타입
 */
export interface CSPRole {
  id: string;
  name: string;
  provider: 'aws' | 'gcp' | 'azure' | 'alibaba' | 'tencent';
  description?: string;
  arn?: string;
  workspaceId?: string;
}

/**
 * Access Control (Permission) 타입
 */
export interface AccessControl {
  id: string;
  operationId: string;
  resource: string;
  framework?: string;
  policies?: PermissionPolicy[];
  workspaceId?: string;
}

/**
 * Permission Policy 타입
 */
export interface PermissionPolicy {
  id?: string;
  name?: string;
  effect: 'allow' | 'deny';
  actions?: string[];
  resources?: string[];
  conditions?: Record<string, unknown>;
}
