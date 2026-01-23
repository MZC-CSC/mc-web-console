/**
 * 라우트 경로 상수
 */
export const ROUTES = {
  // 인증
  LOGIN: '/login',
  LOGOUT: '/logout',
  UNAUTHORIZED: '/unauthorized',
  
  // 대시보드
  DASHBOARD: '/dashboard',
  
  // Operations
  OPERATIONS: {
    BASE: '/operations',
    WORKSPACES: '/operations/manage/workspaces',
    USERS: '/operations/manage/users',
    // ... 기타 Operations 경로
  },
  
  // Settings
  SETTINGS: {
    BASE: '/settings',
    USERS: '/settings/accountnaccess/organizations/users',
    // ... 기타 Settings 경로
  },
} as const;
