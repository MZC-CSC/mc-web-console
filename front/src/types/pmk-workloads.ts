/**
 * PMK Workloads 타입 정의
 */

/**
 * PMK Cluster 항목
 */
export interface PMKCluster {
  id: string;
  name: string;
  description?: string;
  status: 'running' | 'stopped' | 'terminated' | 'failed' | 'etc';
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * NodeGroup 항목
 */
export interface NodeGroup {
  id: string;
  name: string;
  clusterId: string;
  instanceType?: string;
  minSize?: number;
  maxSize?: number;
  desiredSize?: number;
  [key: string]: unknown;
}

/**
 * Cluster 상세 정보
 */
export interface ClusterDetail {
  cluster: PMKCluster;
  nodeGroups: NodeGroup[];
}

/**
 * PMK Cluster 생성 요청 데이터
 */
export interface PMKClusterCreateRequest {
  name: string;
  description?: string;
  version?: string;
  nodeGroups?: NodeGroupCreateRequest[];
}

/**
 * NodeGroup 생성 요청 데이터
 */
export interface NodeGroupCreateRequest {
  name: string;
  instanceType?: string;
  imageId?: string;
  minSize?: number;
  maxSize?: number;
  desiredSize?: number;
  rootDiskType?: string;
  rootDiskSize?: number;
  [key: string]: unknown;
}
