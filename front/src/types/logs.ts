/**
 * Log 타입 정의
 */

/**
 * Log 항목
 */
export interface Log {
  labels: {
    ns: string;
    mci: string;
    vm: string;
    host: string;
  };
  timestamp: string;
  value: string;
}

/**
 * Log 상세 정보
 */
export interface LogDetail {
  timestamp: string;
  measurementName: string;
  host: string;
  mciId: string;
  nsId: string;
  path: string;
  targetId: string;
  [key: string]: unknown;
}

/**
 * Workload 항목 (MCI Workload)
 */
export interface Workload {
  id: string;
  name: string;
  nsId?: string;
  mciId?: string;
}

/**
 * Server 항목 (VM)
 */
export interface Server {
  id: string;
  name: string;
  hostname?: string;
  mciId?: string;
}
