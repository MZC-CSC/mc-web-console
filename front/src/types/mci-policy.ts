/**
 * MCI Policy 관련 타입 정의
 * @see model.MciPolicyInfo, model.Policy, model.AutoCondition, model.AutoAction
 */

/**
 * AutoCondition - Policy의 조건 정의
 */
export interface AutoCondition {
  metric?: string; // 예: 'cpu'
  operator?: '<' | '<=' | '>' | '>='; // 비교 연산자
  operand?: string; // 예: '80'
  evaluationPeriod?: string; // 평가 기간 (초)
  evaluationValue?: string[]; // 평가 값 배열
}

/**
 * AutoAction - Policy의 액션 정의
 */
export interface AutoAction {
  actionType?: 'ScaleOut' | 'ScaleIn'; // 액션 타입
  placementAlgo?: string; // 배치 알고리즘 (예: 'random')
  postCommand?: {
    command?: string[];
    userName?: string;
  };
  subGroupDynamicReq?: {
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
  };
}

/**
 * Policy - 개별 Policy 정의
 */
export interface Policy {
  autoCondition?: AutoCondition;
  autoAction?: AutoAction;
  status?: string; // Policy 상태
}

/**
 * MciPolicyInfo - MCI Policy 정보
 */
export interface MciPolicyInfo {
  Id?: string; // MCI Id (generated ID by the Name)
  Name?: string; // MCI Name (for request)
  actionLog?: string; // 액션 로그
  description?: string; // 설명
  policy?: Policy[]; // Policy 배열
}

/**
 * MciPolicyReq - MCI Policy 생성 요청
 * @see model.MciPolicyReq
 */
export interface MciPolicyReq extends Record<string, unknown> {
  description?: string; // Policy Description
  policy: Policy[]; // Policy 배열
}
