/**
 * MCIs Monitoring 타입 정의
 */

/**
 * Monitoring 설정
 */
export interface MonitoringConfig {
  workload: string | null;
  server: string | null;
  measurement: string | null;
  metric: string | null;
  aggregation?: string | null;
  range: string | null;
  period: string | null;
  prediction?: string | null;
  extendPrediction: boolean;
  extendDetection: boolean;
}

/**
 * Monitoring 데이터 포인트
 */
export interface MonitoringDataPoint {
  timestamp: string;
  value: number;
}

/**
 * Monitoring 데이터
 */
export interface MonitoringData {
  trend: MonitoringDataPoint[];
  detection?: MonitoringDataPoint[];
}

/**
 * Workload 항목 (MCIs Monitoring용)
 */
export interface MCIsWorkload {
  id: string;
  name: string;
}

/**
 * Server 항목 (MCIs Monitoring용)
 */
export interface MCIsServer {
  id: string;
  name: string;
  hostname?: string;
}

/**
 * Measurement 항목
 */
export interface Measurement {
  id: string;
  name: string;
}

/**
 * Metric 항목
 */
export interface Metric {
  id: string;
  name: string;
  measurementId?: string;
}

/**
 * Aggregation 옵션
 */
export type AggregationType = 'avg' | 'sum' | 'min' | 'max' | 'count';

/**
 * Range 옵션
 */
export type RangeType = '1h' | '2h' | '3h' | '4h' | '5h' | '6h';

/**
 * Period 옵션
 */
export type PeriodType = '1m' | '3m' | '5m' | '10m' | '12m' | '15m' | '30m';
