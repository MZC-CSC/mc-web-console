/**
 * MCI Workloads 타입 정의
 */

/**
 * MCI Workload Status Count
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
 * Spec Recommendation 요청
 */
export interface SpecRecommendationRequest {
  priority?: string;
  limit?: string;
  connectionName?: string;
}

/**
 * Spec 항목
 */
export interface Spec {
  id: string;
  name: string;
  provider?: string;
  region?: string;
  cpu?: string;
  memory?: string;
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
 * Image 항목
 */
export interface Image {
  id: string;
  name: string;
  provider?: string;
  region?: string;
  osType?: string;
  osArchitecture?: string;
  [key: string]: unknown;
}
