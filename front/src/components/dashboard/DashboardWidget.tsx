'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

/**
 * DashboardWidget 컴포넌트
 *
 * 대시보드 위젯 컨테이너 컴포넌트
 * - 일관된 레이아웃 제공
 * - 헤더 영역 (제목, 설명, 아이콘, 액션)
 * - 컨텐츠 영역
 *
 * @example
 * <DashboardWidget
 *   title="최근 활동"
 *   description="최근 24시간"
 *   icon={Activity}
 * >
 *   <ActivityFeed data={activities} />
 * </DashboardWidget>
 */
export interface DashboardWidgetProps {
  /** 위젯 제목 */
  title: string;
  /** 위젯 설명 (선택) */
  description?: string;
  /** 헤더 아이콘 (선택) */
  icon?: LucideIcon;
  /** 헤더 우측 액션 영역 (선택) */
  actions?: ReactNode;
  /** 위젯 컨텐츠 */
  children: ReactNode;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 컨텐츠 영역 패딩 제거 (차트 등에 사용) */
  noPadding?: boolean;
  /** 로딩 상태 */
  isLoading?: boolean;
}

export function DashboardWidget({
  title,
  description,
  icon: Icon,
  actions,
  children,
  className,
  noPadding = false,
  isLoading = false,
}: DashboardWidgetProps) {
  return (
    <Card className={cn('h-full flex flex-col', className)}>
      <CardHeader className="flex-shrink-0">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            {description && (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className={cn(
        'flex-1 overflow-auto',
        noPadding && 'p-0'
      )}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
