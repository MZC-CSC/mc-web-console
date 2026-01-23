'use client';

import { useState, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { MCIWorkload, MCICreateRequest } from '@/types/mci-workloads';
import {
  useMCIWorkloads,
  useMCIStatus,
  useServerStatus,
  useCreateMCIWorkload,
  useDeleteMCIWorkload,
} from '@/hooks/api/useMCIWorkloads';
import { MCIDashboard } from '@/components/mci-workloads/MCIDashboard';
import { MCICreateForm } from '@/components/mci-workloads/MCICreateForm';
import { WorkspaceProjectSelector } from '@/components/mci-workloads/WorkspaceProjectSelector';
import { useWorkspaceProjects } from '@/hooks/api/useProjects';
import { Card } from '@/components/ui/card';

/**
 * MCI Workloads 관리 페이지
 * 
 * 화면 시작 시:
 * 1. 사용자에게 할당된 workspace 목록 조회
 * 2. workspace 선택 시 해당 workspace에 할당된 project 목록 조회
 * 3. project 선택 시 MCI 목록 조회 (nsId 사용)
 * 4. workspace/project 선택이 안 되어 있으면 사용자에게 알림
 */
export default function MCIWorkloadsPage() {
  const [selectedWorkload, setSelectedWorkload] = useState<MCIWorkload | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // 선택된 project의 ns_id 조회
  const { projects } = useWorkspaceProjects(selectedWorkspaceId);
  const selectedProject = Array.isArray(projects)
    ? projects.find((p) => p.id === selectedProjectId)
    : undefined;
  const nsId = selectedProject?.ns_id;

  // Project가 선택되었을 때만 MCI 목록 조회
  const { workloads, isLoading, refetch } = useMCIWorkloads(nsId);
  const { mciStatus, isLoading: isStatusLoading } = useMCIStatus(nsId);
  const { serverStatus, isLoading: isServerStatusLoading } = useServerStatus(nsId);
  const createMutation = useCreateMCIWorkload();
  const deleteMutation = useDeleteMCIWorkload();

  // Workspace 변경 시 Project 선택 초기화
  useEffect(() => {
    if (selectedWorkspaceId) {
      setSelectedProjectId('');
    }
  }, [selectedWorkspaceId]);

  // 테이블 컬럼 정의 (참조 HTML과 일치)
  const columns: ColumnDef<MCIWorkload>[] = [
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusColors: Record<string, string> = {
          running: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          stopped: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          terminated: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
          failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          etc: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        };
        return (
          <div className="text-center">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                statusColors[status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {status}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'id',
      header: 'Id',
      cell: ({ row }) => <div className="text-sm">{row.getValue('id')}</div>,
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'providerImg',
      header: 'ProviderImg',
      cell: ({ row }) => {
        const providerImg = row.getValue('providerImg') as string | undefined;
        const provider = row.original.provider;
        if (providerImg) {
          return (
            <div className="flex justify-center">
              <img src={providerImg} alt={provider || 'Provider'} className="h-6 w-6" />
            </div>
          );
        }
        return <div className="text-center text-muted-foreground">-</div>;
      },
    },
    {
      accessorKey: 'statusCount.countTotal',
      header: 'Total Servers',
      cell: ({ row }) => {
        const count = row.original.statusCount?.countTotal ?? 0;
        return <div className="text-center">{count}</div>;
      },
    },
    {
      accessorKey: 'statusCount.countRunning',
      header: 'Running',
      cell: ({ row }) => {
        const count = row.original.statusCount?.countRunning ?? 0;
        return (
          <div className="text-center text-green-600 dark:text-green-400 font-semibold">
            {count}
          </div>
        );
      },
    },
    {
      accessorKey: 'statusCount.countSuspended',
      header: 'Suspended',
      cell: ({ row }) => {
        const count = row.original.statusCount?.countSuspended ?? 0;
        return (
          <div className="text-center text-yellow-600 dark:text-yellow-400 font-semibold">
            {count}
          </div>
        );
      },
    },
    {
      accessorKey: 'statusCount.countTerminated',
      header: 'Terminated',
      cell: ({ row }) => {
        const count = row.original.statusCount?.countTerminated ?? 0;
        return (
          <div className="text-center text-gray-600 dark:text-gray-400 font-semibold">
            {count}
          </div>
        );
      },
    },
    {
      accessorKey: 'statusCount.countFailed',
      header: 'Failed',
      cell: ({ row }) => {
        const count = row.original.statusCount?.countFailed ?? 0;
        return (
          <div className="text-center text-red-600 dark:text-red-400 font-semibold">
            {count}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const workload = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(workload);
              }}
              className="text-destructive hover:underline text-sm"
            >
              삭제
            </button>
          </div>
        );
      },
    },
  ];

  const handleAdd = () => {
    setIsCreateMode(true);
  };

  const handleCancelCreate = () => {
    setIsCreateMode(false);
  };

  const handleCreateSubmit = async (data: MCICreateRequest) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateMode(false);
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  };

  const handleDelete = async (workload: MCIWorkload) => {
    if (confirm(`정말로 "${workload.name}" MCI Workload를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync(workload.id);
        if (selectedWorkload?.id === workload.id) {
          setSelectedWorkload(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    setSelectedWorkspaceId(workspaceId);
  };

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
  };

  // Workspace/Project 선택 여부 확인
  const isWorkspaceProjectSelected = !!selectedWorkspaceId && !!selectedProjectId;

  return (
    <div className="space-y-6">
      {isCreateMode ? (
        <MCICreateForm
          onSubmit={handleCreateSubmit}
          onCancel={handleCancelCreate}
          isLoading={createMutation.isPending}
        />
      ) : (
        <>
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
                    ? 'MCI Workloads를 조회하려면 Workspace를 선택하세요.'
                    : !selectedProjectId
                      ? 'MCI Workloads를 조회하려면 Project를 선택하세요.'
                      : ''}
                </span>
              </div>
            </Card>
          )}

          {/* MCI Dashboard 및 목록 (Project 선택 시에만 표시) */}
          {isWorkspaceProjectSelected && (
            <>
              <MCIDashboard
                mciStatus={mciStatus}
                serverStatus={serverStatus}
                isLoading={isStatusLoading || isServerStatusLoading}
              />

              <CrudPageTemplate
                data={workloads}
                columns={columns}
                selectedItem={selectedWorkload}
                onItemSelect={setSelectedWorkload}
                onRefresh={refetch}
                isLoading={isLoading}
                onAdd={handleAdd}
                onDelete={handleDelete}
                title="MCI Workloads"
                addButtonLabel="MCI Workload 추가"
                emptyMessage="MCI Workload가 없습니다."
              />
            </>
          )}
        </>
      )}
    </div>
  );
}
