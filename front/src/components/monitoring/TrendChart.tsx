'use client';

import { Card } from '@/components/ui/card';
import { MonitoringDataPoint } from '@/types/mcis-monitoring';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface TrendChartProps {
  data: MonitoringDataPoint[];
  isLoading?: boolean;
}

/**
 * Trend Graph 차트 컴포넌트
 * TODO: 차트 라이브러리 연동 필요 (Recharts 등)
 */
export function TrendChart({ data, isLoading = false }: TrendChartProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="h-[400px] flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-6">
        <div className="h-[400px] flex items-center justify-center text-muted-foreground">
          데이터가 없습니다. Monitoring을 시작해주세요.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h4 className="text-md font-semibold mb-4">Trend Graph</h4>
      <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/50">
        <div className="text-center text-muted-foreground">
          <p className="text-sm">차트 라이브러리 연동 필요</p>
          <p className="text-xs mt-2">데이터 포인트: {data.length}개</p>
        </div>
      </div>
    </Card>
  );
}
