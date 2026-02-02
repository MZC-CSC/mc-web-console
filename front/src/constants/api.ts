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
 * api.yaml에서 생성됨 (총 286개)
 */
export const OPERATION_IDS = {

  // ==================== mc-web-console (11 operations) ====================
  ANYCONTROLLER: 'Anycontroller', // [POST] AnyController
  AVAILABLEDISKTYPEBYPROVIDERREGION: 'Availabledisktypebyproviderregion', // [POST] AvailableDiskTypeByProviderRegion
  CREATEMENURESOURCES: 'Createmenuresources', // [POST] CreateMenuResources
  DISKLOOKUP: 'Disklookup', // [POST] DiskLookup
  GETMENUTREE: 'Getmenutree', // [POST] GetmenuTree
  WEBGETUSERINFO: 'Webgetuserinfo', // [POST] webGetUserInfo
  WEBLOGIN: 'Weblogin', // [POST] webLogin
  WEBLOGINREFRESH: 'Webloginrefresh', // [POST] webLoginRefresh
  WEBLOGOUT: 'Weblogout', // [POST] webLogout
  WEBVALIDATE: 'Webvalidate', // [POST] webValidate
  LIST_SERVICES_AND_ACTIONS: 'ListServicesAndActions', // [POST] List all services and their operations from api.yaml

  // Aliases for convenience
  LOGIN: 'Weblogin', // Alias for WEBLOGIN
  LOGIN_REFRESH: 'Webloginrefresh', // Alias for WEBLOGINREFRESH
  LOGOUT: 'Weblogout', // Alias for WEBLOGOUT

  // ==================== mc-application-manager (66 operations) ====================
  CHECK_CONNECTION_USING_P_O_S_T: 'checkConnectionUsingPOST', // [POST] checkConnection
  CREATE_CATALOG_REF_USING_P_O_S_T: 'createCatalogRefUsingPOST', // [POST] software catalog 관련정보 등록(webpage, workflow 등)
  CREATE_CATALOG_USING_P_O_S_T: 'createCatalogUsingPOST', // [POST] software catalog 등록
  CREATE_COMPONENT_BY_TEXT_USING_P_O_S_T: 'createComponentByTextUsingPOST', // [POST] createComponentByText
  CREATE_COMPONENT_USING_P_O_S_T: 'createComponentUsingPOST', // [POST] createComponent
  CREATE_MANIFEST_USING_P_O_S_T: 'createManifestUsingPOST', // [POST] createManifest
  CREATE_REPOSITORY_USING_P_O_S_T: 'createRepositoryUsingPOST', // [POST] createRepository
  CREATE_REPOSITORY_USING_P_O_S_T_1: 'createRepositoryUsingPOST_1', // [POST] createRepository
  DELETE_CATALOG_REF_WORKFLOW_USING_D_E_L_E_T_E: 'deleteCatalogRefWorkflowUsingDELETE', // [DELETE] deleteCatalogRefWorkflow
  DELETE_CATALOG_USING_D_E_L_E_T_E: 'deleteCatalogUsingDELETE', // [DELETE] software catalog 삭제
  DELETE_COMPONENT_USING_D_E_L_E_T_E: 'deleteComponentUsingDELETE', // [DELETE] deleteComponent
  DELETE_OSS_TYPE_USING_D_E_L_E_T_E: 'deleteOssTypeUsingDELETE', // [DELETE] deleteOssType
  DELETE_OSS_USING_D_E_L_E_T_E: 'deleteOssUsingDELETE', // [DELETE] deleteOss
  DELETE_REPOSITORY_FILE_USING_D_E_L_E_T_E: 'deleteRepositoryFileUsingDELETE', // [DELETE] deleteRepositoryFile
  DELETE_REPOSITORY_USING_D_E_L_E_T_E: 'deleteRepositoryUsingDELETE', // [DELETE] deleteRepository
  DELETE_REPOSITORY_USING_D_E_L_E_T_E_1: 'deleteRepositoryUsingDELETE_1', // [DELETE] deleteRepository
  DETAIL_OSS_TYPE_USING_G_E_T: 'detailOssTypeUsingGET', // [GET] detailOssType
  DETAIL_OSS_USING_G_E_T: 'detailOssUsingGET', // [GET] detailOss
  ERROR_HTML_USING_D_E_L_E_T_E: 'errorHtmlUsingDELETE', // [DELETE] errorHtml
  ERROR_HTML_USING_G_E_T: 'errorHtmlUsingGET', // [GET] errorHtml
  ERROR_HTML_USING_H_E_A_D: 'errorHtmlUsingHEAD', // [HEAD] errorHtml
  ERROR_HTML_USING_O_P_T_I_O_N_S: 'errorHtmlUsingOPTIONS', // [OPTIONS] errorHtml
  ERROR_HTML_USING_P_A_T_C_H: 'errorHtmlUsingPATCH', // [PATCH] errorHtml
  ERROR_HTML_USING_P_O_S_T: 'errorHtmlUsingPOST', // [POST] errorHtml
  ERROR_HTML_USING_P_U_T: 'errorHtmlUsingPUT', // [PUT] errorHtml
  EXEC_WORKFLOW_USING_P_O_S_T: 'execWorkflowUsingPOST', // [POST] execWorkflow
  GENERATE_CONFIGMAP_YAML_USING_P_O_S_T: 'generateConfigmapYamlUsingPOST', // [POST] generateConfigmapYaml
  GENERATE_DEPLOYMENT_YAML_USING_P_O_S_T: 'generateDeploymentYamlUsingPOST', // [POST] generateDeploymentYaml
  GENERATE_H_P_A_YAML_USING_P_O_S_T: 'generateHPAYamlUsingPOST', // [POST] generateHPAYaml
  GENERATE_POD_YAML_USING_P_O_S_T: 'generatePodYamlUsingPOST', // [POST] generatePodYaml
  GENERATE_SERVICE_YAML_USING_P_O_S_T: 'generateServiceYamlUsingPOST', // [POST] generateServiceYaml
  GET_ARTIFACT_HUB_LIST_USING_G_E_T: 'getArtifactHubListUsingGET', // [GET] getArtifactHubList
  GET_CATALOG_DETAIL_USING_G_E_T: 'getCatalogDetailUsingGET', // [GET] software catalog 내용 확인(연결된 정보들까지)
  GET_CATALOG_LIST_USING_G_E_T: 'getCatalogListUsingGET', // [GET] software catalog 리스트 불러오기
  GET_CATALOG_REFERENCE_USING_G_E_T: 'getCatalogReferenceUsingGET', // [GET] getCatalogReference
  GET_COMPONENT_DETAIL_BY_NAME_USING_G_E_T: 'getComponentDetailByNameUsingGET', // [GET] getComponentDetailByName
  GET_COMPONENT_LIST_USING_G_E_T: 'getComponentListUsingGET', // [GET] getComponentList
  GET_DOCKER_HUB_LIST_USING_G_E_T: 'getDockerHubListUsingGET', // [GET] getDockerHubList
  GET_MANIFEST_DETAIL_TXT_USING_G_E_T: 'getManifestDetailTxtUsingGET', // [GET] getManifestDetailTxt
  GET_MANIFEST_DETAIL_USING_G_E_T: 'getManifestDetailUsingGET', // [GET] getManifestDetail
  GET_MANIFEST_USING_G_E_T: 'getManifestUsingGET', // [GET] getManifest
  GET_OSS_LIST_USING_G_E_T: 'getOssListUsingGET', // [GET] getOssList
  GET_OSS_LIST_USING_G_E_T_1: 'getOssListUsingGET_1', // [GET] getOssList
  GET_OSS_TYPE_LIST_USING_G_E_T: 'getOssTypeListUsingGET', // [GET] getOssTypeList
  GET_REPOSITORY_DETAIL_BY_NAME_USING_G_E_T: 'getRepositoryDetailByNameUsingGET', // [GET] getRepositoryDetailByName
  GET_REPOSITORY_FILE_USING_G_E_T: 'getRepositoryFileUsingGET', // [GET] getRepositoryFile
  GET_REPOSITORY_LIST_USING_G_E_T: 'getRepositoryListUsingGET', // [GET] getRepositoryList
  GET_REPOSITORY_LIST_USING_G_E_T_1: 'getRepositoryListUsingGET_1', // [GET] getRepositoryList
  GET_REPOSITORY_USING_G_E_T: 'getRepositoryUsingGET', // [GET] getRepository
  INSERT_REPOSITORY_USING_P_O_S_T: 'insertRepositoryUsingPOST', // [POST] insertRepository
  IS_OSS_INFO_DUPLICATED_USING_G_E_T: 'isOssInfoDuplicatedUsingGET', // [GET] isOssInfoDuplicated
  OPENAPI_JSON_USING_G_E_T: 'openapiJsonUsingGET', // [GET] openapiJson
  OPENAPI_JSON_USING_G_E_T_1: 'openapiJsonUsingGET_1', // [GET] openapiJson
  OPENAPI_YAML_USING_G_E_T: 'openapiYamlUsingGET', // [GET] openapiYaml
  REDIRECT_TO_UI_USING_G_E_T: 'redirectToUiUsingGET', // [GET] redirectToUi
  REGIST_OSS_TYPE_USING_P_O_S_T: 'registOssTypeUsingPOST', // [POST] registOssType
  REGIST_OSS_USING_P_O_S_T: 'registOssUsingPOST', // [POST] registOss
  SAVE_MANIFEST_USING_G_E_T: 'saveManifestUsingGET', // [GET] saveManifest
  UPDATE_CATALOG_USING_P_U_T: 'updateCatalogUsingPUT', // [PUT] software catalog 수정
  UPDATE_MANIFEST_USING_D_E_L_E_T_E: 'updateManifestUsingDELETE', // [DELETE] updateManifest
  UPDATE_MANIFEST_USING_P_U_T: 'updateManifestUsingPUT', // [PUT] updateManifest
  UPDATE_OSS_TYPE_USING_P_A_T_C_H: 'updateOssTypeUsingPATCH', // [PATCH] updateOssType
  UPDATE_OSS_USING_P_A_T_C_H: 'updateOssUsingPATCH', // [PATCH] updateOss
  UPDATE_REPOSITORY_USING_P_U_T: 'updateRepositoryUsingPUT', // [PUT] updateRepository
  UPDATE_REPOSITORY_USING_P_U_T_1: 'updateRepositoryUsingPUT_1', // [PUT] updateRepository
  UPLOAD_FILES_USING_P_O_S_T: 'uploadFilesUsingPOST', // [POST] file upload

  // ==================== mc-cost-optimizer (14 operations) ====================
  GET_ABRNORMAL_RCMD: 'getAbrnormalRcmd', // [POST] 최근 24시간동안 과금이 발생한 서비스들의 이상 비용 여부를 확인한다.
  GET_ALARM_HISTORY: 'getAlarmHistory', // [POST] 최근 7일간 발생한 최적화 알람을 조회한다.
  GET_BILL_ASSET: 'getBillAsset', // [POST] 이번달 사용한 서비스(VM, DB 등) 단위의 비용을 확인합니다.
  GET_BILLING_BASE_INFO: 'getBillingBaseInfo', // [POST] 이번달 CSP별 요약된 빌링 인보이스를 확인한다.
  GET_CUR_MONTH_BILL: 'getCurMonthBill', // [POST] 지난달 대비 이번달 비용을 확인합니다.
  GET_INST_OPTI_SIZE_RCMD: 'getInstOptiSizeRcmd', // [POST] 사용중인 인스턴스의 추천 사이즈를 확인한다.
  GET_INVOICE: 'getInvoice', // [POST] 이번달 빌링 인보이스 내역을 확인한다.
  GET_PROJECTS: 'getProjects', // [GET] 워크스페이스에 속한 프로젝트 목록을 조회합니다.
  GET_READYZ: 'getReadyz', // [GET] 어플리케이션의 상태를 조회합니다.
  GET_SUMMARY: 'getSummary', // [POST] CSP별 빌링 인보이스 비용을 월별로 확인한다.
  GET_TOP5_BILL: 'getTop5Bill', // [POST] 이번달에 사용한 비용 상위 5개의 리소스와 비용을 확인합니다.
  GET_UNUSED_RCMD: 'getUnusedRcmd', // [POST] 최근 24시간동안 과금이 발생한 리소스에 대하여 미사용 자원을 추천한다.
  GET_WORKSPACES: 'getWorkspaces', // [GET] 워크스페이스 목록을 조회합니다.
  UPDATE_T_B_B_RSC_META: 'updateTBBRscMeta', // [GET]

  // ==================== mc-infra-manager ====================
  // MCI 조회 및 관리
  GET_ALL_MCI: 'GetAllMci', // [GET] Get all MCI workloads for a namespace
  GET_MCI: 'GetMci', // [GET] Get specific MCI details
  GET_CONTROL_MCI: 'GetControlMci', // [GET] Control MCI (suspend/resume/reboot/terminate/refine)
  DEL_MCI: 'DelMci', // [DELETE] Delete MCI

  // MCI Policy 조회 및 관리
  GET_MCI_POLICY: 'GetMciPolicy', // [GET] Get MCI Policy
  POST_MCI_POLICY: 'PostMciPolicy', // [POST] Create MCI Automation policy

  // MCI 생성 (Dynamic Mode)
  POST_MCI_DYNAMIC: 'PostMciDynamic', // [POST] Create MCI dynamically
  POST_MCI_DYNAMIC_CHECK_REQUEST: 'PostMciDynamicCheckRequest', // [POST] Validate MCI creation request
  POST_MCI_DYNAMIC_REVIEW: 'PostMciDynamicReview', // [POST] Review MCI creation (cost estimation)
  POST_MCI_SUBGROUP_DYNAMIC: 'PostMciSubGroupDynamic', // [POST] Add VM SubGroup to existing MCI (Dynamic)
  POST_MCI_DYNAMIC_SUBGROUP_VM_REVIEW: 'PostMciDynamicSubGroupVmReview', // [POST] Review SubGroup VM creation (cost estimation)

  // MCI 생성 (Expert Mode)
  POST_MCI_VM: 'PostMciVm', // [POST] Add Homogeneous VM SubGroup to Existing MCI (Expert)

  // Spec 추천
  RECOMMEND_SPEC: 'RecommendSpec', // [POST] Recommend VM specs based on filters
  RECOMMEND_SPEC_OPTIONS: 'RecommendSpecOptions', // [GET] Get available spec recommendation filter options

  // Image 조회
  GET_ALL_IMAGE: 'GetAllImage', // [GET] Get all images for a namespace
  SEARCH_IMAGE: 'SearchImage', // [POST] Search images with filters

  // ==================== mc-iam-manager (179 operations) ====================
  UPDATE_FRAMEWORK_SERVICE: 'UpdateFrameworkService', // [PUT] Updates specific fields (e.g., BaseURL, Auth info) of an MCMP API service definition identified by its name. Cannot update name or version.
  ADD_CSP_ROLE_MAPPINGS: 'addCspRoleMappings', // [POST] Create a new mapping between role and CSP role

  // Additional aliases and missing operations
  GET_WORKSPACE: 'getWorkspaceByID', // Alias for GET_WORKSPACE_BY_I_D
  GET_USER: 'getUserByID', // Alias for GET_USER_BY_I_D
  GET_ROLE: 'getRoleByRoleID', // Alias for GET_ROLE_BY_ROLE_I_D
  GET_WORKSPACE_LIST: 'listWorkspaces', // Alias for LIST_WORKSPACES
  GET_USER_LIST: 'listUsers', // Alias for LIST_USERS
  GET_ROLE_LIST: 'listRoles', // Alias for LIST_ROLES
  GET_CLOUD_RESOURCE_TYPE: 'getCloudResourceTypeByID', // Get cloud resource type by ID
  LIST_RESOURCE_TYPES: 'listCloudResourceTypes', // Alias for LIST_CLOUD_RESOURCE_TYPES
  GET_WORKSPACE_PROJECTS: 'getWorkspaceProjectsByWorkspaceId', // Get workspace projects
  GET_WORKSPACE_LIST_BY_USER_ID: 'getUserWorkspacesByUserID', // Get workspaces by user ID
  LIST_CSP_ROLES: 'listCSPRoles', // Alias for LIST_C_S_P_ROLES
  GET_ALL_PLATFORM_ROLES: 'listPlatformRoles', // Alias for LIST_PLATFORM_ROLES
  LIST_PLATFORM_ACTIONS_BY_CATEGORY_I_D: 'listPlatformActionsByCategoryID', // List platform actions by category
  LIST_PROJECTS_BY_WORKSPACE: 'listUserProjectsByWorkspace', // List projects by workspace
  LIST_ROLE_MAPPINGS: 'listRoleMasterMappings', // Alias for LIST_ROLE_MASTER_MAPPINGS
  LIST_WORKSPACE_ACTIONS: 'listWorkspaceActionsByPermissionID', // List workspace actions
  CREATE_WORKSPACE_ACTION: 'createWorkspaceAction', // Create workspace action
  DELETE_WORKSPACE_ACTION: 'deleteWorkspaceAction', // Delete workspace action
  CREATE_ACTION_CATEGORY: 'createActionCategory', // Create action category
  DELETE_ACTION_CATEGORY: 'deleteActionCategory', // Delete action category
  GET_ACTION_CATEGORIES: 'getActionCategories', // Get action categories
  GET_ACTION_CATEGORY: 'getActionCategory', // Get action category
  UPDATE_ACTION_CATEGORY: 'updateActionCategory', // Update action category
  CREATE_PLATFORM_ACTION: 'createPlatformAction', // Create platform action
  DELETE_PLATFORM_ACTION: 'deletePlatformAction', // Delete platform action
  UPDATE_PLATFORM_ACTION: 'updatePlatformAction', // Update platform action
  UPDATE_PLATFORM_ROLE: 'updatePlatformRole', // Update platform role
  APPEND_CSP_ROLE_MAPPING: 'addCspRoleMappings', // Alias for ADD_CSP_ROLE_MAPPINGS
  CREATE_CSP_ROLE_MAPPING: 'createCspRoleMapping', // Create CSP role mapping
  DELETE_CSP_ROLE_MAPPING: 'removeCspRoleMappings', // Alias for REMOVE_CSP_ROLE_MAPPINGS
  APPEND_MCIAM_PERMISSION: 'createMciamPermission', // Alias for CREATE_MCIAM_PERMISSION
  DELETE_MCMP_API_PERMISSION_ACTION_MAPPING: 'deleteMapping', // Delete permission action mapping
  APPEND_MENU_TO_ROLE: 'createMenusRolesMapping', // Alias for CREATE_MENUS_ROLES_MAPPING
  REMOVE_MENU_FROM_ROLE: 'deleteMenusRolesMapping', // Alias for DELETE_MENUS_ROLES_MAPPING
  APPEND_PLATFORM_ACTION_TO_PERMISSION: 'createMcmpApiPermissionActionMapping', // Alias for CREATE_MCMP_API_PERMISSION_ACTION_MAPPING
  REMOVE_PLATFORM_ACTION_FROM_PERMISSION: 'deleteMapping', // Delete platform action from permission
  APPEND_WORKSPACE_ACTION_TO_PERMISSION: 'createWorkspaceActionMapping', // Append workspace action to permission
  REMOVE_WORKSPACE_ACTION_FROM_PERMISSION: 'deleteWorkspaceActionMapping', // Remove workspace action from permission
  APPEND_ROLE_TO_WORKSPACE: 'assignWorkspaceRole', // Alias for ASSIGN_WORKSPACE_ROLE
  REMOVE_ROLE_FROM_WORKSPACE: 'removeWorkspaceRole', // Alias for REMOVE_WORKSPACE_ROLE
  APPEND_USER_TO_WORKSPACE: 'addUserToWorkspace', // Alias for ADD_USER_TO_WORKSPACE
  ASSIGN_ROLE_TO_USER: 'assignRole', // Alias for ASSIGN_ROLE
  REMOVE_ROLE_FROM_USER: 'removeRole', // Alias for REMOVE_ROLE

  // ==================== mc-cost-optimizer (additional) ====================
  GET_TOTAL_DAILY_BILL: 'getTotalDailyBill', // Get total daily bill
  GET_TOTAL_MONTHLY_BILL: 'getTotalMonthlyBill', // Get total monthly bill
  GET_UNOPTIMIZED_RCMD: 'getUnusedRcmd', // Get unoptimized resources recommendation
  ADD_PROJECT_TO_WORKSPACE: 'addProjectToWorkspace', // [POST] Add a project to a workspace
  ADD_USER_TO_WORKSPACE: 'addUserToWorkspace', // [POST] Add a user to a workspace
  ADD_WORKSPACE_TO_PROJECT: 'addWorkspaceToProject', // [POST] 프로젝트에 워크스페이스를 연결합니다.
  ASSIGN_MCIAM_PERMISSION_TO_ROLE: 'assignMciamPermissionToRole', // [POST] 역할에 MC-IAM 권한을 할당합니다.
  ASSIGN_PLATFORM_ROLE: 'assignPlatformRole', // [POST] Assign a platform role to a user
  ASSIGN_ROLE: 'assignRole', // [POST] Assign a role to a user
  ASSIGN_WORKSPACE_ROLE: 'assignWorkspaceRole', // [POST] Assign a workspace role to a user
  CHECK_USER_ROLES: 'checkUserRoles', // [GET] Check all roles assigned to a user. 특정 유저가 가진 role 목록을 조회합니다.
  CREATE_CSP_ROLE: 'createCspRole', // [POST] Create a new csp role
  CREATE_CSP_ROLES: 'createCspRoles', // [POST] Create multiple new csp roles
  CREATE_MCIAM_PERMISSION: 'createMciamPermission', // [POST] Create a new permission with the specified information.
  CREATE_MCMP_API_PERMISSION_ACTION_MAPPING: 'createMcmpApiPermissionActionMapping', // [POST] Creates a new mapping between a permission and an API action
  CREATE_MENU: 'createMenu', // [POST] Create a new menu
  CREATE_MENUS_ROLES_MAPPING: 'createMenusRolesMapping', // [POST] Create a new menu mapping
  CREATE_PLATFORM_ROLE: 'createPlatformRole', // [POST] Create a new menu role
  CREATE_PROJECT: 'createProject', // [POST] Create a new project with the specified information.
  CREATE_RESOURCE_TYPE: 'createResourceType', // [POST] 새로운 리소스 타입을 생성합니다
  CREATE_ROLE: 'createRole', // [POST] Create a new role
  CREATE_USER: 'createUser', // [POST] Create a new user with the specified information.
  CREATE_WORKSPACE: 'createWorkspace', // [POST] Create a new workspace with the specified information.
  CREATE_WORKSPACE_ROLE: 'createWorkspaceRole', // [POST] Create a new workspace role
  DELETE_CSP_ROLE: 'deleteCspRole', // [DELETE] Delete a role
  DELETE_MAPPING: 'deleteMapping', // [DELETE] Deletes a mapping between a permission and an API action
  DELETE_MCIAM_PERMISSION: 'deleteMciamPermission', // [DELETE] Delete a permission by its ID.
  DELETE_MENU: 'deleteMenu', // [DELETE] Delete a menu
  DELETE_MENUS_ROLES_MAPPING: 'deleteMenusRolesMapping', // [DELETE] Delete the mapping between a platform role and a menu.
  DELETE_PLATFORM_ROLE: 'deletePlatformRole', // [DELETE] Delete a platform role
  DELETE_PROJECT: 'deleteProject', // [DELETE] Delete a project by its ID.
  DELETE_RESOURCE_TYPE: 'deleteResourceType', // [DELETE] 리소스 타입을 삭제합니다
  DELETE_ROLE: 'deleteRole', // [DELETE] Delete a role by its name.
  DELETE_USER: 'deleteUser', // [DELETE] Delete a user by their ID.
  DELETE_WORKSPACE: 'deleteWorkspace', // [DELETE] Delete a workspace by its ID.
  DELETE_WORKSPACE_ROLE: 'deleteWorkspaceRole', // [DELETE] Delete a workspace role
  GET_CLOUD_RESOURCE_TYPE_BY_I_D: 'getCloudResourceTypeByID', // [GET] 특정 리소스 타입을 ID로 조회합니다
  GET_CSP_ROLE_BY_I_D: 'getCspRoleByID', // [GET] Get csp role details by ID
  GET_CSP_ROLE_BY_NAME: 'getCspRoleByName', // [GET] Get csp role details by Name
  GET_CSP_ROLE_MAPPING_BY_ROLE_ID: 'getCspRoleMappingByRoleId', // [GET] Get a mapping between role and CSP role
  GET_MCIAM_PERMISSION_BY_I_D: 'getMciamPermissionByID', // [GET] Retrieve permission details by permission ID.
  GET_MENU_BY_I_D: 'getMenuByID', // [POST] Get menu details by ID
  GET_PLATFORM_ACTIONS_BY_PERMISSION_I_D: 'getPlatformActionsByPermissionID', // [GET] Returns all platform actions mapped to a specific permission
  GET_PLATFORM_ROLE_BY_I_D: 'getPlatformRoleByID', // [GET] Get platform role details by ID
  GET_PLATFORM_ROLE_BY_NAME: 'getPlatformRoleByName', // [GET] Get menu role details by Name
  GET_PROJECT_BY_I_D: 'getProjectByID', // [GET] Retrieve project details by project ID.
  GET_PROJECT_BY_NAME: 'getProjectByName', // [GET] Get project details by name
  GET_ROLE_BY_ROLE_I_D: 'getRoleByRoleID', // [GET] Get role details by ID
  GET_ROLE_BY_ROLE_NAME: 'getRoleByRoleName', // [GET] Retrieve role details by role name.
  GET_ROLE_MASTER_MAPPINGS: 'getRoleMasterMappings', // [GET] Get role master mappings
  GET_ROLE_MCIAM_PERMISSIONS: 'getRoleMciamPermissions', // [GET] 특정 역할의 MC-IAM 권한 ID 목록을 조회합니다.
  GET_USER_BY_I_D: 'getUserByID', // [GET] Retrieve user details by user ID.
  GET_USER_BY_KC_I_D: 'getUserByKcID', // [GET] Get user details by KcID
  GET_USER_BY_USERNAME: 'getUserByUsername', // [GET] Get user details by username
  GET_USER_MENU_TREE: 'getUserMenuTree', // [GET] Get menu tree based on user's platform roles
  GET_USER_WORKSPACE_AND_WORKSPACE_ROLES_BY_USER_I_D: 'getUserWorkspaceAndWorkspaceRolesByUserID', // [GET] Get workspaces and roles for a specific user
  GET_USER_WORKSPACE_AND_WORKSPACE_ROLES_BY_USER_I_D_AND_WORKSPACE_I_D: 'getUserWorkspaceAndWorkspaceRolesByUserIDAndWorkspaceID', // [GET] Get workspaces and roles for a specific user and workspace
  GET_USER_WORKSPACE_ROLES: 'getUserWorkspaceRoles', // [GET] Get roles assigned to a user in a workspace
  GET_USER_WORKSPACES_BY_USER_I_D: 'getUserWorkspacesByUserID', // [GET] Get workspaces for a specific user
  GET_WORKSPACE_BY_I_D: 'getWorkspaceByID', // [GET] Retrieve workspace details by workspace ID.
  GET_WORKSPACE_BY_NAME: 'getWorkspaceByName', // [GET] Retrieve specific workspace by name
  GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID: 'getWorkspaceProjectsByWorkspaceId', // [GET] Retrieve project list belonging to specific workspace
  GET_WORKSPACE_ROLE_BY_I_D: 'getWorkspaceRoleByID', // [GET] Get workspace role details by ID
  GET_WORKSPACE_ROLE_BY_NAME: 'getWorkspaceRoleByName', // [GET] Get workspace role details by Name
  INITIALIZE_MENU_PERMISSIONS: 'initializeMenuPermissions', // [GET] CSV 파일을 읽어서 메뉴 권한을 초기화합니다
  LIST_ALL_WORKSPACE_USERS_AND_ROLES: 'listAllWorkspaceUsersAndRoles', // [POST] Retrieve the list of users and roles assigned to the workspace.
  LIST_C_S_P_ROLES: 'listCSPRoles', // [POST] Get a list of all csp roles
  LIST_CLOUD_RESOURCE_TYPES: 'listCloudResourceTypes', // [POST] 모든 리소스 타입 목록을 조회합니다
  LIST_CSP_ROLE_MAPPINGS: 'listCspRoleMappings', // [POST] Get a mapping between role and CSP role
  LIST_MAPPED_MENUS_BY_ROLE: 'listMappedMenusByRole', // [POST] List menus mapped to a specific platform role.
  LIST_MCIAM_PERMISSIONS: 'listMciamPermissions', // [POST] Retrieve a list of all permissions.
  LIST_MENUS: 'listMenus', // [POST] List all menus as a tree structure. Admin permission required.
  LIST_MENUS_TREE: 'listMenusTree', // [POST] List all menus as a tree structure. Admin permission required.
  LIST_PERMISSIONS_BY_ACTION_I_D: 'listPermissionsByActionID', // [GET] Returns all permissions mapped to a specific API action
  LIST_PLATFORM_ACTIONS: 'listPlatformActions', // [POST] Returns all platform actions mapped to a specific permission
  LIST_PLATFORM_ROLES: 'listPlatformRoles', // [POST] Get a list of all menu roles
  LIST_PROJECTS: 'listProjects', // [POST] Retrieve a list of all projects.
  LIST_ROLE_MASTER_MAPPINGS: 'listRoleMasterMappings', // [POST] List role master mappings
  LIST_ROLES: 'listRoles', // [POST] Retrieve a list of all roles.
  LIST_SERVICES_AND_ACTIONS_DB: 'listServicesAndActions', // [POST] Retrieves all MCMP API service and action definitions currently stored in the database.
  LIST_USER_MENU: 'listUserMenu', // [POST] Get the menu list accessible to the current user's platform role.
  LIST_USER_MENU_TREE: 'listUserMenuTree', // [POST] Get the menu tree accessible to the current user's platform role.
  LIST_USER_PROJECTS_BY_WORKSPACE: 'listUserProjectsByWorkspace', // [GET] List projects for the current user
  LIST_USER_WORKSPACE_AND_WORKSPACE_ROLES: 'listUserWorkspaceAndWorkspaceRoles', // [POST] List workspaces and roles for the current user
  LIST_USER_WORKSPACES: 'listUserWorkspaces', // [POST] List workspaces for the current user
  LIST_USERS: 'listUsers', // [POST] Retrieve a list of all users.
  LIST_USERS_AND_ROLES_BY_WORKSPACE: 'listUsersAndRolesByWorkspace', // [POST] Retrieve users and roles list belonging to workspace
  LIST_USERS_BY_CSP_ROLE: 'listUsersByCspRole', // [POST] List users by csp role
  LIST_USERS_BY_PLATFORM_ROLE: 'listUsersByPlatformRole', // [POST] List users by platform role
  LIST_USERS_BY_WORKSPACE_ROLE: 'listUsersByWorkspaceRole', // [POST] List users by workspace role
  LIST_WORKSPACE_ACTIONS_BY_PERMISSION_I_D: 'listWorkspaceActionsByPermissionID', // [POST] Returns all workspace actions mapped to a specific permission
  LIST_WORKSPACE_PROJECTS: 'listWorkspaceProjects', // [POST] Retrieve project list belonging to specific workspace
  LIST_WORKSPACE_ROLES: 'listWorkspaceRoles', // [POST] Get a list of all workspace roles
  LIST_WORKSPACE_USERS: 'listWorkspaceUsers', // [POST] List users by workspace criteria
  LIST_WORKSPACES: 'listWorkspaces', // [POST] Retrieve a list of all workspaces.
  MCIAM_AUTH_CERTS: 'mciamAuthCerts', // [GET] Retrieve authentication certificates for MC-IAM-Manager to be used in target frameworks for token validation.
  MCIAM_CHECK_HEALTH: 'mciamCheckHealth', // [GET] Check the health status of the service.
  MCIAM_CREATE_CREDENTIAL: 'mciamCreateCredential', // [POST] 새로운 CSP 인증 정보를 생성합니다
  MCIAM_DELETE_CREDENTIAL: 'mciamDeleteCredential', // [DELETE] CSP 인증 정보를 삭제합니다
  MCIAM_GET_CREDENTIAL_BY_I_D: 'mciamGetCredentialByID', // [GET] 특정 CSP 인증 정보를 ID로 조회합니다
  MCIAM_GET_TEMP_CREDENTIAL_PROVIDERS: 'mciamGetTempCredentialProviders', // [GET] Get temporary credential provider information for AWS and GCP
  MCIAM_GET_TEMPORARY_CREDENTIALS: 'mciamGetTemporaryCredentials', // [POST] Get temporary credentials for CSP
  MCIAM_LIST_CREDENTIALS: 'mciamListCredentials', // [GET] 모든 CSP 인증 정보 목록을 조회합니다
  MCIAM_LOGIN: 'mciamLogin', // [POST] Authenticate user and issue JWT token.
  MCIAM_LOGOUT: 'mciamLogout', // [POST] Invalidate the user's refresh token and log out.
  MCIAM_REFRESH_TOKEN: 'mciamRefreshToken', // [POST] Refresh JWT access token using a valid refresh token.
  MCIAM_UPDATE_CREDENTIAL: 'mciamUpdateCredential', // [PUT] CSP 인증 정보를 업데이트합니다
  MCIAM_VALIDATE_TOKEN: 'mciamValidateToken', // [POST] Validate the current access token and refresh if expired
  MCIAM_WORKSPACE_TICKET: 'mciamWorkspaceTicket', // [POST] Set workspace ticket
  MCMP_API_CALL: 'mcmpApiCall', // [POST] Executes a defined MCMP API action with parameters structured in McmpApiCallRequest.
  REGISTER_MENUS_FROM_BODY: 'registerMenusFromBody', // [POST] Parse YAML text in the request body and register or update menus in the database. Recommended Content-Type: text/plain, text/yaml, application/yaml.
  REGISTER_MENUS_FROM_Y_A_M_L: 'registerMenusFromYAML', // [POST] Register or update menus from a local YAML file specified by the filePath query parameter, or from the MCWEBCONSOLE_MENUYAML URL in .env if not provided. If loaded from URL, the file is saved to asset/menu/menu.yaml.
  REMOVE_CSP_ROLE_MAPPINGS: 'removeCspRoleMappings', // [DELETE] Delete a mapping between workspace role and CSP role
  REMOVE_MCIAM_PERMISSION_FROM_ROLE: 'removeMciamPermissionFromRole', // [DELETE] 역할에서 MC-IAM 권한을 제거합니다.
  REMOVE_PLATFORM_ROLE: 'removePlatformRole', // [DELETE] Remove a platform role from a user
  REMOVE_PROJECT_FROM_WORKSPACE: 'removeProjectFromWorkspace', // [DELETE] Remove a project from a workspace
  REMOVE_ROLE: 'removeRole', // [DELETE] Remove a role from a user
  REMOVE_USER_FROM_WORKSPACE: 'removeUserFromWorkspace', // [DELETE] Remove a user from a workspace
  REMOVE_WORKSPACE_ROLE: 'removeWorkspaceRole', // [DELETE] Remove a workspace role from a user
  SET_ACTIVE_VERSION: 'setActiveVersion', // [PUT] Sets the specified version of an MCMP API service as the active one.
  SETUP_INITIAL_ADMIN: 'setupInitialAdmin', // [POST] Creates the initial platform admin user with necessary permissions. platform admin 생성인데
  SYNC_MCMP_A_P_IS: 'syncMcmpAPIs', // [POST] Triggers the synchronization of MCMP API definitions from the configured YAML URL to the database.
  SYNC_PROJECTS: 'syncProjects', // [POST] mc-infra-manager의 네임스페이스 목록을 조회하여 로컬 DB에 없는 프로젝트를 추가합니다.
  TEST_CALL_GET_ALL_NS: 'testCallGetAllNs', // [GET] Calls the GetAllNs action of the mc-infra-manager service via the CallApi service.
  UPDATE_CSP_ROLE: 'updateCspRole', // [PUT] Update role information
  UPDATE_MAPPING: 'updateMapping', // [PUT] Updates an existing mapping between a permission and an API action
  UPDATE_MCIAM_PERMISSION: 'updateMciamPermission', // [PUT] Update the details of an existing permission.
  UPDATE_MENU: 'updateMenu', // [PUT] Update menu information
  UPDATE_PROJECT: 'updateProject', // [PUT] Update the details of an existing project.
  UPDATE_RESOURCE_TYPE: 'updateResourceType', // [PUT] 리소스 타입 정보를 업데이트합니다
  UPDATE_ROLE: 'updateRole', // [PUT] Update the details of an existing role.
  UPDATE_USER: 'updateUser', // [PUT] Update the details of an existing user.
  UPDATE_USER_STATUS: 'updateUserStatus', // [POST] Update user status (active/inactive)
  UPDATE_WORKSPACE: 'updateWorkspace', // [PUT] Update the details of an existing workspace.

  // Aliases for backward compatibility
  GET_MENU_LIST: 'listMenus', // Alias for LIST_MENUS
  GET_PERMISSIONS: 'listMciamPermissions', // Alias for LIST_MCIAM_PERMISSIONS
  GET_PERMISSION: 'getMciamPermissionByID', // Alias for GET_MCIAM_PERMISSION_BY_I_D
  APPEND_PERMISSION: 'createMciamPermission', // Alias for CREATE_MCIAM_PERMISSION (append = create for permissions)
  UPDATE_PERMISSION: 'updateMciamPermission', // Alias for UPDATE_MCIAM_PERMISSION
  DELETE_PERMISSION: 'deleteMciamPermission', // Alias for DELETE_MCIAM_PERMISSION

  // ==================== mc-workflow-manager (59 operations) ====================
  CHECK_CONNECTION_USING_G_E_T: 'checkConnectionUsingGET', // [GET] checkConnection
  // CHECK_CONNECTION_USING_P_O_S_T: 'checkConnectionUsingPOST', // [POST] checkConnection (duplicate - already in mc-application-manager)
  DELETE_EVENT_LISTNER_USING_D_E_L_E_T_E: 'deleteEventListnerUsingDELETE', // [DELETE] deleteEventListner
  // DELETE_OSS_TYPE_USING_D_E_L_E_T_E: 'deleteOssTypeUsingDELETE', // [DELETE] deleteOssType (duplicate - already in mc-application-manager)
  // DELETE_OSS_USING_D_E_L_E_T_E: 'deleteOssUsingDELETE', // [DELETE] deleteOss (duplicate - already in mc-application-manager)
  DELETE_WORKFLOW_STAGE_TYPE_USING_D_E_L_E_T_E: 'deleteWorkflowStageTypeUsingDELETE', // [DELETE] deleteWorkflowStageType
  DELETE_WORKFLOW_STAGE_USING_D_E_L_E_T_E: 'deleteWorkflowStageUsingDELETE', // [DELETE] deleteWorkflowStage
  DELETE_WORKFLOW_USING_D_E_L_E_T_E: 'deleteWorkflowUsingDELETE', // [DELETE] deleteWorkflow
  DETAIL_EVENT_LISTENER_USING_G_E_T: 'detailEventListenerUsingGET', // [GET] detailEventListener
  DETAIL_WORKFLOW_STAGE_TYPE_USING_G_E_T: 'detailWorkflowStageTypeUsingGET', // [GET] detailWorkflowStageType
  DETAIL_WORKFLOW_STAGE_USING_G_E_T: 'detailWorkflowStageUsingGET', // [GET] detailWorkflowStage
  ERROR_USING_D_E_L_E_T_E: 'errorUsingDELETE', // [DELETE] error
  ERROR_USING_G_E_T: 'errorUsingGET', // [GET] error
  ERROR_USING_H_E_A_D: 'errorUsingHEAD', // [HEAD] error
  ERROR_USING_O_P_T_I_O_N_S: 'errorUsingOPTIONS', // [OPTIONS] error
  ERROR_USING_P_A_T_C_H: 'errorUsingPATCH', // [PATCH] error
  ERROR_USING_P_O_S_T: 'errorUsingPOST', // [POST] error
  ERROR_USING_P_U_T: 'errorUsingPUT', // [PUT] error
  GET_DEFAULT_WORKFLOW_STAGE_USING_G_E_T: 'getDefaultWorkflowStageUsingGET', // [GET] getDefaultWorkflowStage
  GET_EVENT_LISTENER_LIST_USING_G_E_T: 'getEventListenerListUsingGET', // [GET] getEventListenerList
  // GET_OSS_LIST_USING_G_E_T: 중복 제거 (mc-application-manager에 이미 정의됨)
  // GET_OSS_LIST_USING_G_E_T_1: 중복 제거 (mc-application-manager에 이미 정의됨)
  GET_OSS_TYPE_FILTERED_LIST_USING_G_E_T: 'getOssTypeFilteredListUsingGET', // [GET] getOssTypeFilteredList
  // GET_OSS_TYPE_LIST_USING_G_E_T: 중복 제거 (mc-application-manager에 이미 정의됨)
  GET_WORKFLOW_DETAIL_USING_G_E_T: 'getWorkflowDetailUsingGET', // [GET] getWorkflowDetail
  GET_WORKFLOW_HISTORY_LIST_USING_G_E_T: 'getWorkflowHistoryListUsingGET', // [GET] getWorkflowHistoryList
  GET_WORKFLOW_LIST_USING_G_E_T: 'getWorkflowListUsingGET', // [GET] getWorkflowList
  GET_WORKFLOW_LIST_USING_G_E_T_1: 'getWorkflowListUsingGET_1', // [GET] getWorkflowList
  GET_WORKFLOW_LOG_USING_G_E_T: 'getWorkflowLogUsingGET', // [GET] getWorkflowLog
  GET_WORKFLOW_PARAM_LIST_USING_G_E_T: 'getWorkflowParamListUsingGET', // [GET] getWorkflowParamList
  GET_WORKFLOW_RUN_HISTORY_LIST_USING_G_E_T: 'getWorkflowRunHistoryListUsingGET', // [GET] getWorkflowRunHistoryList
  GET_WORKFLOW_STAGE_HISTORY_LIST_USING_G_E_T: 'getWorkflowStageHistoryListUsingGET', // [GET] getWorkflowStageHistoryList
  GET_WORKFLOW_STAGE_LIST_USING_G_E_T: 'getWorkflowStageListUsingGET', // [GET] getWorkflowStageList
  GET_WORKFLOW_STAGE_LIST_USING_G_E_T_1: 'getWorkflowStageListUsingGET_1', // [GET] getWorkflowStageList
  GET_WORKFLOW_STAGE_LIST_USING_G_E_T_2: 'getWorkflowStageListUsingGET_2', // [GET] getWorkflowStageList
  GET_WORKFLOW_TEMPLATE_USING_G_E_T: 'getWorkflowTemplateUsingGET', // [GET] getWorkflowTemplate
  GET_WORKFLOW_USING_G_E_T: 'getWorkflowUsingGET', // [GET] getWorkflow
  IS_EVENT_LISTENER_DUPLICATED_USING_G_E_T: 'isEventListenerDuplicatedUsingGET', // [GET] isEventListenerDuplicated
  // IS_OSS_INFO_DUPLICATED_USING_G_E_T: 중복 제거 (mc-application-manager에 이미 정의됨)
  IS_WORKFLOW_NAME_DUPLICATED_USING_G_E_T: 'isWorkflowNameDuplicatedUsingGET', // [GET] isWorkflowNameDuplicated
  IS_WORKFLOW_STAGE_NAME_DUPLICATED_USING_G_E_T: 'isWorkflowStageNameDuplicatedUsingGET', // [GET] isWorkflowStageNameDuplicated
  // OPENAPI_JSON_USING_G_E_T: 중복 제거 (mc-application-manager에 이미 정의됨)
  // OPENAPI_JSON_USING_G_E_T_1: 중복 제거 (mc-application-manager에 이미 정의됨)
  // OPENAPI_YAML_USING_G_E_T: 중복 제거 (mc-application-manager에 이미 정의됨)
  // REDIRECT_TO_UI_USING_G_E_T: 중복 제거 (mc-application-manager에 이미 정의됨)
  REGIST_EVENT_LISTNER_USING_P_O_S_T: 'registEventListnerUsingPOST', // [POST] registEventListner
  // REGIST_OSS_TYPE_USING_P_O_S_T: 중복 제거 (mc-application-manager에 이미 정의됨)
  // REGIST_OSS_USING_P_O_S_T: 중복 제거 (mc-application-manager에 이미 정의됨)
  REGIST_WORKFLOW_STAGE_USING_P_O_S_T: 'registWorkflowStageUsingPOST', // [POST] registWorkflowStage
  REGIST_WORKFLOW_STAGE_USING_P_O_S_T_1: 'registWorkflowStageUsingPOST_1', // [POST] registWorkflowStage
  REGIST_WORKFLOW_USING_P_O_S_T: 'registWorkflowUsingPOST', // [POST] registWorkflow
  RUN_EVENT_LISTENER_USING_G_E_T: 'runEventListenerUsingGET', // [GET] runEventListener
  RUN_WORKFLOW_GET_USING_G_E_T: 'runWorkflowGetUsingGET', // [GET] runWorkflowGet
  RUN_WORKFLOW_POST_USING_P_O_S_T: 'runWorkflowPostUsingPOST', // [POST] runWorkflowPost
  UPDATE_EVENT_LISTNER_USING_P_A_T_C_H: 'updateEventListnerUsingPATCH', // [PATCH] updateEventListner
  // UPDATE_OSS_TYPE_USING_P_A_T_C_H: 중복 제거 (mc-application-manager에 이미 정의됨)
  // UPDATE_OSS_USING_P_A_T_C_H: 중복 제거 (mc-application-manager에 이미 정의됨)
  UPDATE_WORKFLOW_STAGE_TYPE_USING_P_A_T_C_H: 'updateWorkflowStageTypeUsingPATCH', // [PATCH] updateWorkflowStageType
  UPDATE_WORKFLOW_STAGE_USING_P_A_T_C_H: 'updateWorkflowStageUsingPATCH', // [PATCH] updateWorkflowStage
  UPDATE_WORKFLOW_USING_P_A_T_C_H: 'updateWorkflowUsingPATCH', // [PATCH] updateWorkflow

  // ========== Alarms History ==========
  GET_ALARMS_LIST: 'Gettriggerpolicyalllist',
  GET_ALARM_DETAIL: 'Gettriggerhistoryalllist',

  // ========== Missing Operations (To be mapped to correct backend APIs) ==========
  // Resources
  GET_RESOURCES_OVERVIEW: 'getResourcesOverview',
  GET_DISK_LIST: 'getDiskList',
  GET_DISK: 'getDisk',
  CREATE_DISK: 'createDisk',
  UPDATE_DISK: 'updateDisk',
  DELETE_DISK: 'deleteDisk',
  GET_NETWORK_LIST: 'getNetworkList',
  GET_NETWORK: 'getNetwork',
  CREATE_NETWORK: 'createNetwork',
  DELETE_NETWORK: 'deleteNetwork',
  GET_SECURITY_GROUP_LIST: 'getSecurityGroupList',
  GET_SECURITY_GROUP: 'getSecurityGroup',
  CREATE_SECURITY_GROUP: 'createSecurityGroup',
  DELETE_SECURITY_GROUP: 'deleteSecurityGroup',
  GET_SSH_KEY_LIST: 'getSshKeyList',
  GET_SSH_KEY: 'getSshKey',
  CREATE_SSH_KEY: 'createSshKey',
  UPDATE_SSH_KEY: 'updateSshKey',
  DELETE_SSH_KEY: 'deleteSshKey',
  GET_SPEC_LIST: 'getSpecList',
  GET_SPEC: 'getSpec',
  CREATE_SPEC: 'createSpec',
  UPDATE_SPEC: 'updateSpec',
  DELETE_SPEC: 'deleteSpec',
  GET_IMAGE_LIST: 'getImageList',
  GET_IMAGE: 'getImage',
  CREATE_IMAGE: 'createImage',
  UPDATE_IMAGE: 'updateImage',
  DELETE_IMAGE: 'deleteImage',
  GET_MY_IMAGE_LIST: 'getMyImageList',
  GET_MY_IMAGE: 'getMyImage',
  CREATE_MY_IMAGE: 'createMyImage',
  DELETE_MY_IMAGE: 'deleteMyImage',

  // Credentials
  GET_CREDENTIAL_LIST: 'getCredentialList',
  GET_CREDENTIAL: 'getCredential',
  REGISTER_CREDENTIAL: 'registerCredential',

  // PMK
  GET_ALL_K8S_CLUSTER: 'getAllK8sCluster',
  GET_PMK_CLUSTER_DETAIL: 'getPmkClusterDetail',
  CREATE_PMK_CLUSTER: 'createPmkCluster',
  DELETE_PMK_CLUSTER: 'deletePmkCluster',

  // Monitoring
  GET_MONITORING_CONFIG_DETAIL: 'getMonitoringConfigDetail',
  GET_MONITOR_METRICS_LIST: 'getMonitorMetricsList',
  GET_METRIC_PLUGINS_LIST: 'getMetricPluginsList',
  GET_MEASUREMENTS_LIST: 'getMeasurementsList',
  GET_METRICS_LIST: 'getMetricsList',
  GET_MONITORING_DATA: 'getMonitoringData',

  // Logs
  GET_LOGS_LIST: 'getLogsList',
  GET_LOG_DETAIL: 'getLogDetail',

  // Servers
  GET_SERVERS_LIST: 'getServersList',

  // Users & Workspaces
  GET_USERS_LIST: 'getUsersList',
  GET_USER_DETAIL: 'getUserDetail',
  GET_WORKSPACES_SUMMARY: 'getWorkspacesSummary',
  ADD_USER_ROLE_MAPPING: 'addUserRoleMapping',
  REMOVE_USER_ROLE_MAPPING: 'removeUserRoleMapping',

  // Menu
  GET_MENU_BY_ID: 'getMenuById',

} as const;

