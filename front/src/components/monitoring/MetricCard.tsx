'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MetricCard 컴포넌트
 *
 * 메트릭 표시 카드
 * - 메트릭 이름 및 값
 * - 트렌드 표시 (증가/감소/변화없음)
 * - 단위 표시
 * - 임계값 기반 색상 경고
 *
 * @example
 * <MetricCard
 *   title="CPU 사용률"
 *   value={75.5}
 *   unit="%"
 *   trend={{ value: 5.2, direction: 'up' }}
 *   threshold={{ warning: 70, critical: 90 }}
 * />
 */

export type TrendDirection = 'up' | 'down' | 'stable';

export interface MetricTrend {
  /** 트렌드 값 (변화량) */
  value: number;
  /** 트렌드 방향 */
  direction: TrendDirection;
  /** 트렌드 설명 (선택) */
  description?: string;
}

export interface MetricThreshold {
  /** 경고 임계값 */
  warning?: number;
  /** 위험 임계값 */
  critical?: number;
}

export interface MetricCardProps {
  /** 메트릭 제목 */
  title: string;
  /** 메트릭 값 */
  value: number | string;
  /** 메트릭 단위 (선택) */
  unit?: string;
  /** 메트릭 아이콘 (선택) */
  icon?: LucideIcon;
  /** 트렌드 정보 (선택) */
  trend?: MetricTrend;
  /** 임계값 (선택) */
  threshold?: MetricThreshold;
  /** 설명 (선택) */
  description?: string;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
}

const trendConfig: Record<TrendDirection, { icon: LucideIcon; color: string }> = {
  up: {
    icon: TrendingUp,
    color: 'text-green-600',
  },
  down: {
    icon: TrendingDown,
    color: 'text-red-600',
  },
  stable: {
    icon: Minus,
    color: 'text-gray-600',
  },
};

function getStatusColor(value: number, threshold?: MetricThreshold): string {
  if (!threshold) return '';

  if (threshold.critical !== undefined && value >= threshold.critical) {
    return 'text-red-600';
  }

  if (threshold.warning !== undefined && value >= threshold.warning) {
    return 'text-yellow-600';
  }

  return '';
}

function getStatusBgColor(value: number, threshold?: MetricThreshold): string {
  if (!threshold) return '';

  if (threshold.critical !== undefined && value >= threshold.critical) {
    return 'bg-red-50 border-red-200';
  }

  if (threshold.warning !== undefined && value >= threshold.warning) {
    return 'bg-yellow-50 border-yellow-200';
  }

  return '';
}

export function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  trend,
  threshold,
  description,
  className,
  onClick,
}: MetricCardProps) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value);
  const statusColor = getStatusColor(numericValue, threshold);
  const statusBgColor = getStatusBgColor(numericValue, threshold);
  const isClickable = !!onClick;

  const trendInfo = trend ? trendConfig[trend.direction] : null;
  const TrendIcon = trendInfo?.icon;

  return (
    <Card
      className={cn(
        statusBgColor,
        isClickable && 'cursor-pointer hover:bg-accent/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent className="space-y-2">
        {/* 메트릭 값 */}
        <div className="flex items-baseline gap-1">
          <div className={cn(
            'text-3xl font-bold',
            statusColor
          )}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </div>
          {unit && (
            <div className="text-lg text-muted-foreground font-medium">
              {unit}
            </div>
          )}
        </div>

        {/* 설명 */}
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}

        {/* 트렌드 */}
        {trend && TrendIcon && (
          <div className="flex items-center gap-1 text-sm">
            <TrendIcon className={cn('h-4 w-4', trendInfo.color)} />
            <span className={trendInfo.color}>
              {trend.value > 0 ? '+' : ''}{trend.value}
              {unit && ` ${unit}`}
            </span>
            {trend.description && (
              <span className="text-muted-foreground">
                ({trend.description})
              </span>
            )}
          </div>
        )}

        {/* 임계값 표시 */}
        {threshold && (
          <div className="text-xs text-muted-foreground space-y-0.5 pt-1 border-t">
            {threshold.warning !== undefined && (
              <div>경고: {threshold.warning}{unit}</div>
            )}
            {threshold.critical !== undefined && (
              <div>위험: {threshold.critical}{unit}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * MetricCardGroup 컴포넌트
 *
 * 여러 메트릭 카드를 그리드로 표시
 */
export interface MetricCardGroupProps {
  metrics: MetricCardProps[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function MetricCardGroup({
  metrics,
  columns = 3,
  className,
}: MetricCardGroupProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
