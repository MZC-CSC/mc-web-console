/**
 * MCI Workloads 타입 정의
 * API 스펙 기반 TypeScript 타입 정의
 * @see mc-web-console-spec/00_workflow/00_operations/02_mc-infra-manager
 */

// ============================================================================
// Status Types
// ============================================================================

/**
 * MCI/VM Status enumeration
 */
export type MciStatus =
  | 'creating'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'resuming'
  | 'suspended'
  | 'suspending'
  | 'rebooting'
  | 'terminating'
  | 'terminated'
  | 'failed'
  | 'undefined';

/**
 * MCI Action types for control operations
 */
export type MciAction = 'suspend' | 'resume' | 'reboot' | 'terminate' | 'refine';

/**
 * Policy for handling partial failures during MCI creation
 */
export type PolicyOnPartialFailure = 'continue' | 'rollback' | 'refine';

/**
 * Status count information from API (정확한 필드명)
 * @see model.StatusCountInfo
 */
export interface StatusCountInfo {
  countTotal: number;
  countCreating: number;
  countRunning: number;
  countStopping?: number;
  countStopped?: number;
  countResuming: number;
  countSuspended: number;
  countSuspending: number;
  countRebooting: number;
  countTerminating: number;
  countTerminated: number;
  countFailed: number;
  countUndefined: number;
}

/**
 * MCI Workload Status Count (기존 호환성 유지)
 * @deprecated Use StatusCountInfo for API responses
 */
export interface MCIStatusCount {
  countTotal: number;
  countRunning: number;
  countStopped: number;
  countSuspended: number;
  countTerminated: number;
  countFailed: number;
  countEtc?: number;
}

/**
 * MCI Workload 항목
 */
