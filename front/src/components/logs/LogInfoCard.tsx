'use client';

import { LogDetail } from '@/types/logs';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface LogInfoCardProps {
  logDetail: LogDetail | null;
  isLoading?: boolean;
}

/**
 * Log 상세 정보 카드 컴포넌트
 */
export function LogInfoCard({ logDetail, isLoading = false }: LogInfoCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner size="md" />
      </Card>
    );
  }

  if (!logDetail) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Log를 선택해주세요.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Log Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Timestamp</label>
          <p className="mt-1 text-sm">{new Date(logDetail.timestamp).toLocaleString()}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Measurement Name</label>
          <p className="mt-1 text-sm">{logDetail.measurementName || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Host</label>
          <p className="mt-1 text-sm">{logDetail.host || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">MCI ID</label>
          <p className="mt-1 text-sm">{logDetail.mciId || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">NS ID</label>
          <p className="mt-1 text-sm">{logDetail.nsId || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Path</label>
          <p className="mt-1 text-sm">{logDetail.path || '-'}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Target ID</label>
          <p className="mt-1 text-sm">{logDetail.targetId || '-'}</p>
        </div>
      </div>
    </Card>
  );
}
