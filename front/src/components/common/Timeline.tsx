'use client';

import { cn } from '@/lib/utils';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  Circle,
  LucideIcon,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Timeline 컴포넌트
 *
 * 시간순 이벤트 타임라인
 * - 세로형 타임라인
 * - 아이콘 + 타임스탬프 + 제목 + 설명
 * - 타입별 색상 구분
 * - 확장/축소 지원
 *
 * @example
 * <Timeline
 *   items={[
 *     {
 *       id: '1',
 *       type: 'success',
 *       title: 'VM 생성 완료',
 *       description: 'web-server-01이 생성되었습니다',
 *       timestamp: new Date(),
 *     },
 *   ]}
 * />
 */

export type TimelineItemType = 'success' | 'error' | 'warning' | 'info' | 'default';

export interface TimelineItem {
  /** 아이템 ID */
  id: string;

  /** 타입 */
  type: TimelineItemType;

  /** 제목 */
  title: string;

  /** 설명 */
  description?: string;

  /** 타임스탬프 */
  timestamp: Date | string;

  /** 사용자 */
  user?: string;

  /** 리소스 */
  resource?: string;

  /** 커스텀 아이콘 */
  icon?: LucideIcon;

  /** 추가 컨텐츠 */
  content?: React.ReactNode;

  /** 메타데이터 */
  metadata?: Record<string, any>;
}

export interface TimelineProps {
  /** 타임라인 아이템 목록 */
  items: TimelineItem[];

  /** 확장/축소 가능 여부 */
  collapsible?: boolean;

  /** 초기 표시 개수 (collapsible일 때) */
  initialCount?: number;

  /** 시간 포맷 */
  timeFormat?: 'relative' | 'absolute' | 'both';

  /** 추가 CSS 클래스 */
  className?: string;
}

interface TimelineItemConfig {
  icon: LucideIcon;
  iconColor: string;
  lineColor: string;
}

const TIMELINE_CONFIG: Record<TimelineItemType, TimelineItemConfig> = {
  success: {
    icon: CheckCircle2,
    iconColor: 'text-green-600 dark:text-green-400',
    lineColor: 'bg-green-200 dark:bg-green-800',
  },
  error: {
    icon: XCircle,
    iconColor: 'text-red-600 dark:text-red-400',
    lineColor: 'bg-red-200 dark:bg-red-800',
  },
  warning: {
    icon: AlertCircle,
    iconColor: 'text-yellow-600 dark:text-yellow-400',
    lineColor: 'bg-yellow-200 dark:bg-yellow-800',
  },
  info: {
    icon: Info,
    iconColor: 'text-blue-600 dark:text-blue-400',
    lineColor: 'bg-blue-200 dark:bg-blue-800',
  },
  default: {
    icon: Circle,
    iconColor: 'text-muted-foreground',
    lineColor: 'bg-border',
  },
};

