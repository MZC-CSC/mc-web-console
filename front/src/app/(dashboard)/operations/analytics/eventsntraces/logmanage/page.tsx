'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { Log, LogDetail } from '@/types/logs';
import { useLogs, useLogDetail } from '@/hooks/api/useLogs';
import { LogMonitorForm } from '@/components/logs/LogMonitorForm';
import { LogInfoCard } from '@/components/logs/LogInfoCard';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';

/**
 * Log Manage 페이지
 * 
 * 화면 시작 시:
 * 1. 사용자에게 할당된 workspace 목록 조회
 * 2. workspace 선택 시 해당 workspace에 할당된 project 목록 조회
 * 3. project 선택 시 Log Workload 목록 조회 (nsId 사용)
 * 4. workspace/project 선택이 안 되어 있으면 사용자에게 알림
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
                ? 'Log Manage를 사용하려면 Workspace를 선택하세요.'
                : !selectedProjectId
                  ? 'Log Manage를 사용하려면 Project를 선택하세요.'
                  : ''}
            </span>
          </div>
        </Card>
      )}

      {/* Log Monitor 폼 및 목록 (Project 선택 시에만 표시) */}
      {isWorkspaceProjectSelected && (
        <>
          <LogMonitorForm
            selectedWorkload={selectedWorkload}
            selectedServer={selectedServer}
            keyword={keyword}
            onWorkloadChange={setSelectedWorkload}
            onServerChange={setSelectedServer}
            onKeywordChange={setKeyword}
            onSearch={handleSearch}
            nsId={nsId}
          />

          <CrudPageTemplate<Log>
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
        </>
      )}
    </div>
  );
}
