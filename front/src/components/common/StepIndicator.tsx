'use client';

import { cn } from '@/lib/utils';
import { Check, LucideIcon } from 'lucide-react';

/**
 * StepIndicator 컴포넌트
 *
 * 다단계 프로세스 진행 상태 표시
 * - 단계별 아이콘 및 라벨
 * - 현재 단계 하이라이트
 * - 완료된 단계 체크 표시
 * - 클릭 가능한 단계 (옵션)
 * - 세로/가로 방향
 *
 * @example
 * <StepIndicator
 *   steps={[
 *     { id: '1', label: '기본 정보', description: '이름, 이메일 입력' },
 *     { id: '2', label: '상세 정보', description: '추가 정보 입력' },
 *     { id: '3', label: '확인', description: '입력 내용 확인' },
 *   ]}
 *   currentStep={1}
 * />
 */

export type StepStatus = 'completed' | 'current' | 'upcoming' | 'error';

export interface Step {
  /** 단계 ID */
  id: string;

  /** 단계 라벨 */
  label: string;

  /** 단계 설명 */
  description?: string;

  /** 커스텀 아이콘 */
  icon?: LucideIcon;

  /** 단계 상태 (자동 계산되지만 오버라이드 가능) */
  status?: StepStatus;

  /** 비활성화 */
  disabled?: boolean;
}

export interface StepIndicatorProps {
  /** 단계 목록 */
  steps: Step[];

  /** 현재 단계 인덱스 (0부터 시작) */
  currentStep: number;

  /** 단계 클릭 핸들러 */
  onStepClick?: (stepIndex: number) => void;

  /** 방향 */
  orientation?: 'horizontal' | 'vertical';

  /** 클릭 가능 여부 (완료된 단계만 클릭 가능) */
  clickable?: boolean;

  /** 연결선 표시 */
  showConnector?: boolean;

  /** 크기 */
  size?: 'sm' | 'default' | 'lg';

  /** 추가 CSS 클래스 */
  className?: string;
}

