'use client';

import { cn } from '@/lib/utils';
import { useMemo } from 'react';

/**
 * ProgressBar 컴포넌트
 *
 * 진행률 표시 바
 * - 퍼센트 기반 진행률
 * - 색상 임계값 설정 (0-50% 빨강, 50-80% 노랑, 80-100% 초록)
 * - 라벨 표시 (퍼센트, 숫자, 사용자 정의)
 * - 애니메이션
 * - 세로/가로 방향
 *
 * @example
 * <ProgressBar value={75} max={100} />
 * <ProgressBar value={8.5} max={16} unit="GB" showThreshold />
 * <ProgressBar value={75} orientation="vertical" height="200px" />
 */

export interface ProgressBarProps {
  /** 현재 값 */
  value: number;

  /** 최대 값 */
  max: number;

  /** 최소 값 */
  min?: number;

  /** 단위 (예: %, GB, MB) */
  unit?: string;

  /** 라벨 표시 */
  showLabel?: boolean;

  /** 커스텀 라벨 */
  label?: string;

  /** 임계값 색상 활성화 */
  showThreshold?: boolean;

  /** 임계값 설정 */
  thresholds?: {
    /** 경고 임계값 (퍼센트) */
    warning?: number;
    /** 위험 임계값 (퍼센트) */
    critical?: number;
  };

  /** 커스텀 색상 */
  color?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';

  /** 애니메이션 */
  animated?: boolean;

  /** 방향 */
  orientation?: 'horizontal' | 'vertical';

  /** 높이 (세로형일 때) */
  height?: string;

  /** 크기 */
  size?: 'sm' | 'default' | 'lg';

  /** 추가 CSS 클래스 */
  className?: string;
}

const SIZE_CONFIG = {
  sm: 'h-1.5',
  default: 'h-2.5',
  lg: 'h-4',
};

const COLOR_CONFIG = {
  default: 'bg-primary',
  primary: 'bg-primary',
  success: 'bg-green-600',
  warning: 'bg-yellow-600',
  destructive: 'bg-red-600',
};

export function ProgressBar({
  value,
  max,
  min = 0,
  unit = '%',
  showLabel = true,
  label,
  showThreshold = false,
  thresholds = { warning: 70, critical: 90 },
  color = 'default',
  animated = true,
  orientation = 'horizontal',
  height = '200px',
  size = 'default',
  className,
}: ProgressBarProps) {
  // 퍼센트 계산
  const percentage = useMemo(() => {
    const range = max - min;
    const normalizedValue = Math.max(min, Math.min(value, max)) - min;
    return (normalizedValue / range) * 100;
  }, [value, max, min]);

  // 임계값 기반 색상 결정
  const barColor = useMemo(() => {
    if (!showThreshold) {
      return COLOR_CONFIG[color];
    }

    if (percentage >= (thresholds.critical || 90)) {
      return 'bg-red-600';
    }
    if (percentage >= (thresholds.warning || 70)) {
      return 'bg-yellow-600';
    }
    return 'bg-green-600';
  }, [showThreshold, percentage, thresholds, color]);

  // 라벨 텍스트
  const labelText = useMemo(() => {
    if (label) return label;

    if (unit === '%') {
      return `${percentage.toFixed(0)}%`;
    }

    return `${value.toFixed(1)} / ${max} ${unit}`;
  }, [label, unit, percentage, value, max]);

  if (orientation === 'vertical') {
    return (
      <div className={cn('flex flex-col items-center gap-2', className)}>
        {showLabel && (
          <div className="text-sm font-medium text-muted-foreground">
            {labelText}
          </div>
        )}
        <div
          className="w-4 bg-secondary rounded-full overflow-hidden relative"
          style={{ height }}
        >
          <div
            className={cn(
              'w-full absolute bottom-0 rounded-full',
              barColor,
              animated && 'transition-all duration-500 ease-out'
            )}
            style={{ height: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-muted-foreground">{labelText}</span>
          {unit === '%' && (
            <span className="text-xs text-muted-foreground">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-secondary rounded-full overflow-hidden',
          SIZE_CONFIG[size]
        )}
      >
        <div
          className={cn(
            'h-full rounded-full',
            barColor,
            animated && 'transition-all duration-500 ease-out'
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={min}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

/**
 * ProgressBarGroup 컴포넌트
 *
 * 여러 ProgressBar를 그룹으로 표시
 */
export interface ProgressBarGroupItem {
  label: string;
  value: number;
  max: number;
  unit?: string;
  color?: ProgressBarProps['color'];
}

export interface ProgressBarGroupProps {
  items: ProgressBarGroupItem[];
  showThreshold?: boolean;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ProgressBarGroup({
  items,
  showThreshold = false,
  size = 'default',
  className,
}: ProgressBarGroupProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <ProgressBar
          key={index}
          value={item.value}
          max={item.max}
          unit={item.unit || '%'}
          label={item.label}
          color={item.color}
          showThreshold={showThreshold}
          size={size}
        />
      ))}
    </div>
  );
}

/**
 * CircularProgress 컴포넌트
 *
 * 원형 진행률 표시
 */
export interface CircularProgressProps {
  /** 현재 값 */
  value: number;

  /** 최대 값 */
  max: number;

  /** 크기 (px) */
  size?: number;

  /** 두께 (px) */
  strokeWidth?: number;

  /** 색상 */
  color?: ProgressBarProps['color'];

  /** 라벨 표시 */
  showLabel?: boolean;

  /** 커스텀 라벨 */
  label?: string;

  /** 추가 CSS 클래스 */
  className?: string;
}

export function CircularProgress({
  value,
  max,
  size = 120,
  strokeWidth = 8,
  color = 'primary',
  showLabel = true,
  label,
  className,
}: CircularProgressProps) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const colorClass = {
    default: 'stroke-primary',
    primary: 'stroke-primary',
    success: 'stroke-green-600',
    warning: 'stroke-yellow-600',
    destructive: 'stroke-red-600',
  }[color];

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* 배경 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-secondary fill-none"
        />
        {/* 진행률 원 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('fill-none transition-all duration-500 ease-out', colorClass)}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">
            {label || `${percentage.toFixed(0)}%`}
          </span>
        </div>
      )}
    </div>
  );
}
