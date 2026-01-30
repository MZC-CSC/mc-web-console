/**
 * Server Recommendation Utility Functions
 * Buffalo API 호환 필터 정책 생성 함수
 */

import type {
  SpecConfig,
  AcceleratorConfig,
  FilterPolicy,
  PriorityPolicy,
  Architecture,
} from '@/types/mci-workloads';

/**
 * Region 좌표 매핑
 */
export const REGIONS = {
  seoul: { lat: '37.532600', lon: '127.024612', label: 'Seoul' },
  london: { lat: '51.509865', lon: '-0.118092', label: 'London' },
  newyork: { lat: '40.730610', lon: '-73.935242', label: 'New York' },
} as const;

export type RegionKey = keyof typeof REGIONS;

/**
 * Filter Policy 배열 생성
 * SpecConfig와 AcceleratorConfig를 RecommendSpec API의 FilterPolicy 배열로 변환
 *
 * @note swagger 스펙 (02_mc-infra-manager)에 명시된 metric:
 * - vCPU, memoryGiB, costPerHour
 *
 * @note 추가로 사용하는 metric (swagger에 명시되지 않음, 실제 API 지원 여부 확인 필요):
 * - architecture, acceleratorType, acceleratorModel, acceleratorCount, acceleratorMemoryGB
 */
export function buildFilterPolicies(
  specConfig: SpecConfig,
  acceleratorConfig: AcceleratorConfig
): FilterPolicy[] {
  const policies: FilterPolicy[] = [];

  // Memory Filter
  if (specConfig.memoryMin || specConfig.memoryMax) {
    const minVal = specConfig.memoryMin || '0';
    const maxVal = specConfig.memoryMax || '0';

    policies.push({
      metric: 'memoryGiB',
      condition: [
        { operand: maxVal, operator: '<=' },
        { operand: minVal, operator: '>=' },
      ],
    });
  }

  // vCPU Filter
  if (specConfig.cpuMin || specConfig.cpuMax) {
    const minVal = specConfig.cpuMin || '0';
    const maxVal = specConfig.cpuMax || '0';

    policies.push({
      metric: 'vCPU',
      condition: [
        { operand: maxVal, operator: '<=' },
        { operand: minVal, operator: '>=' },
      ],
    });
  }

  // Cost Filter
  if (specConfig.costMin || specConfig.costMax) {
    const minVal = specConfig.costMin || '0';
    const maxVal = specConfig.costMax || '0';

    policies.push({
      metric: 'costPerHour',
      condition: [
        { operand: maxVal, operator: '<=' },
        { operand: minVal, operator: '>=' },
      ],
    });
  }

  // Architecture Filter ✨
  if (specConfig.architecture) {
    policies.push({
      metric: 'architecture',
      condition: [{ operand: specConfig.architecture }],
    });
  }

  // Accelerator Type Filter
  if (acceleratorConfig.type) {
    policies.push({
      metric: 'acceleratorType',
      condition: [{ operand: acceleratorConfig.type }],
    });
  }

  // Accelerator Model Filter
  if (acceleratorConfig.model) {
    policies.push({
      metric: 'acceleratorModel',
      condition: [{ operand: acceleratorConfig.model }],
    });
  }

  // Accelerator Count Filter
  if (acceleratorConfig.countMin || acceleratorConfig.countMax) {
    const minVal = acceleratorConfig.countMin || '0';
    const maxVal = acceleratorConfig.countMax || '0';

    policies.push({
      metric: 'acceleratorCount',
      condition: [
        { operand: maxVal, operator: '<=' },
        { operand: minVal, operator: '>=' },
      ],
    });
  }

  // Accelerator Memory Filter
  if (acceleratorConfig.memoryMin || acceleratorConfig.memoryMax) {
    const minVal = acceleratorConfig.memoryMin || '0';
    const maxVal = acceleratorConfig.memoryMax || '0';

    policies.push({
      metric: 'acceleratorMemoryGB',
      condition: [
        { operand: maxVal, operator: '<=' },
        { operand: minVal, operator: '>=' },
      ],
    });
  }

  return policies;
}

/**
 * Priority Policy 배열 생성
 * 좌표 기반 location priority 생성
 */
export function buildPriorityPolicies(
  latitude: string,
  longitude: string
): PriorityPolicy[] {
  return [
    {
      metric: 'location',
      parameter: [
        {
          key: 'coordinateClose',
          val: [`${latitude}/${longitude}`],
        },
      ],
      weight: '0.3',
    },
  ];
}

/**
 * Min/Max 값 유효성 검사
 * @returns 에러 메시지 또는 null
 */
export function validateMinMax(
  min: string | undefined,
  max: string | undefined,
  fieldName: string
): string | null {
  if (!min || !max) return null;

  const minVal = parseFloat(min);
  const maxVal = parseFloat(max);

  if (isNaN(minVal) || isNaN(maxVal)) {
    return `${fieldName}: 숫자 형식이 올바르지 않습니다`;
  }

  if (maxVal < minVal) {
    return `${fieldName}: 최대값은 최소값보다 크거나 같아야 합니다`;
  }

  return null;
}

/**
 * 모든 SpecConfig 유효성 검사
 */
export function validateSpecConfig(config: SpecConfig): string[] {
  const errors: string[] = [];

  const memoryError = validateMinMax(config.memoryMin, config.memoryMax, 'Memory');
  if (memoryError) errors.push(memoryError);

  const cpuError = validateMinMax(config.cpuMin, config.cpuMax, 'vCPU');
  if (cpuError) errors.push(cpuError);

  const costError = validateMinMax(config.costMin, config.costMax, 'Cost');
  if (costError) errors.push(costError);

  return errors;
}

/**
 * 모든 AcceleratorConfig 유효성 검사
 */
export function validateAcceleratorConfig(config: AcceleratorConfig): string[] {
  const errors: string[] = [];

  const countError = validateMinMax(config.countMin, config.countMax, 'Accelerator Count');
  if (countError) errors.push(countError);

  const memoryError = validateMinMax(
    config.memoryMin,
    config.memoryMax,
    'Accelerator Memory'
  );
  if (memoryError) errors.push(memoryError);

  return errors;
}

/**
 * Architecture 옵션 목록
 */
export const ARCHITECTURE_OPTIONS: { value: Architecture; label: string }[] = [
  { value: 'x86_64', label: 'x86_64' },
  { value: 'arm64', label: 'ARM64' },
  { value: 'amd64', label: 'AMD64' },
];

/**
 * Provider 옵션 목록
 */
export const PROVIDER_OPTIONS = [
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'GCP' },
  { value: 'alibaba', label: 'Alibaba' },
  { value: 'tencent', label: 'Tencent' },
  { value: 'ncp', label: 'NCP' },
  { value: 'nhn', label: 'NHN' },
  { value: 'ibm', label: 'IBM' },
];
