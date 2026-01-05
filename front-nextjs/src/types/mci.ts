/**
 * MCI (Multi-Cloud Infrastructure) Type Definitions
 */

// Connection configuration for a cloud provider
export interface ConnectionConfig {
  configName: string;
  providerName: string;
  regionDetail: {
    regionId: string;
    regionName: string;
    description: string;
    location: {
      display: string;
      latitude: number;
      longitude: number;
    };
  };
  credentialName: string;
  driverName: string;
}

// VM status count within an MCI
export interface StatusCount {
  countTotal: number;
  countCreating: number;
  countRunning: number;
  countSuspending: number;
  countSuspended: number;
  countRebooting: number;
  countTerminating: number;
  countTerminated: number;
  countResuming: number;
  countFailed: number;
  countUndefined: number;
}

// Virtual Machine
export interface VM {
  id: string;
  uid: string;
  name: string;
  status: string;
  targetStatus: string;
  targetAction: string;
  connectionName: string;
  connectionConfig: ConnectionConfig;
  specId: string;
  imageId: string;
  vNetId: string;
  subnetId: string;
  securityGroupIds: string[];
  sshKeyId: string;
  publicIP: string;
  privateIP: string;
  sshPort: string;
  publicDNS: string;
  privateDNS: string;
  rootDiskType: string;
  rootDiskSize: string;
  rootDeviceName: string;
  cspResourceId: string;
  cspResourceName: string;
  region: {
    Region: string;
    Zone: string;
  };
  label: Record<string, string>;
  description: string;
  createdTime: string;
  subGroupId: string;
}

// MCI (Multi-Cloud Infrastructure)
export interface MCI {
  id: string;
  uid: string;
  name: string;
  status: string;
  statusCount: StatusCount;
  targetStatus: string;
  targetAction: string;
  installMonAgent: string;
  configureCloudAdaptiveNetwork: string;
  label: Record<string, string>;
  systemLabel: string;
  systemMessage: string;
  description: string;
  createdTime: string;
  vm: VM[];
  newVmList: VM[];
}

// MCI Summary (for list view)
export interface MCISummary {
  id: string;
  name: string;
  status: string;
  statusCount: StatusCount;
  description: string;
  createdTime: string;
  label: Record<string, string>;
}

// MCI Status Display Types
export type MciDisplayStatus =
  | 'running'
  | 'running-ing'
  | 'stopped'
  | 'stopped-ing'
  | 'terminated'
  | 'terminated-ing'
  | 'failed'
  | 'etc';

// VM Display Status
export type VmDisplayStatus =
  | 'running'
  | 'suspended'
  | 'terminated'
  | 'stop';

// MCI Control Actions
export type MciControlAction =
  | 'reboot'
  | 'suspend'
  | 'resume'
  | 'terminate';

// Create MCI Request
export interface CreateMciRequest {
  name: string;
  description?: string;
  installMonAgent?: string;
  label?: Record<string, string>;
  policyOnPartialFailure?: 'continue' | 'rollback';
  postCommand?: {
    command: string[];
    userName: string;
  };
  subGroups: SubGroupConfig[];
  systemLabel?: string;
}

// SubGroup Configuration for MCI Creation
export interface SubGroupConfig {
  specId: string;
  imageId: string;
  name: string;
  subGroupSize: number;
  connectionName: string;
  description?: string;
  rootDiskSize?: string;
  rootDiskType?: string;
  label?: Record<string, string>;
  vmUserPassword?: string;
}

// MCI API Response
export interface MciListResponse {
  mci: MCI[];
}
