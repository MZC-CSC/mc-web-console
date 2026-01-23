/**
 * Users 화면 타입 정의
 */

/**
 * User 항목
 */
export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  platformRoles?: UserRole[];
  workspaceRoles?: UserWorkspaceRole[];
  cspRoles?: UserCspRole[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User Role (Platform Role)
 */
export interface UserRole {
  id: string;
  name: string;
  description?: string;
}

/**
 * User Workspace Role
 */
export interface UserWorkspaceRole {
  id: string;
  workspaceId: string;
  workspaceName?: string;
  roleId: string;
  roleName?: string;
  roleDescription?: string;
}

/**
 * User CSP Role
 */
export interface UserCspRole {
  id: string;
  cspRoleId: string;
  cspRoleName?: string;
  cspRoleDescription?: string;
}

/**
 * User 상세 정보
 */
export interface UserDetail {
  user: User;
  platformRoles: UserRole[];
  workspaceRoles: UserWorkspaceRole[];
  cspRoles: UserCspRole[];
}

/**
 * User 생성 요청 데이터
 */
export interface UserCreateRequest {
  firstName: string;
  lastName: string;
  email: string;
  password?: string;
  enabled?: boolean;
}

/**
 * User 수정 요청 데이터
 */
export interface UserUpdateRequest {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  enabled?: boolean;
}

/**
 * Role 매핑 추가 요청 데이터
 */
export interface AddRoleMappingRequest {
  userId: string;
  roleType: 'platform' | 'workspace' | 'csp';
  roleId: string;
  workspaceId?: string; // Workspace Role인 경우
}

/**
 * Role 매핑 삭제 요청 데이터
 */
export interface RemoveRoleMappingRequest {
  userId: string;
  roleType: 'platform' | 'workspace' | 'csp';
  roleMappingId: string;
}

/**
 * User 필터
 */
export interface UserFilter {
  field?: 'id' | 'name' | 'email';
  type?: 'like' | '=';
  value?: string;
}
