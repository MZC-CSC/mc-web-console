'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { MonitoringConfig } from '@/types/mcis-monitoring';
import { MonitoringConfigForm } from '@/components/monitoring/MonitoringConfigForm';
import { TrendChart } from '@/components/monitoring/TrendChart';
import { DetectionChart } from '@/components/monitoring/DetectionChart';
import { useMonitoringData } from '@/hooks/api/useMCIsMonitoring';
import { useMCIsServers } from '@/hooks/api/useMCIsMonitoring';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';

/**
 * MCIs Monitoring 페이지
 * 
 * 화면 시작 시:
 * 1. 사용자에게 할당된 workspace 목록 조회
 * 2. workspace 선택 시 해당 workspace에 할당된 project 목록 조회
 * 3. project 선택 시 MCIs Workload 목록 조회 (nsId 사용)
 * 4. workspace/project 선택이 안 되어 있으면 사용자에게 알림
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

  // Workspace/Project 선택 및 복원 (공통 Hook 사용)
  const {
    selectedWorkspaceId,
    selectedProjectId,
    selectedProject,
    isWorkspaceProjectSelected,
    handleWorkspaceChange,
    handleProjectChange,
  } = useWorkspaceProjectSelection();

  // 선택된 project의 ns_id 조회
  const nsId = selectedProject?.nsid;

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
      {/* Workspace/Project 선택 */}
      <Card className="p-6">
        <WorkspaceProjectSelector
          selectedWorkspaceId={selectedWorkspaceId}
          selectedProjectId={selectedProjectId}
          onWorkspaceChange={handleWorkspaceChange}
          onProjectChange={handleProjectChange}
        />
      </Card>

      {/* Workspace/Project 선택 안내 */}
      {!isWorkspaceProjectSelected && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">안내:</span>
            <span>
              {!selectedWorkspaceId
                ? 'MCIs Monitoring을 사용하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'MCIs Monitoring을 사용하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Monitoring 설정 폼 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
          <MonitoringConfigForm
            config={config}
            onConfigChange={handleConfigChange}
            onStartMonitoring={handleStartMonitoring}
            isMonitoring={isMonitoring}
            nsId={nsId}
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
        </>
      )}
    </div>
  );
}
