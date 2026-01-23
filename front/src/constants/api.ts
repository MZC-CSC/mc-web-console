/**
 * Backend API Base URL
 * 클라이언트 사이드에서는 빈 문자열을 사용하여 상대 경로로 요청
 * 서버 사이드에서는 Buffalo 서버 주소 사용
 * 환경 변수 NEXT_PUBLIC_API_BASE_URL이 필수로 설정되어야 합니다.
 */
export const API_BASE_URL = typeof window !== 'undefined' 
  ? '' // 클라이언트: 상대 경로 사용 (현재 호스트의 /api로 요청)
  : process.env.NEXT_PUBLIC_API_BASE_URL; // 서버: Buffalo 주소 (환경 변수 필수)

/**
 * API 엔드포인트 경로
 */
export const API_PATHS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  WORKSPACE: {
    LIST: '/api/workspaces/list',
    GET: '/api/ws/workspace/id',
    CREATE: '/api/workspaces',
    UPDATE: '/api/ws/workspace/id',
    DELETE: '/api/ws/workspace/id',
  },
  USER: {
    LIST: '/api/users/list',
    GET: '/api/auth/userinfo',
    CREATE: '/api/users',
    UPDATE: '/api/user/id',
    DELETE: '/api/user/id',
  },
  ROLE: {
    LIST: '/api/roles/list',
    GET: '/api/role/id',
    CREATE: '/api/role',
    UPDATE: '/api/role/id',
    DELETE: '/api/role/id',
    ASSIGN_WORKSPACE_ROLE: '/api/roles/assign/workspace-role',
  },
  CSP_ROLE: {
    LIST: '/api/roles/list',
    GET: '/api/role/id',
    CREATE: '/api/role',
    UPDATE: '/api/role/id',
    DELETE: '/api/role/id',
  },
  PERMISSION: {
    LIST: '/api/permissions/mciam/list',
    GET: '/api/permission/framewrok',
    CREATE: '/api/permission/framewrok',
    UPDATE: '/api/permission/framewrok',
    DELETE: '/api/permission/framewrok',
  },
  // Resources
  RESOURCES: {
    SPEC: {
      LIST: '/api/ns/{nsId}/resources/spec',
      GET: '/api/ns/{nsId}/resources/spec/{specId}',
      CREATE: '/api/ns/{nsId}/resources/spec',
      UPDATE: '/api/ns/{nsId}/resources/spec/{specId}',
      DELETE: '/api/ns/{nsId}/resources/spec/{specId}',
    },
    IMAGE: {
      LIST: '/api/ns/{nsId}/resources/image',
      GET: '/api/ns/{nsId}/resources/image/{imageId}',
      CREATE: '/api/ns/{nsId}/resources/image',
      UPDATE: '/api/ns/{nsId}/resources/image/{imageId}',
      DELETE: '/api/ns/{nsId}/resources/image/{imageId}',
    },
    MY_IMAGE: {
      LIST: '/api/ns/{nsId}/resources/customImage',
      GET: '/api/ns/{nsId}/resources/customImage/{customImageId}',
      CREATE: '/api/ns/{nsId}/resources/customImage',
      DELETE: '/api/ns/{nsId}/resources/customImage/{customImageId}',
    },
    NETWORK: {
      LIST: '/api/ns/{nsId}/resources/vNet',
      GET: '/api/ns/{nsId}/resources/vNet/{vNetId}',
      CREATE: '/api/ns/{nsId}/resources/vNet',
      DELETE: '/api/ns/{nsId}/resources/vNet/{vNetId}',
    },
    SECURITY_GROUP: {
      LIST: '/api/ns/{nsId}/resources/securityGroup',
      GET: '/api/ns/{nsId}/resources/securityGroup/{securityGroupId}',
      CREATE: '/api/ns/{nsId}/resources/securityGroup',
      DELETE: '/api/ns/{nsId}/resources/securityGroup/{securityGroupId}',
    },
    DISK: {
      LIST: '/api/ns/{nsId}/resources/dataDisk',
      GET: '/api/ns/{nsId}/resources/dataDisk/{dataDiskId}',
      CREATE: '/api/ns/{nsId}/resources/dataDisk',
      UPDATE: '/api/ns/{nsId}/resources/dataDisk/{dataDiskId}',
      DELETE: '/api/ns/{nsId}/resources/dataDisk/{dataDiskId}',
    },
    SSH_KEY: {
      LIST: '/api/ns/{nsId}/resources/sshKey',
      GET: '/api/ns/{nsId}/resources/sshKey/{sshKeyId}',
      CREATE: '/api/ns/{nsId}/resources/sshKey',
      UPDATE: '/api/ns/{nsId}/resources/sshKey/{sshKeyId}',
      DELETE: '/api/ns/{nsId}/resources/sshKey/{sshKeyId}',
    },
    OVERVIEW: {
      GET: '/api/inspectResourcesOverview',
    },
    CREDENTIAL: {
      LIST: '/api/connConfig',
      GET: '/api/connConfig/{connConfigName}',
      REGISTER: '/api/credential',
    },
  },
  // ... 기타 API 경로
} as const;

/**
 * OperationId 상수
 * Backend API의 operationId와 일치해야 함
 */
