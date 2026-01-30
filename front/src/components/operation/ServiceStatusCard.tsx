'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, Server, CheckCircle, XCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * ServiceStatusCard 컴포넌트
 *
 * 서비스 상태 카드
 * - 서비스 이름 및 상태
 * - 상태별 색상 구분 (Running/Stopped/Error/Starting)
 * - 간단한 메트릭 표시
 *
 * @example
 * <ServiceStatusCard
 *   name="Web Server"
 *   status="running"
 *   uptime="99.9%"
 *   responseTime="45ms"
 * />
 */

export type ServiceStatus = 'running' | 'stopped' | 'error' | 'starting' | 'stopping';

export interface ServiceStatusCardProps {
  /** 서비스 이름 */
  name: string;
  /** 서비스 설명 (선택) */
  description?: string;
  /** 서비스 아이콘 (선택) */
  icon?: LucideIcon;
  /** 서비스 상태 */
  status: ServiceStatus;
  /** 가동 시간/가용성 (선택) */
  uptime?: string;
  /** 응답 시간 (선택) */
  responseTime?: string;
  /** 요청 수 (선택) */
  requestCount?: number;
  /** 추가 메트릭 */
  metrics?: Array<{ label: string; value: string | number }>;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 CSS 클래스 */
  className?: string;
}

const statusConfig: Record<ServiceStatus, {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  badgeVariant: 'default' | 'secondary' | 'destructive' | 'outline';
}> = {
  running: {
    label: '실행 중',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    badgeVariant: 'default',
  },
  stopped: {
    label: '중지됨',
    icon: XCircle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    badgeVariant: 'secondary',
  },
  error: {
    label: '오류',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    badgeVariant: 'destructive',
  },
  starting: {
    label: '시작 중',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    badgeVariant: 'outline',
  },
  stopping: {
    label: '중지 중',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    badgeVariant: 'outline',
  },
};

export function ServiceStatusCard({
  name,
  description,
  icon: CustomIcon,
  status,
  uptime,
  responseTime,
  requestCount,
  metrics,
  onClick,
  className,
}: ServiceStatusCardProps) {
  const statusInfo = statusConfig[status];
  const StatusIcon = statusInfo.icon;
  const Icon = CustomIcon || Server;
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        isClickable && 'cursor-pointer hover:bg-accent/50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {name}
        </CardTitle>
        <div className={cn(
          'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
          statusInfo.bgColor,
          statusInfo.color
        )}>
          <StatusIcon className="h-3 w-3" />
          <span>{statusInfo.label}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 설명 */}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {/* 기본 메트릭 */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          {uptime !== undefined && (
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">가동률</div>
              <div className="font-medium">{uptime}</div>
            </div>
          )}
          {responseTime !== undefined && (
            <div className="space-y-1">
              <div className="text-muted-foreground text-xs">응답 시간</div>
              <div className="font-medium">{responseTime}</div>
            </div>
          )}
          {requestCount !== undefined && (
            <div className="space-y-1 col-span-2">
              <div className="text-muted-foreground text-xs">총 요청 수</div>
              <div className="font-medium">{requestCount.toLocaleString()}</div>
            </div>
          )}
        </div>

        {/* 추가 메트릭 */}
        {metrics && metrics.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            {metrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{metric.label}</span>
                <span className="font-medium">{metric.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
