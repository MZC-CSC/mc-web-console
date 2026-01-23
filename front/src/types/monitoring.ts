/**
 * Monitoring Config 타입 정의
 */

/**
 * Server 항목 (Monitoring Config용)
 */
export interface MonitoringServer {
  id: string;
  name: string;
  type: string;
  workloadType: string;
  workloadName: string;
  monitoringAgentStatus: string;
  logAgentStatus: string;
}

/**
 * Monitoring Config 상세 정보
 */
export interface MonitoringConfigDetail {
  serverId: string;
  serverName: string;
  workloadType?: string;
  workloadName?: string;
  monitoringAgentStatus?: string;
  logAgentStatus?: string;
  [key: string]: unknown;
}

/**
 * Monitor Metric 항목
 */
export interface MonitorMetric {
  id: string;
  name: string;
  measurement: string;
  field: string;
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * Metric Plugin 항목
 */
export interface MetricPlugin {
  id: string;
  name: string;
  type: string;
  enabled?: boolean;
  [key: string]: unknown;
}

/**
 * Workload 항목 (Monitoring Config용)
 */
export interface MonitoringWorkload {
  id: string;
  name: string;
  type?: string;
}
