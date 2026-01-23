'use client';

import { AlarmDetail } from '@/types/alarms';
import { Card } from '@/components/ui/card';

interface AlarmDetailTabProps {
  alarm: AlarmDetail;
}

/**
 * Alarm Detail 탭 컴포넌트
 */
export function AlarmDetailTab({ alarm }: AlarmDetailTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          <p className="mt-1 text-sm">{alarm.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <p className="mt-1 text-sm">{alarm.status}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Measurement</label>
          <p className="mt-1 text-sm">{alarm.measurement}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Metric</label>
          <p className="mt-1 text-sm">{alarm.metric}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Statistics</label>
          <p className="mt-1 text-sm">{alarm.statistics}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Value</label>
          <p className="mt-1 text-sm">{alarm.value}</p>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-muted-foreground">Description</label>
        <p className="mt-1 text-sm">{alarm.description || '-'}</p>
      </div>
    </div>
  );
}
