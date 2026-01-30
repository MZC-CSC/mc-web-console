'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, Cloud, MapPin, Activity, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

/**
 * CloudInfoCard 컴포넌트
 *
 * 클라우드 연결 정보 카드
 * - 클라우드 프로바이더, 리전, 상태 표시
 * - 상태별 색상 구분
 * - 상세보기 링크
 *
 * @example
 * <CloudInfoCard
 *   provider="AWS"
 *   region="ap-northeast-2"
 *   status="connected"
 *   resourceCount={15}
 * />
 */

export type CloudConnectionStatus = 'connected' | 'disconnected' | 'error' | 'connecting';

export interface CloudInfoCardProps {
  /** 클라우드 프로바이더 */
  provider: string;
  /** 프로바이더 아이콘 (선택) */
  icon?: LucideIcon;
  /** 리전 */
  region: string;
  /** 연결 상태 */
  status: CloudConnectionStatus;
  /** 리소스 개수 (선택) */
  resourceCount?: number;
  /** 상세보기 URL (선택) */
  detailUrl?: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 추가 정보 */
  metadata?: Array<{ label: string; value: string | number }>;
  /** 추가 CSS 클래스 */
  className?: string;
}

const statusConfig: Record<CloudConnectionStatus, { label: string; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  connected: {
    label: '연결됨',
    color: 'text-green-600',
    variant: 'default',
  },
  disconnected: {
    label: '연결 안됨',
    color: 'text-gray-600',
    variant: 'secondary',
  },
  error: {
    label: '오류',
    color: 'text-red-600',
    variant: 'destructive',
  },
  connecting: {
    label: '연결 중',
    color: 'text-yellow-600',
    variant: 'outline',
  },
};

export function CloudInfoCard({
  provider,
  icon: Icon = Cloud,
  region,
  status,
  resourceCount,
  detailUrl,
  onClick,
  metadata,
  className,
}: CloudInfoCardProps) {
  const statusInfo = statusConfig[status];
  const isClickable = !!onClick || !!detailUrl;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (detailUrl) {
      window.open(detailUrl, '_blank');
    }
  };

  return (
    <Card
      className={cn(
        isClickable && 'cursor-pointer hover:bg-accent/50 transition-colors',
        className
      )}
      onClick={isClickable ? handleClick : undefined}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {provider}
        </CardTitle>
        <Badge variant={statusInfo.variant} className="text-xs">
          {statusInfo.label}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 리전 */}
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">리전:</span>
          <span className="font-medium">{region}</span>
        </div>

        {/* 리소스 개수 */}
        {resourceCount !== undefined && (
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">리소스:</span>
            <span className="font-medium">{resourceCount}개</span>
          </div>
        )}

        {/* 추가 메타데이터 */}
        {metadata && metadata.length > 0 && (
          <div className="space-y-1 pt-2 border-t">
            {metadata.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* 상세보기 링크 */}
        {detailUrl && (
          <div className="flex items-center gap-1 text-sm text-primary hover:underline pt-2">
            <span>상세보기</span>
            <ExternalLink className="h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
