'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { CrudPageTemplate } from '@/components/templates/CrudPageTemplate';
import { PMKCluster, PMKClusterCreateRequest } from '@/types/pmk-workloads';
import {
  usePMKClusters,
  useCreatePMKCluster,
  useDeletePMKCluster,
} from '@/hooks/api/usePMKWorkloads';
import { ClusterCreateForm } from '@/components/pmk-workloads/ClusterCreateForm';
import { WorkspaceProjectSelector } from '@/components/common/WorkspaceProjectSelector';
import { useWorkspaceProjectSelection } from '@/hooks/useWorkspaceProjectSelection';
import { Card } from '@/components/ui/card';

/**
 * PMK Workloads 관리 페이지
 * 
 * 화면 시작 시:
 * 1. 사용자에게 할당된 workspace 목록 조회
 * 2. workspace 선택 시 해당 workspace에 할당된 project 목록 조회
 * 3. project 선택 시 PMK Cluster 목록 조회 (nsId 사용)
 * 4. workspace/project 선택이 안 되어 있으면 사용자에게 알림
 */
export default function PMKWorkloadsPage() {
  const [selectedCluster, setSelectedCluster] = useState<PMKCluster | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Workspace/Project 선택 및 복원 (공통 Hook 사용)
  const {
    selectedWorkspaceId,
    selectedProjectId,
    selectedProject,
    isWorkspaceProjectSelected,
    isRestored, // 복원 완료 상태 추가
    handleWorkspaceChange,
    handleProjectChange,
  } = useWorkspaceProjectSelection();

  // 선택된 project의 nsid 조회
  const nsId = selectedProject?.nsid;

  // 디버깅용 로그
  console.log('[PMK Workloads] Debug Info:', {
    selectedWorkspaceId,
    selectedProjectId,
    selectedProject,
    nsId,
    isWorkspaceProjectSelected,
    isRestored,
  });

  console.log('[PMK Workloads] shouldFetch calculation:', {
    isRestored,
    isWorkspaceProjectSelected,
    hasNsId: !!nsId,
    finalNsId: nsId,
  });

  // Project가 선택되었을 때만 PMK Cluster 목록 조회
  // nsId를 항상 전달하고, Hook 내부의 enabled 옵션으로 제어
  const { clusters, isLoading, refetch } = usePMKClusters(nsId);
  const createMutation = useCreatePMKCluster();
  const deleteMutation = useDeletePMKCluster();

  // 테이블 컬럼 정의
  const columns: ColumnDef<PMKCluster>[] = [
    {
      accessorKey: 'name',
      header: '이름',
      cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>,
    },
    {
      accessorKey: 'description',
      header: '설명',
      cell: ({ row }) => (
        <div className="text-muted-foreground">{row.getValue('description') || '-'}</div>
      ),
    },
    {
      accessorKey: 'version',
      header: '버전',
      cell: ({ row }) => <div>{row.getValue('version') || '-'}</div>,
    },
    {
      accessorKey: 'status',
      header: '상태',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusColors: Record<string, string> = {
          running: 'bg-green-100 text-green-800',
          stopped: 'bg-yellow-100 text-yellow-800',
          terminated: 'bg-gray-100 text-gray-800',
          failed: 'bg-red-100 text-red-800',
          etc: 'bg-blue-100 text-blue-800',
        };
        return (
          <span
            className={`px-2 py-1 rounded text-xs ${
              statusColors[status] || 'bg-gray-100 text-gray-800'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: '생성일',
      cell: ({ row }) => {
        const date = row.getValue('createdAt') as string | undefined;
        return <div>{date ? new Date(date).toLocaleString() : '-'}</div>;
      },
    },
    {
      id: 'actions',
      header: '작업',
      cell: ({ row }) => {
        const cluster = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(cluster);
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

  const handleCreateSubmit = async (data: PMKClusterCreateRequest) => {
    try {
      await createMutation.mutateAsync(data);
      setIsCreateMode(false);
    } catch (error) {
      console.error('Create error:', error);
      throw error;
    }
  };

  const handleDelete = async (cluster: PMKCluster) => {
    if (confirm(`정말로 "${cluster.name}" PMK Cluster를 삭제하시겠습니까?`)) {
      try {
        await deleteMutation.mutateAsync(cluster.id);
        if (selectedCluster?.id === cluster.id) {
          setSelectedCluster(null);
        }
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {isCreateMode ? (
        <ClusterCreateForm
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
                    ? 'PMK Workloads를 조회하려면 Workspace를 선택하세요.'
                    : !selectedProjectId
                      ? 'PMK Workloads를 조회하려면 Project를 선택하세요.'
                      : ''}
                </span>
              </div>
            </Card>
          )}

          {/* PMK Cluster 목록 (Project 선택 시에만 표시) */}
          {isWorkspaceProjectSelected && (
            <CrudPageTemplate
              data={clusters}
              columns={columns}
              selectedItem={selectedCluster}
              onItemSelect={setSelectedCluster}
              onRefresh={refetch}
              isLoading={isLoading}
              onAdd={handleAdd}
              onDelete={handleDelete}
              title="PMK Workloads"
              addButtonLabel="PMK Cluster 추가"
              emptyMessage="PMK Cluster가 없습니다."
            />
          )}
        </>
      )}
    </div>
  );
}
