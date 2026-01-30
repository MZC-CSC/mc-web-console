'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Loader2,
  PlayCircle,
  StopCircle,
  Info,
  LucideIcon,
} from 'lucide-react';

/**
 * StatusBadge 컴포넌트
 *
 * 다양한 상태를 표시하는 재사용 가능한 뱃지 컴포넌트
 * - 상태별 색상 및 아이콘 자동 할당
 * - 애니메이션 옵션 (펄스, 스피너)
 * - 툴팁 지원
 *
 * @example
 * <StatusBadge status="running" />
 * <StatusBadge status="error" animated />
 * <StatusBadge status="custom" label="Processing" color="purple" />
 */

export type StatusType =
  | 'running'
  | 'stopped'
  | 'error'
  | 'pending'
  | 'success'
  | 'warning'
  | 'info'
  | 'starting'
  | 'stopping'
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'active'
  | 'inactive'
  | 'custom';

export interface StatusBadgeProps {
  /** 상태 타입 */
  status: StatusType;

  /** 커스텀 라벨 (기본값: status 기반 자동 생성) */
  label?: string;

  /** 커스텀 아이콘 */
  icon?: LucideIcon;

  /** 커스텀 색상 (status가 'custom'일 때 사용) */
  color?: 'gray' | 'red' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink';

  /** 애니메이션 활성화 (펄스 또는 스피너) */
  animated?: boolean;

  /** 애니메이션 타입 */
  animationType?: 'pulse' | 'spinner';

  /** 아이콘 숨김 */
  hideIcon?: boolean;

  /** 추가 CSS 클래스 */
  className?: string;

  /** 크기 */
  size?: 'sm' | 'default' | 'lg';
}

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  colorClass: string;
  bgClass: string;
  textClass: string;
  iconClass: string;
}

