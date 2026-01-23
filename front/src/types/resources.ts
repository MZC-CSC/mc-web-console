/**
 * Resources 타입 정의
 */

/**
 * Server Spec 타입
 */
export interface ServerSpec {
  id: string;
  name: string;
  cpu?: number;
  memory?: number;
  disk?: number;
  description?: string;
  connectionName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Image 타입
 */
export interface Image {
  id: string;
  name: string;
  os?: string;
  size?: number;
  connectionName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * My Image (Custom Image) 타입
 */
export interface MyImage {
  id: string;
  name: string;
  source?: string;
  size?: number;
  connectionName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Network (VNet) 타입
 */
export interface Network {
  id: string;
  name: string;
  cidr?: string;
  subnets?: Subnet[];
  connectionName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Subnet 타입
 */
export interface Subnet {
  id: string;
  name: string;
  cidr?: string;
  zone?: string;
}

/**
 * Security Group 타입
 */
export interface SecurityGroup {
  id: string;
  name: string;
  rules?: SecurityRule[];
  connectionName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Security Rule 타입
 */
export interface SecurityRule {
  direction: 'inbound' | 'outbound';
  protocol: string;
  fromPort?: string;
  toPort?: string;
  cidr?: string;
}

/**
 * Disk (Data Disk) 타입
 */
export interface Disk {
  id: string;
  name: string;
  size?: number;
  type?: string;
  connectionName?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * SSH Key 타입
 */
export interface SSHKey {
  id: string;
  name: string;
  fingerprint?: string;
  connectionName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Cloud Resources Overview 타입
 */
export interface CloudResourcesOverview {
  vnet?: number;
  vm?: number;
  disk?: number;
  image?: number;
  securityGroup?: number;
  sshKey?: number;
  [key: string]: number | undefined;
}

/**
 * Credential (Connection Config) 타입
 */
export interface Credential {
  name: string;
  provider?: string;
  connectionName?: string;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Connection Config 타입
 */
export interface ConnectionConfig {
  name: string;
  provider?: string;
  driverName?: string;
  credentialName?: string;
  regionName?: string;
  config?: Record<string, unknown>;
}
