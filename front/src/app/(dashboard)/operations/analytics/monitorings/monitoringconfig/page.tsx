'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { MonitoringServer, MonitoringConfigDetail } from '@/types/monitoring';
import { useMonitoringServers, useMonitoringConfigDetail } from '@/hooks/api/useMonitoringConfig';
import { MonitorSettingForm } from '@/components/monitoring-config/MonitorSettingForm';
import { MonitoringConfigInfoCard } from '@/components/monitoring-config/MonitoringConfigInfoCard';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';

/**
 * Monitoring Config 페이지
 * 
 * 화면 시작 시:
 * 1. 사용자에게 할당된 workspace 목록 조회
 * 2. workspace 선택 시 해당 workspace에 할당된 project 목록 조회
 * 3. project 선택 시 Monitoring Workload 목록 조회 (nsId 사용)
 * 4. workspace/project 선택이 안 되어 있으면 사용자에게 알림
 */
export default function MonitoringConfigPage() {
  const [selectedWorkload, setSelectedWorkload] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<MonitoringServer | null>(null);

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

  const { servers, isLoading, refetch } = useMonitoringServers(selectedWorkload);
  const { configDetail, isLoading: isDetailLoading } = useMonitoringConfigDetail(
    selectedServer?.id || null
  );

  // 테이블 컬럼 정의
  const columns: ColumnDef<MonitoringServer>[] = [
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => <div>{row.getValue('type') || '-'}</div>,
    },
    {
      accessorKey: 'workloadName',
      header: 'Workload',
      cell: ({ row }) => <div>{row.getValue('workloadName') || '-'}</div>,
    },
    {
      accessorKey: 'id',
      header: 'Id',
      cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'monitoringAgentStatus',
      header: 'Monitoring Agent Status',
      cell: ({ row }) => {
        const status = row.getValue('monitoringAgentStatus') as string;
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status || '-'}
          </span>
        );
      },
    },
    {
      accessorKey: 'logAgentStatus',
      header: 'Log Agent Status',
      cell: ({ row }) => {
        const status = row.getValue('logAgentStatus') as string;
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              status === 'active'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {status || '-'}
          </span>
        );
      },
    },
  ];

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
                ? 'Monitoring Config를 사용하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'Monitoring Config를 사용하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Monitoring 설정 및 서버 목록 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
          <MonitorSettingForm
            selectedWorkload={selectedWorkload}
            onWorkloadChange={setSelectedWorkload}
            nsId={nsId}
          />

          <CrudPageTemplate
            data={servers}
            columns={columns}
            selectedItem={selectedServer}
            onItemSelect={setSelectedServer}
            onRefresh={refetch}
            isLoading={isLoading}
            detailComponent={(props) => (
              <MonitoringConfigInfoCard
                configDetail={configDetail || (props.item as unknown as MonitoringConfigDetail)}
                isLoading={isDetailLoading}
              />
            )}
            title="Servers"
            emptyMessage={
              selectedWorkload
                ? 'Server가 없습니다.'
                : 'Workload를 선택해주세요.'
            }
            hideAddButton
            hideDeleteButton
          />
        </>
      )}
    </div>
  );
}