const SIZE_CONFIG = {
  sm: {
    circle: 'h-8 w-8',
    icon: 'h-4 w-4',
    label: 'text-sm',
    description: 'text-xs',
  },
  default: {
    circle: 'h-10 w-10',
    icon: 'h-5 w-5',
    label: 'text-base',
    description: 'text-sm',
  },
  lg: {
    circle: 'h-12 w-12',
    icon: 'h-6 w-6',
    label: 'text-lg',
    description: 'text-base',
  },
};

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  orientation = 'horizontal',
  clickable = false,
  showConnector = true,
  size = 'default',
  className,
}: StepIndicatorProps) {
  const handleStepClick = (index: number, step: Step) => {
    if (!clickable || !onStepClick) return;
    if (step.disabled) return;

    // 완료된 단계만 클릭 가능
    const status = step.status || getStepStatus(index, currentStep);
    if (status === 'completed' || status === 'current') {
      onStepClick(index);
    }
  };

  if (orientation === 'vertical') {
    return (
      <div className={cn('space-y-4', className)}>
        {steps.map((step, index) => {
          const status = step.status || getStepStatus(index, currentStep);
          const isLast = index === steps.length - 1;

          return (
            <div key={step.id} className="flex gap-4">
              {/* 좌측: 아이콘 + 연결선 */}
              <div className="flex flex-col items-center">
                <StepCircle
                  step={step}
                  status={status}
                  index={index}
                  size={size}
                  clickable={clickable}
                  onClick={() => handleStepClick(index, step)}
                />
                {!isLast && showConnector && (
                  <div className={cn('w-0.5 flex-1 my-2', getConnectorColor(status))} />
                )}
              </div>

              {/* 우측: 라벨 + 설명 */}
              <div className="flex-1 pb-8">
                <StepLabel step={step} status={status} size={size} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => {
        const status = step.status || getStepStatus(index, currentStep);
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* 단계 */}
            <div className="flex flex-col items-center gap-2">
              <StepCircle
                step={step}
                status={status}
                index={index}
                size={size}
                clickable={clickable}
                onClick={() => handleStepClick(index, step)}
              />
              <StepLabel step={step} status={status} size={size} />
            </div>

            {/* 연결선 */}
            {!isLast && showConnector && (
              <div className={cn('h-0.5 flex-1 mx-4', getConnectorColor(status))} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * StepCircle 내부 컴포넌트
 */
interface StepCircleProps {
  step: Step;
  status: StepStatus;
  index: number;
  size: 'sm' | 'default' | 'lg';
  clickable: boolean;
  onClick: () => void;
}

function StepCircle({ step, status, index, size, clickable, onClick }: StepCircleProps) {
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = step.icon;

  const isClickable =
    clickable && !step.disabled && (status === 'completed' || status === 'current');

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!isClickable}
      className={cn(
        'rounded-full flex items-center justify-center font-semibold transition-all',
        sizeConfig.circle,
        getCircleStyles(status),
        isClickable && 'cursor-pointer hover:scale-110',
        !isClickable && 'cursor-default'
      )}
    >
      {status === 'completed' ? (
        <Check className={cn(sizeConfig.icon, 'text-white')} />
      ) : Icon ? (
        <Icon className={cn(sizeConfig.icon)} />
      ) : (
        <span className={cn(sizeConfig.label)}>{index + 1}</span>
      )}
    </button>
  );
}

/**
 * StepLabel 내부 컴포넌트
 */
interface StepLabelProps {
  step: Step;
  status: StepStatus;
  size: 'sm' | 'default' | 'lg';
}

function StepLabel({ step, status, size }: StepLabelProps) {
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div className="text-center max-w-[150px]">
      <div
        className={cn(
          'font-medium',
          sizeConfig.label,
          status === 'current' && 'text-primary',
          status === 'completed' && 'text-foreground',
          status === 'upcoming' && 'text-muted-foreground',
          status === 'error' && 'text-destructive'
        )}
      >
        {step.label}
      </div>
      {step.description && (
        <div
          className={cn(
            'text-muted-foreground mt-1',
            sizeConfig.description,
            status === 'error' && 'text-destructive/80'
          )}
        >
          {step.description}
        </div>
      )}
    </div>
  );
}

/**
 * 단계 상태 계산
 */
function getStepStatus(stepIndex: number, currentStep: number): StepStatus {
  if (stepIndex < currentStep) return 'completed';
  if (stepIndex === currentStep) return 'current';
  return 'upcoming';
}

/**
 * 원 스타일
 */
function getCircleStyles(status: StepStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-primary text-primary-foreground border-2 border-primary';
    case 'current':
      return 'bg-primary text-primary-foreground border-2 border-primary shadow-lg';
    case 'error':
      return 'bg-destructive text-destructive-foreground border-2 border-destructive';
    case 'upcoming':
    default:
      return 'bg-muted text-muted-foreground border-2 border-muted';
  }
}

/**
 * 연결선 색상
 */
function getConnectorColor(status: StepStatus): string {
  switch (status) {
    case 'completed':
      return 'bg-primary';
    case 'current':
      return 'bg-primary/30';
    case 'error':
      return 'bg-destructive/30';
    case 'upcoming':
    default:
      return 'bg-muted';
  }
}

/**
 * SimpleSteps 컴포넌트
 *
 * 더 간단한 단계 표시 (숫자만)
 */
export interface SimpleStepsProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export function SimpleSteps({ steps, currentStep, className }: SimpleStepsProps) {
  const formattedSteps: Step[] = steps.map((label, index) => ({
    id: String(index),
    label,
  }));

  return (
    <StepIndicator
      steps={formattedSteps}
      currentStep={currentStep}
      orientation="horizontal"
      size="sm"
      className={className}
    />
  );
}
