'use client';

import { EventAlarm } from '@/types/alarms';
import { Card } from '@/components/ui/card';

interface EventInfoCardProps {
  event: EventAlarm;
}

/**
 * Event 상세 정보 카드 컴포넌트
 */
export function EventInfoCard({ event }: EventInfoCardProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Event Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Policy Seq</label>
          <p className="mt-1 text-sm">{event.policySeq}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Occur Time</label>
          <p className="mt-1 text-sm">{new Date(event.occurTime).toLocaleString()}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Metric</label>
          <p className="mt-1 text-sm">{event.metric}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Hostname</label>
          <p className="mt-1 text-sm">{event.hostname}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Level</label>
          <p className="mt-1 text-sm">{event.level}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Created At</label>
          <p className="mt-1 text-sm">{new Date(event.createdAt).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-4">
        <label className="text-sm font-medium text-muted-foreground">Data</label>
        <pre className="mt-1 p-3 bg-muted rounded-md text-xs overflow-auto">
          {typeof event.data === 'string' ? event.data : JSON.stringify(event.data, null, 2)}
        </pre>
      </div>
    </Card>
  );
}
