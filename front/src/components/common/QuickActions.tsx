'use client';

import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

/**
 * QuickActions 컴포넌트
 *
 * 빠른 액션 버튼 그룹
 * - 그리드 레이아웃
 * - 아이콘 + 텍스트
 * - 권한 기반 표시/숨김
 *
 * @example
 * <QuickActions
 *   actions={[
 *     { id: 'create-vm', label: 'VM 생성', icon: Plus, onClick: () => {} },
 *     { id: 'create-network', label: '네트워크 생성', icon: Network, onClick: () => {} }
 *   ]}
 * />
 */

export interface QuickAction {
  /** 액션 ID */
  id: string;
  /** 액션 레이블 */
  label: string;
  /** 액션 아이콘 */
  icon: LucideIcon;
  /** 클릭 핸들러 */
  onClick: () => void;
  /** 설명 (툴팁 등에 사용) */
  description?: string;
  /** 비활성화 여부 */
  disabled?: boolean;
  /** 표시 여부 (권한 등에 따라) */
  visible?: boolean;
  /** 뱃지 표시 (예: "New") */
  badge?: string;
  /** 액션 변형 */
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
}

export interface QuickActionsProps {
  /** 액션 목록 */
  actions: QuickAction[];
  /** 그리드 열 개수 (기본: 3) */
  columns?: 2 | 3 | 4;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 컴팩트 모드 (작은 버튼) */
  compact?: boolean;
}

export function QuickActions({
  actions,
  columns = 3,
  className,
  compact = false,
}: QuickActionsProps) {
  const visibleActions = actions.filter((action) => action.visible !== false);

  if (visibleActions.length === 0) {
    return null;
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-3',
        gridCols[columns],
        className
      )}
    >
      {visibleActions.map((action) => {
        const Icon = action.icon;

        return (
          <Button
            key={action.id}
            variant={action.variant || 'outline'}
            onClick={action.onClick}
            disabled={action.disabled}
            className={cn(
              'h-auto flex-col gap-2 relative',
              compact ? 'p-3' : 'p-4'
            )}
            title={action.description}
          >
            {action.badge && (
              <span className="absolute top-1 right-1 px-1.5 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
                {action.badge}
              </span>
            )}
            <Icon className={cn(
              compact ? 'h-5 w-5' : 'h-6 w-6'
            )} />
            <span className={cn(
              'font-medium text-center',
              compact ? 'text-xs' : 'text-sm'
            )}>
              {action.label}
            </span>
            {action.description && !compact && (
              <span className="text-xs text-muted-foreground text-center">
                {action.description}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}

/**
 * QuickActionCard 컴포넌트
 *
 * 카드 스타일의 빠른 액션 (단일)
 */
export interface QuickActionCardProps {
  action: QuickAction;
  className?: string;
}

export function QuickActionCard({ action, className }: QuickActionCardProps) {
  const Icon = action.icon;

  return (
    <button
      onClick={action.onClick}
      disabled={action.disabled}
      className={cn(
        'relative flex flex-col items-center justify-center gap-3 p-6',
        'rounded-lg border bg-card text-card-foreground',
        'hover:bg-accent hover:text-accent-foreground transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      title={action.description}
    >
      {action.badge && (
        <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded">
          {action.badge}
        </span>
      )}
      <Icon className="h-8 w-8" />
      <div className="text-center">
        <div className="font-medium">{action.label}</div>
        {action.description && (
          <div className="text-sm text-muted-foreground mt-1">
            {action.description}
          </div>
        )}
      </div>
    </button>
  );
}
