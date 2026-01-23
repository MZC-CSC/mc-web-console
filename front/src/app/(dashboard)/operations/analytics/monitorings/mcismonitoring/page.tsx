'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MonitoringConfig } from '@/types/mcis-monitoring';
import { MonitoringConfigForm } from '@/components/monitoring/MonitoringConfigForm';
import { TrendChart } from '@/components/monitoring/TrendChart';
import { DetectionChart } from '@/components/monitoring/DetectionChart';
import { useMonitoringData } from '@/hooks/api/useMCIsMonitoring';
import { useMCIsServers } from '@/hooks/api/useMCIsMonitoring';

/**
 * MCIs Monitoring 페이지
 */
export default function MCIsMonitoringPage() {
  const [config, setConfig] = useState<MonitoringConfig>({
    workload: null,
    server: null,
    measurement: null,
    metric: null,
    aggregation: null,
    range: null,
    period: null,
    prediction: null,
    extendPrediction: false,
    extendDetection: false,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  const { monitoringData, isLoading: isDataLoading } = useMonitoringData({
    workload: config.workload,
    server: config.server,
    measurement: config.measurement,
    metric: config.metric,
    range: config.range,
    period: config.period,
  });

  const { servers } = useMCIsServers(config.workload);
  const selectedServer = servers.find((s) => s.id === config.server);

  const handleConfigChange = (partialConfig: Partial<MonitoringConfig>) => {
    setConfig((prev) => ({ ...prev, ...partialConfig }));
  };

  const handleStartMonitoring = () => {
    setIsMonitoring(true);
    // TODO: 실제 모니터링 시작 API 호출
  };

  return (
    <div className="space-y-6">
      <MonitoringConfigForm
        config={config}
        onConfigChange={handleConfigChange}
        onStartMonitoring={handleStartMonitoring}
        isMonitoring={isMonitoring}
      />

      {isMonitoring && (
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold">
              Selected VM:{' '}
              <span className="text-primary">{selectedServer?.name || '-'}</span>
            </h3>
          </div>

          <div className="space-y-6">
            <TrendChart data={monitoringData.trend} isLoading={isDataLoading} />

            {config.extendDetection && (
              <DetectionChart
                data={monitoringData.detection || []}
                isLoading={isDataLoading}
              />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
