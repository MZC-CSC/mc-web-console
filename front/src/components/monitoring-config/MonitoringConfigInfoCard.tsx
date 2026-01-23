'use client';

import { MonitoringConfigDetail } from '@/types/monitoring';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DetailsTab } from './DetailsTab';
import { MetricsTab } from './MetricsTab';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface MonitoringConfigInfoCardProps {
  configDetail: MonitoringConfigDetail | null;
  isLoading?: boolean;
}

/**
 * Monitoring Config 상세 정보 카드 컴포넌트
 */
export function MonitoringConfigInfoCard({
  configDetail,
  isLoading = false,
}: MonitoringConfigInfoCardProps) {
  if (isLoading) {
    return (
      <Card className="p-6">
        <LoadingSpinner size="md" />
      </Card>
    );
  }

  if (!configDetail) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">Server를 선택해주세요.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        <TabsContent value="details" className="mt-4">
          <DetailsTab configDetail={configDetail} />
        </TabsContent>
        <TabsContent value="metrics" className="mt-4">
          <MetricsTab serverId={configDetail.serverId} />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