const STATUS_CONFIG: Record<Exclude<StatusType, 'custom'>, StatusConfig> = {
  running: {
    label: '실행 중',
    icon: PlayCircle,
    colorClass: 'border-green-200 dark:border-green-800',
    bgClass: 'bg-green-50 dark:bg-green-950',
    textClass: 'text-green-700 dark:text-green-300',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  stopped: {
    label: '중지됨',
    icon: StopCircle,
    colorClass: 'border-gray-200 dark:border-gray-700',
    bgClass: 'bg-gray-50 dark:bg-gray-900',
    textClass: 'text-gray-700 dark:text-gray-300',
    iconClass: 'text-gray-600 dark:text-gray-400',
  },
  error: {
    label: '오류',
    icon: XCircle,
    colorClass: 'border-red-200 dark:border-red-800',
    bgClass: 'bg-red-50 dark:bg-red-950',
    textClass: 'text-red-700 dark:text-red-300',
    iconClass: 'text-red-600 dark:text-red-400',
  },
  pending: {
    label: '대기 중',
    icon: Clock,
    colorClass: 'border-yellow-200 dark:border-yellow-800',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
  },
  success: {
    label: '성공',
    icon: CheckCircle2,
    colorClass: 'border-green-200 dark:border-green-800',
    bgClass: 'bg-green-50 dark:bg-green-950',
    textClass: 'text-green-700 dark:text-green-300',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  warning: {
    label: '경고',
    icon: AlertCircle,
    colorClass: 'border-yellow-200 dark:border-yellow-800',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
  },
  info: {
    label: '정보',
    icon: Info,
    colorClass: 'border-blue-200 dark:border-blue-800',
    bgClass: 'bg-blue-50 dark:bg-blue-950',
    textClass: 'text-blue-700 dark:text-blue-300',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  starting: {
    label: '시작 중',
    icon: Loader2,
    colorClass: 'border-blue-200 dark:border-blue-800',
    bgClass: 'bg-blue-50 dark:bg-blue-950',
    textClass: 'text-blue-700 dark:text-blue-300',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  stopping: {
    label: '중지 중',
    icon: Loader2,
    colorClass: 'border-gray-200 dark:border-gray-700',
    bgClass: 'bg-gray-50 dark:bg-gray-900',
    textClass: 'text-gray-700 dark:text-gray-300',
    iconClass: 'text-gray-600 dark:text-gray-400',
  },
  connected: {
    label: '연결됨',
    icon: CheckCircle2,
    colorClass: 'border-green-200 dark:border-green-800',
    bgClass: 'bg-green-50 dark:bg-green-950',
    textClass: 'text-green-700 dark:text-green-300',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  disconnected: {
    label: '연결 안됨',
    icon: XCircle,
    colorClass: 'border-gray-200 dark:border-gray-700',
    bgClass: 'bg-gray-50 dark:bg-gray-900',
    textClass: 'text-gray-700 dark:text-gray-300',
    iconClass: 'text-gray-600 dark:text-gray-400',
  },
  connecting: {
    label: '연결 중',
    icon: Loader2,
    colorClass: 'border-blue-200 dark:border-blue-800',
    bgClass: 'bg-blue-50 dark:bg-blue-950',
    textClass: 'text-blue-700 dark:text-blue-300',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  active: {
    label: '활성',
    icon: CheckCircle2,
    colorClass: 'border-green-200 dark:border-green-800',
    bgClass: 'bg-green-50 dark:bg-green-950',
    textClass: 'text-green-700 dark:text-green-300',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  inactive: {
    label: '비활성',
    icon: StopCircle,
    colorClass: 'border-gray-200 dark:border-gray-700',
    bgClass: 'bg-gray-50 dark:bg-gray-900',
    textClass: 'text-gray-700 dark:text-gray-300',
    iconClass: 'text-gray-600 dark:text-gray-400',
  },
};

const CUSTOM_COLOR_CONFIG: Record<
  NonNullable<StatusBadgeProps['color']>,
  { colorClass: string; bgClass: string; textClass: string; iconClass: string }
> = {
  gray: {
    colorClass: 'border-gray-200 dark:border-gray-700',
    bgClass: 'bg-gray-50 dark:bg-gray-900',
    textClass: 'text-gray-700 dark:text-gray-300',
    iconClass: 'text-gray-600 dark:text-gray-400',
  },
  red: {
    colorClass: 'border-red-200 dark:border-red-800',
    bgClass: 'bg-red-50 dark:bg-red-950',
    textClass: 'text-red-700 dark:text-red-300',
    iconClass: 'text-red-600 dark:text-red-400',
  },
  yellow: {
    colorClass: 'border-yellow-200 dark:border-yellow-800',
    bgClass: 'bg-yellow-50 dark:bg-yellow-950',
    textClass: 'text-yellow-700 dark:text-yellow-300',
    iconClass: 'text-yellow-600 dark:text-yellow-400',
  },
  green: {
    colorClass: 'border-green-200 dark:border-green-800',
    bgClass: 'bg-green-50 dark:bg-green-950',
    textClass: 'text-green-700 dark:text-green-300',
    iconClass: 'text-green-600 dark:text-green-400',
  },
  blue: {
    colorClass: 'border-blue-200 dark:border-blue-800',
    bgClass: 'bg-blue-50 dark:bg-blue-950',
    textClass: 'text-blue-700 dark:text-blue-300',
    iconClass: 'text-blue-600 dark:text-blue-400',
  },
  purple: {
    colorClass: 'border-purple-200 dark:border-purple-800',
    bgClass: 'bg-purple-50 dark:bg-purple-950',
    textClass: 'text-purple-700 dark:text-purple-300',
    iconClass: 'text-purple-600 dark:text-purple-400',
  },
  pink: {
    colorClass: 'border-pink-200 dark:border-pink-800',
    bgClass: 'bg-pink-50 dark:bg-pink-950',
    textClass: 'text-pink-700 dark:text-pink-300',
    iconClass: 'text-pink-600 dark:text-pink-400',
  },
};

const SIZE_CONFIG = {
  sm: {
    badge: 'text-xs px-1.5 py-0.5',
    icon: 'h-3 w-3',
  },
  default: {
    badge: 'text-sm px-2 py-1',
    icon: 'h-3.5 w-3.5',
  },
  lg: {
    badge: 'text-base px-2.5 py-1.5',
    icon: 'h-4 w-4',
  },
};

export function StatusBadge({
  status,
  label,
  icon,
  color = 'gray',
  animated = false,
  animationType = 'pulse',
  hideIcon = false,
  className,
  size = 'default',
}: StatusBadgeProps) {
  // 설정 가져오기
  const config =
    status === 'custom'
      ? {
          label: label || 'Custom',
          icon: icon || Info,
          ...CUSTOM_COLOR_CONFIG[color],
        }
      : STATUS_CONFIG[status];

  const Icon = icon || config.icon;
  const displayLabel = label || config.label;

  // 자동 애니메이션 결정 (starting, stopping, connecting 등)
  const shouldAnimate =
    animated || status === 'starting' || status === 'stopping' || status === 'connecting';

  const shouldSpin = status === 'starting' || status === 'stopping' || status === 'connecting';

  const sizeConfig = SIZE_CONFIG[size];

  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-1.5 border font-medium',
        config.colorClass,
        config.bgClass,
        config.textClass,
        sizeConfig.badge,
        shouldAnimate && animationType === 'pulse' && 'animate-pulse',
        className
      )}
    >
      {!hideIcon && Icon && (
        <Icon
          className={cn(
            sizeConfig.icon,
            config.iconClass,
            shouldSpin && 'animate-spin',
            shouldAnimate && animationType === 'spinner' && 'animate-spin'
          )}
        />
      )}
      <span>{displayLabel}</span>
    </Badge>
  );
}

/**
 * StatusBadgeGroup 컴포넌트
 *
 * 여러 StatusBadge를 그룹으로 표시
 */
export interface StatusBadgeGroupProps {
  statuses: Array<{
    status: StatusType;
    label?: string;
    count?: number;
  }>;
  className?: string;
}

export function StatusBadgeGroup({ statuses, className }: StatusBadgeGroupProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {statuses.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <StatusBadge status={item.status} label={item.label} />
          {item.count !== undefined && (
            <span className="text-sm text-muted-foreground">({item.count})</span>
          )}
        </div>
      ))}
    </div>
  );
}
