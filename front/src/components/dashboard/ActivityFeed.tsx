'use client';

import { LucideIcon, Activity, Server, Cloud, AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * ActivityFeed 컴포넌트
 *
 * 최근 활동을 타임라인 형식으로 표시
 * - 활동 타입별 아이콘 및 색상
 * - 상대적 시간 표시
 * - 필터링 지원
 *
 * @example
 * <ActivityFeed
 *   activities={[
 *     { id: '1', type: 'success', message: 'VM 생성 완료', timestamp: new Date() }
 *   ]}
 * />
 */

export type ActivityType = 'success' | 'error' | 'warning' | 'info' | 'server' | 'cloud';

export interface Activity {
  /** 활동 ID */
  id: string;
  /** 활동 타입 */
  type: ActivityType;
  /** 활동 메시지 */
  message: string;
  /** 활동 설명 (선택) */
  description?: string;
  /** 활동 시각 */
  timestamp: Date | string;
  /** 관련 사용자 (선택) */
  user?: string;
  /** 관련 리소스 (선택) */
  resource?: string;
}

export interface ActivityFeedProps {
  /** 활동 목록 */
  activities: Activity[];
  /** 최대 표시 개수 */
  maxItems?: number;
  /** 타입 필터 */
  filterType?: ActivityType;
  /** 빈 상태 메시지 */
  emptyMessage?: string;
  /** 추가 CSS 클래스 */
  className?: string;
  /** 더보기 클릭 핸들러 */
  onLoadMore?: () => void;
  /** 더보기 버튼 표시 여부 */
  showLoadMore?: boolean;
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; color: string; bgColor: string }> = {
  success: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
  },
  info: {
    icon: Info,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
  server: {
    icon: Server,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
  },
  cloud: {
    icon: Cloud,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
  },
};

export function ActivityFeed({
  activities,
  maxItems,
  filterType,
  emptyMessage = '최근 활동이 없습니다.',
  className,
  onLoadMore,
  showLoadMore = false,
}: ActivityFeedProps) {
  // 필터링
  let filteredActivities = filterType
    ? activities.filter((activity) => activity.type === filterType)
    : activities;

  // 최대 개수 제한
  if (maxItems) {
    filteredActivities = filteredActivities.slice(0, maxItems);
  }

  if (filteredActivities.length === 0) {
    return (
      <div className={cn('flex items-center justify-center py-8', className)}>
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="space-y-3">
        {filteredActivities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;
          const timestamp = typeof activity.timestamp === 'string'
            ? new Date(activity.timestamp)
            : activity.timestamp;

          // 유효한 Date 객체인지 확인
          const isValidDate = timestamp instanceof Date && !isNaN(timestamp.getTime());
          const displayTimestamp = isValidDate ? timestamp : new Date();

          return (
            <div key={activity.id} className="flex gap-3 group">
              {/* 아이콘 */}
              <div className={cn(
                'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                config.bgColor
              )}>
                <Icon className={cn('h-4 w-4', config.color)} />
              </div>

              {/* 컨텐츠 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.message}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <time dateTime={displayTimestamp.toISOString()}>
                        {formatDistanceToNow(displayTimestamp, { addSuffix: true, locale: ko })}
                      </time>
                      {activity.user && (
                        <>
                          <span>•</span>
                          <span>{activity.user}</span>
                        </>
                      )}
                      {activity.resource && (
                        <>
                          <span>•</span>
                          <span className="font-mono">{activity.resource}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showLoadMore && onLoadMore && (
        <button
          onClick={onLoadMore}
          className="w-full py-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          더보기
        </button>
      )}
    </div>
  );
}