export function Timeline({
  items,
  collapsible = false,
  initialCount = 5,
  timeFormat = 'relative',
  className,
}: TimelineProps) {
  const [expanded, setExpanded] = useState(false);

  const displayItems = collapsible && !expanded
    ? items.slice(0, initialCount)
    : items;

  const hasMore = collapsible && items.length > initialCount;

  return (
    <div className={cn('space-y-0', className)}>
      {displayItems.map((item, index) => {
        const isLast = index === displayItems.length - 1 && (!hasMore || expanded);
        return (
          <TimelineItemComponent
            key={item.id}
            item={item}
            isLast={isLast}
            timeFormat={timeFormat}
          />
        );
      })}

      {hasMore && !expanded && (
        <div className="flex items-center gap-4 py-4">
          <div className="flex flex-col items-center w-8">
            <div className="w-0.5 h-4 bg-border" />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(true)}
            className="text-sm"
          >
            <ChevronDown className="h-4 w-4 mr-1" />
            {items.length - initialCount}개 더 보기
          </Button>
        </div>
      )}

      {hasMore && expanded && (
        <div className="flex items-center gap-4 py-4">
          <div className="w-8" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpanded(false)}
            className="text-sm"
          >
            <ChevronUp className="h-4 w-4 mr-1" />
            접기
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * TimelineItem 내부 컴포넌트
 */
interface TimelineItemComponentProps {
  item: TimelineItem;
  isLast: boolean;
  timeFormat: 'relative' | 'absolute' | 'both';
}

function TimelineItemComponent({
  item,
  isLast,
  timeFormat,
}: TimelineItemComponentProps) {
  const config = TIMELINE_CONFIG[item.type];
  const Icon = item.icon || config.icon;

  const timestamp = typeof item.timestamp === 'string'
    ? new Date(item.timestamp)
    : item.timestamp;

  const relativeTime = formatDistanceToNow(timestamp, {
    addSuffix: true,
    locale: ko,
  });

  const absoluteTime = format(timestamp, 'yyyy-MM-dd HH:mm:ss');

  return (
    <div className="flex gap-4 group">
      {/* 좌측: 아이콘 + 연결선 */}
      <div className="flex flex-col items-center">
        {/* 아이콘 */}
        <div
          className={cn(
            'flex items-center justify-center w-8 h-8 rounded-full bg-background border-2',
            config.iconColor,
            'border-current'
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        {/* 연결선 */}
        {!isLast && (
          <div className={cn('w-0.5 flex-1 min-h-[40px]', config.lineColor)} />
        )}
      </div>

      {/* 우측: 내용 */}
      <div className="flex-1 pb-8">
        {/* 제목 + 타임스탬프 */}
        <div className="flex items-start justify-between gap-4 mb-1">
          <h4 className="font-medium text-sm">{item.title}</h4>
          <time className="text-xs text-muted-foreground whitespace-nowrap">
            {timeFormat === 'relative' && relativeTime}
            {timeFormat === 'absolute' && absoluteTime}
            {timeFormat === 'both' && (
              <span title={absoluteTime}>{relativeTime}</span>
            )}
          </time>
        </div>

        {/* 설명 */}
        {item.description && (
          <p className="text-sm text-muted-foreground mb-2">
            {item.description}
          </p>
        )}

        {/* 메타데이터 (사용자, 리소스) */}
        {(item.user || item.resource) && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
            {item.user && <span>사용자: {item.user}</span>}
            {item.resource && <span>리소스: {item.resource}</span>}
          </div>
        )}

        {/* 추가 컨텐츠 */}
        {item.content && (
          <div className="mt-2">{item.content}</div>
        )}
      </div>
    </div>
  );
}

/**
 * CompactTimeline 컴포넌트
 *
 * 더 간결한 타임라인 (아이콘 없음)
 */
export interface CompactTimelineProps {
  items: TimelineItem[];
  className?: string;
}

export function CompactTimeline({ items, className }: CompactTimelineProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item) => {
        const timestamp = typeof item.timestamp === 'string'
          ? new Date(item.timestamp)
          : item.timestamp;

        const relativeTime = formatDistanceToNow(timestamp, {
          addSuffix: true,
          locale: ko,
        });

        return (
          <div
            key={item.id}
            className="flex items-start gap-3 text-sm py-1 border-b last:border-b-0"
          >
            <time className="text-xs text-muted-foreground whitespace-nowrap min-w-[80px]">
              {relativeTime}
            </time>
            <div className="flex-1">
              <span className="font-medium">{item.title}</span>
              {item.description && (
                <span className="text-muted-foreground ml-2">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * ActivityTimeline 컴포넌트
 *
 * ActivityFeed와 비슷하지만 Timeline 형식
 */
export interface ActivityTimelineProps {
  items: TimelineItem[];
  maxItems?: number;
  className?: string;
}

export function ActivityTimeline({
  items,
  maxItems = 10,
  className,
}: ActivityTimelineProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Timeline
      items={displayItems}
      collapsible={items.length > maxItems}
      initialCount={maxItems}
      timeFormat="relative"
      className={className}
    />
  );
}