export const OPERATION_IDS = {
  // Auth
  LOGIN: 'mciamLogin',
  LOGIN_REFRESH: 'mciamRefreshToken',
  LOGOUT: 'mciamLogout',
  
  // Workspace
  GET_WORKSPACE_LIST: 'GetWorkspaces',
  LIST_WORKSPACES: 'listWorkspaces', // 관리 화면용: 전체 워크스페이스 목록 조회
  GET_WORKSPACE_LIST_BY_USER_ID: 'ListUserWorkspaces',
  GET_WORKSPACE: 'Getworkspacebyid',
  CREATE_WORKSPACE: 'Createworkspace',
  UPDATE_WORKSPACE: 'Updateworkspacebyid',
  DELETE_WORKSPACE: 'Deleteworkspacebyid',
  
  // Project
  GET_WORKSPACE_PROJECTS: 'listWorkspaceProjects',
  GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID: 'GetWPmappingListByWorkspaceId', // Workspace ID로 Project 목록 조회
  LIST_PROJECTS: 'listProjects',
  CREATE_PROJECT: 'createProject',
  DELETE_PROJECT: 'deleteProject',
  ADD_PROJECT_TO_WORKSPACE: 'addProjectToWorkspace',
  REMOVE_PROJECT_FROM_WORKSPACE: 'removeProjectFromWorkspace',
  
  // User
  GET_USER_LIST: 'Getusers',
  GET_USER: 'Getuserinfo',
  CREATE_USER: 'Createuser',
  UPDATE_USER: 'Updateuser',
  DELETE_USER: 'Deleteuser',
  
  // Menu
  GET_MENU_LIST: 'ListMenus',
  CREATE_MENU: 'CreateMenu',
  GET_MENU_BY_ID: 'GetMenuByID',
  UPDATE_MENU: 'UpdateMenu',
  DELETE_MENU: 'DeleteMenu',
  
  // Role
  GET_ROLE_LIST: 'Getrolelist',
  GET_ROLE: 'Getrolebyid',
  CREATE_ROLE: 'Createrole',
  UPDATE_ROLE: 'Updaterolebyid',
  DELETE_ROLE: 'Deleterolebyid',
  
  // Permission (Access Control)
  GET_PERMISSIONS: 'Getpermissions',
  GET_PERMISSION: 'Getpermission',
  APPEND_PERMISSION: 'Appendresourcepermissionpolicesbyoperationid',
  UPDATE_PERMISSION: 'Updateresourcepermissionbyoperationid',
  DELETE_PERMISSION: 'Deleteresourcepermissionpolicesbyoperationid',
  
  // Resources - Spec
  GET_SPEC_LIST: 'Getspec',
  GET_SPEC: 'Getspec',
  CREATE_SPEC: 'Postspec',
  UPDATE_SPEC: 'Putspec',
  DELETE_SPEC: 'Delspec',
  
  // Resources - Image
  GET_IMAGE_LIST: 'Getallimage',
  GET_IMAGE: 'Getimage',
  CREATE_IMAGE: 'Postimage',
  UPDATE_IMAGE: 'Putimage',
  DELETE_IMAGE: 'Delimage',
  
  // Resources - My Image
  GET_MY_IMAGE_LIST: 'Getallcustomimage',
  GET_MY_IMAGE: 'Getcustomimage',
  CREATE_MY_IMAGE: 'Postcustomimage',
  DELETE_MY_IMAGE: 'Delcustomimage',
  
  // Resources - Network
  GET_NETWORK_LIST: 'Getallvnet',
  GET_NETWORK: 'Getvnet',
  CREATE_NETWORK: 'Postvnet',
  DELETE_NETWORK: 'Delvnet',
  
  // Resources - Security Group
  GET_SECURITY_GROUP_LIST: 'Getallsecuritygroup',
  GET_SECURITY_GROUP: 'Getsecuritygroup',
  CREATE_SECURITY_GROUP: 'Postsecuritygroup',
  DELETE_SECURITY_GROUP: 'Delsecuritygroup',
  
  // Resources - Disk
  GET_DISK_LIST: 'Getalldatadisk',
  GET_DISK: 'Getdatadisk',
  CREATE_DISK: 'Postdatadisk',
  UPDATE_DISK: 'Putdatadisk',
  DELETE_DISK: 'Deldatadisk',
  
  // Resources - SSH Key
  GET_SSH_KEY_LIST: 'Getallsshkey',
  GET_SSH_KEY: 'Getsshkey',
  CREATE_SSH_KEY: 'Postsshkey',
  UPDATE_SSH_KEY: 'Putsshkey',
  DELETE_SSH_KEY: 'Delsshkey',
  
  // Resources - Overview
  GET_RESOURCES_OVERVIEW: 'Inspectresourcesoverview',
  
  // Resources - Credential
  GET_CREDENTIAL_LIST: 'Getconnconfiglist',
  GET_CREDENTIAL: 'Getconnconfig',
  REGISTER_CREDENTIAL: 'Registercredential',
  
  // ... 기타 operationId
} as const;

export type OperationId = typeof OPERATION_IDS[keyof typeof OPERATION_IDS];
