'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { Log } from '@/types/logs';
import { useLogs, useLogDetail } from '@/hooks/api/useLogs';
import { LogMonitorForm } from '@/components/logs/LogMonitorForm';
import { LogInfoCard } from '@/components/logs/LogInfoCard';

/**
 * Log Manage 페이지
 */
export default function LogManagePage() {
  const [selectedWorkload, setSelectedWorkload] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<string | null>(null);
  const [keyword, setKeyword] = useState('');
  const [searchParams, setSearchParams] = useState<{
    workloadId: string | null;
    serverId: string | null;
    keyword: string;
  }>({
    workloadId: null,
    serverId: null,
    keyword: '',
  });
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);

  const { logs, isLoading, refetch } = useLogs(searchParams);
  const { logDetail, isLoading: isDetailLoading } = useLogDetail(
    selectedLog ? `${selectedLog.labels.ns}-${selectedLog.labels.mci}-${selectedLog.labels.vm}` : null
  );

  const handleSearch = () => {
    setSearchParams({
      workloadId: selectedWorkload,
      serverId: selectedServer,
      keyword,
    });
  };

  // 테이블 컬럼 정의
  const columns: ColumnDef<Log>[] = [
    {
      accessorKey: 'labels.ns',
      header: 'NS',
      cell: ({ row }) => <div>{row.original.labels.ns || '-'}</div>,
    },
    {
      accessorKey: 'labels.mci',
      header: 'MCI',
      cell: ({ row }) => <div>{row.original.labels.mci || '-'}</div>,
    },
    {
      accessorKey: 'labels.vm',
      header: 'VM',
      cell: ({ row }) => <div>{row.original.labels.vm || '-'}</div>,
    },
    {
      accessorKey: 'labels.host',
      header: 'Host',
      cell: ({ row }) => <div>{row.original.labels.host || '-'}</div>,
    },
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => {
        const date = row.getValue('timestamp') as string;
        return <div>{date ? new Date(date).toLocaleString() : '-'}</div>;
      },
    },
    {
      accessorKey: 'value',
      header: 'Message',
      cell: ({ row }) => (
        <div className="max-w-md truncate">{row.getValue('value') || '-'}</div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <LogMonitorForm
        selectedWorkload={selectedWorkload}
        selectedServer={selectedServer}
        keyword={keyword}
        onWorkloadChange={setSelectedWorkload}
        onServerChange={setSelectedServer}
        onKeywordChange={setKeyword}
        onSearch={handleSearch}
      />

      <CrudPageTemplate
        data={logs}
        columns={columns}
        selectedItem={selectedLog}
        onItemSelect={setSelectedLog}
        onRefresh={refetch}
        isLoading={isLoading}
        detailComponent={(props) => (
          <LogInfoCard
            logDetail={logDetail || (props.item as unknown as LogDetail)}
            isLoading={isDetailLoading}
          />
        )}
        title="Logs"
        emptyMessage="Log가 없습니다. Workload와 Server를 선택한 후 Search 버튼을 클릭하세요."
        hideAddButton
        hideDeleteButton
      />
    </div>
  );
}
