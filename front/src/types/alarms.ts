/**
 * Alarm 타입 정의
 */

/**
 * Alarm 목록 항목
 */
export interface Alarm {
  seq: number;
  name: string;
  measurement: string;
  field: string;
  status: string;
  create_at: string;
  crit: number;
  warn: number;
  info: number;
  description?: string;
  statistics?: string;
}

/**
 * Alarm 상세 정보
 */
export interface AlarmDetail {
  seq: number;
  name: string;
  description: string;
  status: string;
  measurement: string;
  metric: string;
  statistics: string;
  value: string;
}

/**
 * Event & Alarm 항목
 */
export interface EventAlarm {
  policySeq: number;
  occurTime: string;
  metric: string;
  hostname: string;
  level: string;
  createdAt: string;
  data: string;
}

/**
 * Event 상세 정보
 */
export interface EventDetail {
  policySeq: number;
  occurTime: string;
  metric: string;
  hostname: string;
  level: string;
  createdAt: string;
  data: string;
  [key: string]: unknown;
}

/**
 * Alarm 필터 옵션
 */
export interface AlarmFilter {
  field: 'name' | 'status' | 'level' | 'measurement' | 'field' | 'create_at';
  type: 'like' | '=' | '!=' | '>' | '<' | '>=' | '<=';
  value: string;
}