export type OperationId = typeof OPERATION_IDS[keyof typeof OPERATION_IDS];

/**
 * 서비스별 OperationId 매핑
 * getSubsystemName 함수에서 사용
 */
export const OPERATION_ID_TO_SUBSYSTEM: Record<string, string> = {
  // mc-web-console (11 operations)
  [OPERATION_IDS.ANYCONTROLLER]: 'mc-web-console',
  [OPERATION_IDS.AVAILABLEDISKTYPEBYPROVIDERREGION]: 'mc-web-console',
  [OPERATION_IDS.CREATEMENURESOURCES]: 'mc-web-console',
  [OPERATION_IDS.DISKLOOKUP]: 'mc-web-console',
  [OPERATION_IDS.GETMENUTREE]: 'mc-web-console',
  [OPERATION_IDS.WEBGETUSERINFO]: 'mc-web-console',
  [OPERATION_IDS.WEBLOGIN]: 'mc-web-console',
  [OPERATION_IDS.WEBLOGINREFRESH]: 'mc-web-console',
  [OPERATION_IDS.WEBLOGOUT]: 'mc-web-console',
  [OPERATION_IDS.WEBVALIDATE]: 'mc-web-console',
  [OPERATION_IDS.LIST_SERVICES_AND_ACTIONS]: 'mc-web-console',

  // mc-application-manager (66 operations)
  [OPERATION_IDS.CHECK_CONNECTION_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.CREATE_CATALOG_REF_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.CREATE_CATALOG_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.CREATE_COMPONENT_BY_TEXT_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.CREATE_COMPONENT_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.CREATE_MANIFEST_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.CREATE_REPOSITORY_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.CREATE_REPOSITORY_USING_P_O_S_T_1]: 'mc-application-manager',
  [OPERATION_IDS.DELETE_CATALOG_REF_WORKFLOW_USING_D_E_L_E_T_E]: 'mc-application-manager',
  [OPERATION_IDS.DELETE_CATALOG_USING_D_E_L_E_T_E]: 'mc-application-manager',
  [OPERATION_IDS.DELETE_COMPONENT_USING_D_E_L_E_T_E]: 'mc-application-manager',
  [OPERATION_IDS.DELETE_OSS_TYPE_USING_D_E_L_E_T_E]: 'mc-application-manager',
  [OPERATION_IDS.DELETE_OSS_USING_D_E_L_E_T_E]: 'mc-application-manager',
  [OPERATION_IDS.DELETE_REPOSITORY_FILE_USING_D_E_L_E_T_E]: 'mc-application-manager',
  [OPERATION_IDS.DELETE_REPOSITORY_USING_D_E_L_E_T_E]: 'mc-application-manager',
  [OPERATION_IDS.DELETE_REPOSITORY_USING_D_E_L_E_T_E_1]: 'mc-application-manager',
  [OPERATION_IDS.DETAIL_OSS_TYPE_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.DETAIL_OSS_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.ERROR_HTML_USING_D_E_L_E_T_E]: 'mc-application-manager',
  [OPERATION_IDS.ERROR_HTML_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.ERROR_HTML_USING_H_E_A_D]: 'mc-application-manager',
  [OPERATION_IDS.ERROR_HTML_USING_O_P_T_I_O_N_S]: 'mc-application-manager',
  [OPERATION_IDS.ERROR_HTML_USING_P_A_T_C_H]: 'mc-application-manager',
  [OPERATION_IDS.ERROR_HTML_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.ERROR_HTML_USING_P_U_T]: 'mc-application-manager',
  [OPERATION_IDS.EXEC_WORKFLOW_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.GENERATE_CONFIGMAP_YAML_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.GENERATE_DEPLOYMENT_YAML_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.GENERATE_H_P_A_YAML_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.GENERATE_POD_YAML_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.GENERATE_SERVICE_YAML_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_ARTIFACT_HUB_LIST_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_CATALOG_DETAIL_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_CATALOG_LIST_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_CATALOG_REFERENCE_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_COMPONENT_DETAIL_BY_NAME_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_COMPONENT_LIST_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_DOCKER_HUB_LIST_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_MANIFEST_DETAIL_TXT_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_MANIFEST_DETAIL_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_MANIFEST_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_OSS_LIST_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_OSS_LIST_USING_G_E_T_1]: 'mc-application-manager',
  [OPERATION_IDS.GET_OSS_TYPE_LIST_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_REPOSITORY_DETAIL_BY_NAME_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_REPOSITORY_FILE_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_REPOSITORY_LIST_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.GET_REPOSITORY_LIST_USING_G_E_T_1]: 'mc-application-manager',
  [OPERATION_IDS.GET_REPOSITORY_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.INSERT_REPOSITORY_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.IS_OSS_INFO_DUPLICATED_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.OPENAPI_JSON_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.OPENAPI_JSON_USING_G_E_T_1]: 'mc-application-manager',
  [OPERATION_IDS.OPENAPI_YAML_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.REDIRECT_TO_UI_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.REGIST_OSS_TYPE_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.REGIST_OSS_USING_P_O_S_T]: 'mc-application-manager',
  [OPERATION_IDS.SAVE_MANIFEST_USING_G_E_T]: 'mc-application-manager',
  [OPERATION_IDS.UPDATE_CATALOG_USING_P_U_T]: 'mc-application-manager',
  [OPERATION_IDS.UPDATE_MANIFEST_USING_D_E_L_E_T_E]: 'mc-application-manager',
  [OPERATION_IDS.UPDATE_MANIFEST_USING_P_U_T]: 'mc-application-manager',
  [OPERATION_IDS.UPDATE_OSS_TYPE_USING_P_A_T_C_H]: 'mc-application-manager',
  [OPERATION_IDS.UPDATE_OSS_USING_P_A_T_C_H]: 'mc-application-manager',
  [OPERATION_IDS.UPDATE_REPOSITORY_USING_P_U_T]: 'mc-application-manager',
  [OPERATION_IDS.UPDATE_REPOSITORY_USING_P_U_T_1]: 'mc-application-manager',
  [OPERATION_IDS.UPLOAD_FILES_USING_P_O_S_T]: 'mc-application-manager',

  // mc-infra-manager (13 operations)
  [OPERATION_IDS.GET_ALL_MCI]: 'mc-infra-manager',
  [OPERATION_IDS.GET_MCI]: 'mc-infra-manager',
  [OPERATION_IDS.GET_CONTROL_MCI]: 'mc-infra-manager',
  [OPERATION_IDS.DEL_MCI]: 'mc-infra-manager',
  [OPERATION_IDS.POST_MCI_DYNAMIC]: 'mc-infra-manager',
  [OPERATION_IDS.POST_MCI_DYNAMIC_CHECK_REQUEST]: 'mc-infra-manager',
  [OPERATION_IDS.POST_MCI_DYNAMIC_REVIEW]: 'mc-infra-manager',
  [OPERATION_IDS.POST_MCI_SUBGROUP_DYNAMIC]: 'mc-infra-manager',
  [OPERATION_IDS.POST_MCI_DYNAMIC_SUBGROUP_VM_REVIEW]: 'mc-infra-manager',
  [OPERATION_IDS.POST_MCI_VM]: 'mc-infra-manager',
  [OPERATION_IDS.GET_MCI_POLICY]: 'mc-infra-manager',
  [OPERATION_IDS.POST_MCI_POLICY]: 'mc-infra-manager',
  [OPERATION_IDS.RECOMMEND_SPEC]: 'mc-infra-manager',
  [OPERATION_IDS.RECOMMEND_SPEC_OPTIONS]: 'mc-infra-manager',
  [OPERATION_IDS.GET_ALL_IMAGE]: 'mc-infra-manager',
  [OPERATION_IDS.SEARCH_IMAGE]: 'mc-infra-manager',

  // mc-cost-optimizer (14 operations)
  [OPERATION_IDS.GET_ABRNORMAL_RCMD]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_ALARM_HISTORY]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_BILL_ASSET]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_BILLING_BASE_INFO]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_CUR_MONTH_BILL]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_INST_OPTI_SIZE_RCMD]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_INVOICE]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_PROJECTS]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_READYZ]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_SUMMARY]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_TOP5_BILL]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_TOTAL_DAILY_BILL]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_TOTAL_MONTHLY_BILL]: 'mc-cost-optimizer',
  [OPERATION_IDS.GET_UNOPTIMIZED_RCMD]: 'mc-cost-optimizer',

  // mc-iam-manager (133 operations) - 기존 + 추가
  [OPERATION_IDS.APPEND_WORKSPACE_ACTION_TO_PERMISSION]: 'mc-iam-manager',
  [OPERATION_IDS.ASSIGN_MCIAM_PERMISSION_TO_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.ASSIGN_WORKSPACE_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_ACTION_CATEGORY]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_CSP_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_CSP_ROLE_MAPPING]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_MCMP_API_PERMISSION_ACTION_MAPPING]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_MENU]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_MENUS_ROLES_MAPPING]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_PLATFORM_ACTION]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_PLATFORM_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_PROJECT]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_RESOURCE_TYPE]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_USER]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_WORKSPACE]: 'mc-iam-manager',
  [OPERATION_IDS.CREATE_WORKSPACE_ACTION]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_ACTION_CATEGORY]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_CSP_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_MENU]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_MENUS_ROLES_MAPPING]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_PLATFORM_ACTION]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_PLATFORM_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_PROJECT]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_RESOURCE_TYPE]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_USER]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_WORKSPACE]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_WORKSPACE_ACTION]: 'mc-iam-manager',
  [OPERATION_IDS.GET_ACTION_CATEGORIES]: 'mc-iam-manager',
  [OPERATION_IDS.GET_ACTION_CATEGORY]: 'mc-iam-manager',
  [OPERATION_IDS.GET_CLOUD_RESOURCE_TYPE_BY_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_CSP_ROLE_BY_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_CSP_ROLE_BY_NAME]: 'mc-iam-manager',
  [OPERATION_IDS.GET_CSP_ROLE_MAPPING_BY_ROLE_ID]: 'mc-iam-manager',
  [OPERATION_IDS.GET_MENU_BY_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_PLATFORM_ACTIONS_BY_PERMISSION_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_PLATFORM_ROLE_BY_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_PLATFORM_ROLE_BY_NAME]: 'mc-iam-manager',
  [OPERATION_IDS.GET_PROJECT_BY_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_PROJECT_BY_NAME]: 'mc-iam-manager',
  [OPERATION_IDS.GET_ROLE_BY_ROLE_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_ROLE_BY_ROLE_NAME]: 'mc-iam-manager',
  [OPERATION_IDS.GET_ROLE_MASTER_MAPPINGS]: 'mc-iam-manager',
  [OPERATION_IDS.GET_ROLE_MCIAM_PERMISSIONS]: 'mc-iam-manager',
  [OPERATION_IDS.GET_USER_BY_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_USER_BY_KC_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_USER_BY_USERNAME]: 'mc-iam-manager',
  [OPERATION_IDS.GET_USER_MENU_TREE]: 'mc-iam-manager',
  [OPERATION_IDS.GET_USER_WORKSPACE_AND_WORKSPACE_ROLES_BY_USER_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_WORKSPACE_BY_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.GET_WORKSPACE_BY_NAME]: 'mc-iam-manager',
  [OPERATION_IDS.GET_WORKSPACE_PROJECTS_BY_WORKSPACE_ID]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_USER]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_WORKSPACE]: 'mc-iam-manager',
  [OPERATION_IDS.GET_MENU_LIST]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_MENU]: 'mc-iam-manager',
  [OPERATION_IDS.GET_PERMISSIONS]: 'mc-iam-manager',
  [OPERATION_IDS.GET_PERMISSION]: 'mc-iam-manager',
  [OPERATION_IDS.APPEND_PERMISSION]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_PERMISSION]: 'mc-iam-manager',
  [OPERATION_IDS.DELETE_PERMISSION]: 'mc-iam-manager',
  [OPERATION_IDS.INITIALIZE_MENU_PERMISSIONS]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_CSP_ROLES]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_CSP_ROLE_MAPPINGS]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_MAPPED_MENUS_BY_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_MENUS_TREE]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_PERMISSIONS_BY_ACTION_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_PLATFORM_ACTIONS]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_PLATFORM_ACTIONS_BY_CATEGORY_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_PLATFORM_ROLES]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_PROJECTS]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_USERS]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_USERS_AND_ROLES_BY_WORKSPACE]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_USER_MENU]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_USER_MENU_TREE]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_USER_WORKSPACE_AND_WORKSPACE_ROLES]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_USER_WORKSPACES]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_WORKSPACE_ACTIONS_BY_PERMISSION_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_WORKSPACE_PROJECTS]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_WORKSPACE_ROLES]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_WORKSPACE_USERS]: 'mc-iam-manager',
  [OPERATION_IDS.LIST_WORKSPACES]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_AUTH_CERTS]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_CHECK_HEALTH]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_CREATE_CREDENTIAL]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_DELETE_CREDENTIAL]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_GET_CREDENTIAL_BY_I_D]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_GET_TEMP_CREDENTIAL_PROVIDERS]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_GET_TEMPORARY_CREDENTIALS]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_LIST_CREDENTIALS]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_LOGIN]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_LOGOUT]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_REFRESH_TOKEN]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_UPDATE_CREDENTIAL]: 'mc-iam-manager',
  [OPERATION_IDS.MCIAM_VALIDATE_TOKEN]: 'mc-iam-manager',
  [OPERATION_IDS.REGISTER_MENUS_FROM_BODY]: 'mc-iam-manager',
  [OPERATION_IDS.REGISTER_MENUS_FROM_Y_A_M_L]: 'mc-iam-manager',
  [OPERATION_IDS.REMOVE_MCIAM_PERMISSION_FROM_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.REMOVE_USER_FROM_WORKSPACE]: 'mc-iam-manager',
  [OPERATION_IDS.REMOVE_WORKSPACE_ACTION_FROM_PERMISSION]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_ACTION_CATEGORY]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_CSP_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_PLATFORM_ACTION]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_PLATFORM_ROLE]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_PROJECT]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_RESOURCE_TYPE]: 'mc-iam-manager',
  [OPERATION_IDS.UPDATE_USER_STATUS]: 'mc-iam-manager',

  // mc-workflow-manager (47 operations - 3 duplicates removed)
  [OPERATION_IDS.CHECK_CONNECTION_USING_G_E_T]: 'mc-workflow-manager',
  // [OPERATION_IDS.CHECK_CONNECTION_USING_P_O_S_T]: 'mc-workflow-manager', // duplicate
  [OPERATION_IDS.DELETE_EVENT_LISTNER_USING_D_E_L_E_T_E]: 'mc-workflow-manager',
  // [OPERATION_IDS.DELETE_OSS_TYPE_USING_D_E_L_E_T_E]: 'mc-workflow-manager', // duplicate
  // [OPERATION_IDS.DELETE_OSS_USING_D_E_L_E_T_E]: 'mc-workflow-manager', // duplicate
  [OPERATION_IDS.DELETE_WORKFLOW_STAGE_USING_D_E_L_E_T_E]: 'mc-workflow-manager',
  [OPERATION_IDS.DELETE_WORKFLOW_USING_D_E_L_E_T_E]: 'mc-workflow-manager',
  [OPERATION_IDS.ERROR_USING_D_E_L_E_T_E]: 'mc-workflow-manager',
  [OPERATION_IDS.ERROR_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.ERROR_USING_H_E_A_D]: 'mc-workflow-manager',
  [OPERATION_IDS.ERROR_USING_O_P_T_I_O_N_S]: 'mc-workflow-manager',
  [OPERATION_IDS.ERROR_USING_P_A_T_C_H]: 'mc-workflow-manager',
  [OPERATION_IDS.ERROR_USING_P_O_S_T]: 'mc-workflow-manager',
  [OPERATION_IDS.ERROR_USING_P_U_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_DEFAULT_WORKFLOW_STAGE_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_EVENT_LISTENER_LIST_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_OSS_TYPE_FILTERED_LIST_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_DETAIL_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_HISTORY_LIST_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_LIST_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_LIST_USING_G_E_T_1]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_LOG_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_PARAM_LIST_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_RUN_HISTORY_LIST_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_STAGE_HISTORY_LIST_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_STAGE_LIST_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_STAGE_LIST_USING_G_E_T_1]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_STAGE_LIST_USING_G_E_T_2]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_TEMPLATE_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.GET_WORKFLOW_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.IS_EVENT_LISTENER_DUPLICATED_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.IS_WORKFLOW_NAME_DUPLICATED_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.IS_WORKFLOW_STAGE_NAME_DUPLICATED_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.REGIST_EVENT_LISTNER_USING_P_O_S_T]: 'mc-workflow-manager',
  [OPERATION_IDS.REGIST_WORKFLOW_STAGE_USING_P_O_S_T]: 'mc-workflow-manager',
  [OPERATION_IDS.REGIST_WORKFLOW_STAGE_USING_P_O_S_T_1]: 'mc-workflow-manager',
  [OPERATION_IDS.REGIST_WORKFLOW_USING_P_O_S_T]: 'mc-workflow-manager',
  [OPERATION_IDS.RUN_EVENT_LISTENER_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.RUN_WORKFLOW_GET_USING_G_E_T]: 'mc-workflow-manager',
  [OPERATION_IDS.RUN_WORKFLOW_POST_USING_P_O_S_T]: 'mc-workflow-manager',
  [OPERATION_IDS.UPDATE_EVENT_LISTNER_USING_P_A_T_C_H]: 'mc-workflow-manager',
  [OPERATION_IDS.UPDATE_WORKFLOW_STAGE_TYPE_USING_P_A_T_C_H]: 'mc-workflow-manager',
  [OPERATION_IDS.UPDATE_WORKFLOW_STAGE_USING_P_A_T_C_H]: 'mc-workflow-manager',
  [OPERATION_IDS.UPDATE_WORKFLOW_USING_P_A_T_C_H]: 'mc-workflow-manager',

  // mc-observability (2 operations)
  [OPERATION_IDS.GET_ALARMS_LIST]: 'mc-observability',
  [OPERATION_IDS.GET_ALARM_DETAIL]: 'mc-observability',
  [OPERATION_IDS.GET_MONITORING_CONFIG_DETAIL]: 'mc-observability',
  [OPERATION_IDS.GET_MONITOR_METRICS_LIST]: 'mc-observability',
  [OPERATION_IDS.GET_METRIC_PLUGINS_LIST]: 'mc-observability',
  [OPERATION_IDS.GET_MEASUREMENTS_LIST]: 'mc-observability',
  [OPERATION_IDS.GET_METRICS_LIST]: 'mc-observability',
  [OPERATION_IDS.GET_MONITORING_DATA]: 'mc-observability',
  [OPERATION_IDS.GET_LOGS_LIST]: 'mc-observability',
  [OPERATION_IDS.GET_LOG_DETAIL]: 'mc-observability',

  // mc-infra-manager - Additional Resources (missing operations)
  [OPERATION_IDS.GET_RESOURCES_OVERVIEW]: 'mc-infra-manager',
  [OPERATION_IDS.GET_DISK_LIST]: 'mc-infra-manager',
  [OPERATION_IDS.GET_DISK]: 'mc-infra-manager',
  [OPERATION_IDS.CREATE_DISK]: 'mc-infra-manager',
  [OPERATION_IDS.UPDATE_DISK]: 'mc-infra-manager',
  [OPERATION_IDS.DELETE_DISK]: 'mc-infra-manager',
  [OPERATION_IDS.GET_NETWORK_LIST]: 'mc-infra-manager',
  [OPERATION_IDS.GET_NETWORK]: 'mc-infra-manager',
  [OPERATION_IDS.CREATE_NETWORK]: 'mc-infra-manager',
  [OPERATION_IDS.DELETE_NETWORK]: 'mc-infra-manager',
  [OPERATION_IDS.GET_SECURITY_GROUP_LIST]: 'mc-infra-manager',
  [OPERATION_IDS.GET_SECURITY_GROUP]: 'mc-infra-manager',
  [OPERATION_IDS.CREATE_SECURITY_GROUP]: 'mc-infra-manager',
  [OPERATION_IDS.DELETE_SECURITY_GROUP]: 'mc-infra-manager',
  [OPERATION_IDS.GET_SSH_KEY_LIST]: 'mc-infra-manager',
  [OPERATION_IDS.GET_SSH_KEY]: 'mc-infra-manager',
  [OPERATION_IDS.CREATE_SSH_KEY]: 'mc-infra-manager',
  [OPERATION_IDS.UPDATE_SSH_KEY]: 'mc-infra-manager',
  [OPERATION_IDS.DELETE_SSH_KEY]: 'mc-infra-manager',
  [OPERATION_IDS.GET_SPEC_LIST]: 'mc-infra-manager',
  [OPERATION_IDS.GET_SPEC]: 'mc-infra-manager',
  [OPERATION_IDS.CREATE_SPEC]: 'mc-infra-manager',
  [OPERATION_IDS.UPDATE_SPEC]: 'mc-infra-manager',
  [OPERATION_IDS.DELETE_SPEC]: 'mc-infra-manager',
  [OPERATION_IDS.GET_IMAGE_LIST]: 'mc-infra-manager',
  [OPERATION_IDS.GET_IMAGE]: 'mc-infra-manager',
  [OPERATION_IDS.CREATE_IMAGE]: 'mc-infra-manager',
  [OPERATION_IDS.UPDATE_IMAGE]: 'mc-infra-manager',
  [OPERATION_IDS.DELETE_IMAGE]: 'mc-infra-manager',
  [OPERATION_IDS.GET_MY_IMAGE_LIST]: 'mc-infra-manager',
  [OPERATION_IDS.GET_MY_IMAGE]: 'mc-infra-manager',
  [OPERATION_IDS.CREATE_MY_IMAGE]: 'mc-infra-manager',
  [OPERATION_IDS.DELETE_MY_IMAGE]: 'mc-infra-manager',
  [OPERATION_IDS.GET_CREDENTIAL_LIST]: 'mc-infra-manager',
  [OPERATION_IDS.GET_CREDENTIAL]: 'mc-infra-manager',
  [OPERATION_IDS.REGISTER_CREDENTIAL]: 'mc-infra-manager',
  [OPERATION_IDS.GET_SERVERS_LIST]: 'mc-infra-manager',

  // mc-k8s-manager - PMK operations
  [OPERATION_IDS.GET_ALL_K8S_CLUSTER]: 'mc-k8s-manager',
  [OPERATION_IDS.GET_PMK_CLUSTER_DETAIL]: 'mc-k8s-manager',
  [OPERATION_IDS.CREATE_PMK_CLUSTER]: 'mc-k8s-manager',
  [OPERATION_IDS.DELETE_PMK_CLUSTER]: 'mc-k8s-manager',

  // mc-iam-manager - Additional operations
  [OPERATION_IDS.GET_USERS_LIST]: 'mc-iam-manager',
  [OPERATION_IDS.GET_USER_DETAIL]: 'mc-iam-manager',
  [OPERATION_IDS.GET_WORKSPACES_SUMMARY]: 'mc-iam-manager',
  [OPERATION_IDS.ADD_USER_ROLE_MAPPING]: 'mc-iam-manager',
  [OPERATION_IDS.REMOVE_USER_ROLE_MAPPING]: 'mc-iam-manager',
  [OPERATION_IDS.GET_MENU_BY_ID]: 'mc-iam-manager',
};
