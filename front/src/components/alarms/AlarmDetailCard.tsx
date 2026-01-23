'use client';

import { AlarmDetail } from '@/types/alarms';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlarmDetailTab } from './AlarmDetailTab';
import { EventAlarmsTab } from './EventAlarmsTab';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface AlarmDetailCardProps {
  alarm: AlarmDetail | null;
  isLoading?: boolean;
}

/**
 * Alarm 상세 정보 카드 컴포넌트
 */
export function AlarmDetailCard({ alarm, isLoading = false }: AlarmDetailCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner size="md" />
      </Card>
    );
  }

  if (!alarm) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Alarm을 선택해주세요.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="detail" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detail">Detail</TabsTrigger>
          <TabsTrigger value="event-alarms">Event & Alarms</TabsTrigger>
        </TabsList>
        <TabsContent value="detail" className="mt-4">
          <AlarmDetailTab alarm={alarm} />
        </TabsContent>
        <TabsContent value="event-alarms" className="mt-4">
          <EventAlarmsTab policySeq={alarm.seq} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
