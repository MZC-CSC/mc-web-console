'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { MonitoringServer, MonitoringConfigDetail } from '@/types/monitoring';
import { useMonitoringServers, useMonitoringConfigDetail } from '@/hooks/api/useMonitoringConfig';
import { MonitorSettingForm } from '@/components/monitoring-config/MonitorSettingForm';
import { MonitoringConfigInfoCard } from '@/components/monitoring-config/MonitoringConfigInfoCard';

/**
 * Monitoring Config 페이지
 */
export default function MonitoringConfigPage() {
  const [selectedWorkload, setSelectedWorkload] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<MonitoringServer | null>(null);

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
      <MonitorSettingForm
        selectedWorkload={selectedWorkload}
        onWorkloadChange={setSelectedWorkload}
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
    </div>
  );
}