export interface MCIWorkload {
  id: string;
  name: string;
  description?: string;
  status: 'running' | 'stopped' | 'terminated' | 'failed' | 'etc';
  provider?: string;
  providerImg?: string;
  systemLabel?: string;
  statusCount?: MCIStatusCount;
  nsId?: string;
  mciId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * MCI Status 대시보드 데이터
 */
export interface MCIStatus {
  total: number;
  running: number;
  stopped: number;
  terminated: number;
  failed: number;
  etc: number;
}

/**
 * Server Status 대시보드 데이터
 */
export interface ServerStatus {
  total: number;
  running: number;
  stopped: number;
  terminated: number;
  failed: number;
  etc: number;
}

/**
 * MCI 생성 요청 데이터
 */
export interface MCICreateRequest {
  name: string;
  description?: string;
  deploymentAlgorithm?: string;
  policy?: string;
  subgroups?: MCISubGroup[];
}

/**
 * MCI SubGroup
 */
export interface MCISubGroup {
  id?: string;
  name: string;
  servers?: MCIServer[];
}

/**
 * MCI Server 설정
 */
export interface MCIServer {
  id?: string;
  name: string;
  specId?: string;
  imageId?: string;
  connectionName?: string;
  [key: string]: unknown;
}

/**
 * Architecture 타입
 */
export type Architecture = 'x86_64' | 'arm64' | 'amd64';

/**
 * Filter Policy 조건
 */
export interface FilterCondition {
  operand: string;
  operator?: '<=' | '>=' | '==' | '!=' | '<' | '>';
}

/**
 * Filter Policy
 */
export interface FilterPolicy {
  metric: string;
  condition: FilterCondition[];
}

/**
 * Priority Policy Parameter
 */
export interface PriorityParameter {
  key: string;
  val: string[];
}

/**
 * Priority Policy
 */
export interface PriorityPolicy {
  metric: string;
  parameter: PriorityParameter[];
  weight: string;
}

/**
 * Spec Config 입력 데이터
 */
export interface SpecConfig {
  memoryMin?: string;
  memoryMax?: string;
  cpuMin?: string;
  cpuMax?: string;
  costMin?: string;
  costMax?: string;
  architecture?: Architecture;
}

/**
 * Accelerator Config 입력 데이터
 */
export interface AcceleratorConfig {
  type?: string;
  model?: string;
  countMin?: string;
  countMax?: string;
  memoryMin?: string;
  memoryMax?: string;
}

/**
 * Recommend VM Request (Buffalo API 호환)
 */
export interface RecommendVmRequest {
  request: {
    filter: {
      policy: FilterPolicy[];
    };
    priority: {
      policy: PriorityPolicy[];
    };
    limit: string;
  };
}

/**
 * Spec Recommendation 요청 (기존)
 * @deprecated Use RecommendVmRequest for new implementation
 */
export interface SpecRecommendationRequest {
  priority?: string;
  limit?: string;
  connectionName?: string;
}

/**
 * Spec 항목 (확장)
 * @see model.SpecInfo
 */
export interface Spec {
  id: string;
  name: string;
  connectionName?: string;
  cspSpecName?: string;
  provider?: string;
  providerName?: string; // Buffalo API 호환
  region?: string;
  regionName?: string; // Buffalo API 호환
  zone?: string;
  numVCpu?: number;
  vCPU?: string; // Buffalo API 호환
  numCore?: number;
  memoryMiB?: number;
  memoryGiB?: string; // Buffalo API 호환
  storageGiB?: number;
  gpu?: string;
  gpuMemoryMiB?: number;
  networkPerformance?: string;
  costPerHour?: number | string;
  evaluationScore10?: string; // Buffalo API
  architecture?: Architecture; // ✨ 신규 추가
  label?: Record<string, string>;
  description?: string;
  /** @deprecated Use numVCpu */
  cpu?: string;
  /** @deprecated Use memoryMiB */
  memory?: string;
  /** @deprecated Use storageGiB */
  disk?: string;
  [key: string]: unknown;
}

/**
 * Image Recommendation 요청
 */
export interface ImageRecommendationRequest {
  provider?: string;
  region?: string;
  osArchitecture?: string;
  osType?: string;
  gpuImage?: boolean;
}

/**
 * Image 항목 (확장)
 * @see model.ImageInfo
 */
export interface Image {
  id: string;
  name: string;
  connectionName?: string;
  cspImageId?: string;
  cspImageName?: string;
  provider?: string;
  region?: string;
  osType?: string;
  osDistribution?: string;
  osVersion?: string;
  osArchitecture?: string;
  isGpuImage?: boolean;
  description?: string;
  label?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Recommend VM Response (Buffalo API 호환)
 */
export interface RecommendVmResponse {
  status: {
    code: number;
    message: string;
  };
  responseData: Spec[];
}

/**
 * Spec recommendation response (기존)
 * @deprecated Use RecommendVmResponse for new implementation
 */
export interface SpecRecommendationResponse {
  specs: Spec[];
}

/**
 * Image recommendation response
 */
export interface ImageRecommendationResponse {
  images: Image[];
}

// ============================================================================
// VM (Virtual Machine) Types
// ============================================================================

/**
 * Connection configuration
 */
export interface ConnConfig {
  configName?: string;
  providerName?: string;
  driverName?: string;
  credentialName?: string;
  regionZoneInfoName?: string;
  verified?: boolean;
}

/**
 * Geographic location
 */
export interface Location {
  display?: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Region information
 */
export interface RegionInfo {
  region?: string;
  zone?: string;
}

/**
 * Key-Value pair
 */
export interface KeyValue {
  key: string;
  value: string;
}

/**
 * VM detailed information
 * @see model.VmInfo
 */
export interface VmInfo {
  id: string;
  name: string;
  uid?: string;
  description?: string;
  connectionName?: string;
  connectionConfig?: ConnConfig;
  specId?: string;
  cspSpecName?: string;
  imageId?: string;
  cspImageName?: string;
  vNetId?: string;
  cspVNetId?: string;
  subnetId?: string;
  cspSubnetId?: string;
  securityGroupIds?: string[];
  sshKeyId?: string;
  cspSshKeyId?: string;
  sshPort?: string;
  vmUserName?: string;
  vmUserPassword?: string;
  networkInterface?: string;
  publicIP?: string;
  privateIP?: string;
  publicDNS?: string;
  privateDNS?: string;
  rootDiskType?: string;
  rootDiskSize?: string;
  RootDeviceName?: string;
  dataDiskIds?: string[];
  cspResourceId?: string;
  cspResourceName?: string;
  status?: MciStatus;
  targetStatus?: string;
  targetAction?: string;
  monAgentStatus?: string;
  networkAgentStatus?: string;
  subGroupId?: string;
  location?: Location;
  region?: RegionInfo;
  label?: Record<string, string>;
  resourceType?: string;
  createdTime?: string;
  systemMessage?: string;
  addtionalDetails?: KeyValue[];
}

// ============================================================================
// MCI Core Types
// ============================================================================

/**
 * MCI creation errors
 */
export interface MciCreationErrors {
  errors?: Array<{
    vmId?: string;
    vmName?: string;
    error?: string;
    errorCode?: string;
  }>;
}

/**
 * MCI command request
 */
export interface MciCmdReq {
  command?: string[];
  userName?: string;
}

/**
 * Complete MCI information from API
 * @see model.MciInfo
 */
export interface MciInfo {
  id: string;
  name: string;
  uid?: string;
  description?: string;
  status?: MciStatus;
  statusCount?: StatusCountInfo;
  targetStatus?: string;
  targetAction?: string;
  placementAlgo?: string;
  installMonAgent?: 'yes' | 'no';
  configureCloudAdaptiveNetwork?: 'yes' | 'no';
  label?: Record<string, string>;
  systemLabel?: string;
  systemMessage?: string[];
  resourceType?: string;
  vm?: VmInfo[];
  newVmList?: string[];
  postCommand?: MciCmdReq;
  creationErrors?: MciCreationErrors;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * SubGroup creation request for MCI Dynamic (Express Mode)
 * @see model.CreateSubGroupDynamicReq
 */
export interface CreateSubGroupDynamicReq {
  name: string;
  subGroupSize?: string;
  specId: string;
  imageId: string;
  connectionName?: string;
  rootDiskSize?: string;
  rootDiskType?: string;
  vmUserPassword?: string;
  zone?: string;
  description?: string;
  label?: Record<string, string>;
  // UI 표시용 필드 (API 요청 시 제외)
  specName?: string;
  imageName?: string;
}

/**
 * SubGroup creation request for MCI Expert Mode
 * @see model.CreateSubGroupReq
 */
export interface CreateSubGroupReq {
  name: string;
  connectionName: string;
  imageId: string;
  specId: string;
  sshKeyId: string;
  securityGroupIds: string[];
  subnetId: string;
  vNetId: string;
  subGroupSize?: string;
  rootDiskSize?: string;
  rootDiskType?: string;
  dataDiskIds?: string[];
  vmUserName?: string;
  vmUserPassword?: string;
  description?: string;
  label?: Record<string, string>;
  cspResourceId?: string;
}

/**
 * MCI Dynamic creation request
 * @see model.MciDynamicReq
 */
export interface MciDynamicReq {
  name: string;
  description?: string;
  installMonAgent?: 'yes' | 'no';
  label?: Record<string, string>;
  systemLabel?: string;
  policyOnPartialFailure?: PolicyOnPartialFailure;
  postCommand?: MciCmdReq;
  subGroups: CreateSubGroupDynamicReq[];
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * MCI list response
 * @see infra.RestGetAllMciResponse
 */
export interface MciListResponse {
  mci: MciInfo[];
}

/**
 * MCI status response with aggregated counts
 */
export interface MciStatusResponse extends MciListResponse {
  statusCounts?: StatusCounts;
  serverCounts?: ServerCounts;
}

/**
 * Aggregated status counts
 */
export interface StatusCounts {
  total: number;
  running: number;
  stopped: number;
  suspended: number;
  terminated: number;
  failed: number;
  etc: number;
}

/**
 * Aggregated server counts
 */
export interface ServerCounts {
  total: number;
  running: number;
  stopped: number;
  suspended: number;
  terminated: number;
  failed: number;
  etc: number;
}

// ============================================================================
// Form Data Types (for React Hook Form)
// ============================================================================

/**
 * Form data for SubGroup configuration
 */
export interface SubGroupFormData {
  name: string;
  subGroupSize: string;
  specId: string;
  imageId: string;
  connectionName?: string;
  rootDiskSize?: string;
  rootDiskType?: string;
  vmUserPassword?: string;
  zone?: string;
  description?: string;
  labels?: Array<{ key: string; value: string }>;
}

/**
 * Form data for MCI creation
 */
export interface MciCreateFormData {
  name: string;
  description?: string;
  installMonAgent?: boolean;
  policyOnPartialFailure?: PolicyOnPartialFailure;
  subGroups: SubGroupFormData[];
  postCommand?: string;
  postCommandUserName?: string;
  labels?: Array<{ key: string; value: string }>;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * View mode for MCI Workloads page
 */
export type ViewMode = 'view' | 'create';

/**
 * Modal types
 */
export type ModalType = 'spec' | 'image' | 'server';

/**
 * Table filter state
 */
export interface TableFilterState {
  searchText?: string;
  status?: MciStatus[];
  sortBy?: keyof MciInfo;
  sortOrder?: 'asc' | 'desc';
}

// ============================================================================
// Legacy Types (기존 호환성 유지)
// ============================================================================
