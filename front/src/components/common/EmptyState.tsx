'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  FileQuestion,
  Search,
  AlertCircle,
  Lock,
  Inbox,
  Database,
  CloudOff,
  LucideIcon,
} from 'lucide-react';

/**
 * EmptyState 컴포넌트
 *
 * 데이터 없음 상태를 표시하는 컴포넌트
 * - 다양한 빈 상태 타입 (no-data, no-results, error, permission-denied)
 * - 아이콘 + 메시지 표시
 * - 액션 버튼 (선택적)
 * - 커스텀 일러스트레이션 지원
 *
 * @example
 * <EmptyState
 *   type="no-data"
 *   title="데이터가 없습니다"
 *   description="새 항목을 추가해보세요"
 *   action={{ label: '추가하기', onClick: handleAdd }}
 * />
 */

export type EmptyStateType =
  | 'no-data'
  | 'no-results'
  | 'error'
  | 'permission-denied'
  | 'offline'
  | 'empty-inbox'
  | 'empty-database'
  | 'custom';

export interface EmptyStateAction {
  /** 버튼 라벨 */
  label: string;

  /** 클릭 핸들러 */
  onClick: () => void;

  /** 버튼 variant */
  variant?: 'default' | 'outline' | 'ghost';

  /** 아이콘 */
  icon?: LucideIcon;
}

export interface EmptyStateProps {
  /** 빈 상태 타입 */
  type?: EmptyStateType;

  /** 제목 */
  title: string;

  /** 설명 */
  description?: string;

  /** 커스텀 아이콘 */
  icon?: LucideIcon;

  /** 아이콘 색상 */
  iconColor?: string;

  /** 액션 버튼 */
  action?: EmptyStateAction;

  /** 보조 액션 버튼 */
  secondaryAction?: EmptyStateAction;

  /** 추가 컨텐츠 */
  children?: React.ReactNode;

  /** 추가 CSS 클래스 */
  className?: string;

  /** 크기 */
  size?: 'sm' | 'default' | 'lg';
}

interface EmptyStateConfig {
  icon: LucideIcon;
  iconColor: string;
}

const EMPTY_STATE_CONFIG: Record<Exclude<EmptyStateType, 'custom'>, EmptyStateConfig> = {
  'no-data': {
    icon: Inbox,
    iconColor: 'text-muted-foreground',
  },
  'no-results': {
    icon: Search,
    iconColor: 'text-muted-foreground',
  },
  error: {
    icon: AlertCircle,
    iconColor: 'text-destructive',
  },
  'permission-denied': {
    icon: Lock,
    iconColor: 'text-yellow-600 dark:text-yellow-500',
  },
  offline: {
    icon: CloudOff,
    iconColor: 'text-muted-foreground',
  },
  'empty-inbox': {
    icon: Inbox,
    iconColor: 'text-muted-foreground',
  },
  'empty-database': {
    icon: Database,
    iconColor: 'text-muted-foreground',
  },
};

const SIZE_CONFIG = {
  sm: {
    container: 'py-8',
    icon: 'h-12 w-12',
    title: 'text-base',
    description: 'text-xs',
    spacing: 'space-y-2',
  },
  default: {
    container: 'py-12',
    icon: 'h-16 w-16',
    title: 'text-lg',
    description: 'text-sm',
    spacing: 'space-y-3',
  },
  lg: {
    container: 'py-16',
    icon: 'h-20 w-20',
    title: 'text-xl',
    description: 'text-base',
    spacing: 'space-y-4',
  },
};

export function EmptyState({
  type = 'no-data',
  title,
  description,
  icon,
  iconColor,
  action,
  secondaryAction,
  children,
  className,
  size = 'default',
}: EmptyStateProps) {
  // 설정 가져오기
  const config = type === 'custom'
    ? { icon: icon || FileQuestion, iconColor: iconColor || 'text-muted-foreground' }
    : EMPTY_STATE_CONFIG[type];

  const Icon = icon || config.icon;
  const finalIconColor = iconColor || config.iconColor;
  const sizeConfig = SIZE_CONFIG[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeConfig.container,
        className
      )}
    >
      <div className={cn(sizeConfig.spacing, 'max-w-md mx-auto')}>
        {/* 아이콘 */}
        <div className="flex justify-center">
          <Icon className={cn(sizeConfig.icon, finalIconColor)} strokeWidth={1.5} />
        </div>

        {/* 제목 */}
        <h3 className={cn('font-semibold', sizeConfig.title)}>{title}</h3>

        {/* 설명 */}
        {description && (
          <p className={cn('text-muted-foreground', sizeConfig.description)}>
            {description}
          </p>
        )}

        {/* 커스텀 컨텐츠 */}
        {children && <div className="mt-4">{children}</div>}

        {/* 액션 버튼 */}
        {(action || secondaryAction) && (
          <div className="flex items-center justify-center gap-3 mt-6">
            {action && (
              <Button
                onClick={action.onClick}
                variant={action.variant || 'default'}
              >
                {action.icon && <action.icon className="mr-2 h-4 w-4" />}
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant={secondaryAction.variant || 'outline'}
              >
                {secondaryAction.icon && (
                  <secondaryAction.icon className="mr-2 h-4 w-4" />
                )}
                {secondaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * EmptyStateCard 컴포넌트
 *
 * Card로 감싼 EmptyState
 */
import { Card } from '@/components/ui/card';

export interface EmptyStateCardProps extends EmptyStateProps {
  /** Card variant */
  cardVariant?: 'default' | 'outline';
}

export function EmptyStateCard({
  cardVariant = 'outline',
  className,
  ...props
}: EmptyStateCardProps) {
  return (
    <Card className={cn(cardVariant === 'outline' && 'border-dashed', className)}>
      <EmptyState {...props} />
    </Card>
  );
}
